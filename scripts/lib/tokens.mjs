/**
 * Token loader shared by the build and the validators.
 *
 * - Reads every DTCG-style JSON file under tokens/src (primitive, semantic,
 *   component) into one tree, then applies theme override files.
 * - Flattens groups into tokens with dotted paths, inheriting `$type` and the
 *   `$extensions.up` metadata from ancestor groups.
 * - Resolves `{alias.path}` references recursively, including references inside
 *   composite values (typography, shadow).
 * - Walks alias chains so that a token's status can be checked against, and reported as,
 *   the weakest status it resolves through.
 *
 * Dependency-free; Node 22 or newer.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const TIERS = ["primitive", "semantic", "component"];
export const RESERVED = new Set(["$type", "$value", "$description", "$extensions", "$schema", "$deprecated"]);

/** Recursively list JSON files under a directory (sorted for determinism). */
export function listJsonFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith(".json")) out.push(p);
    }
  };
  walk(dir);
  return out;
}

export function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`${file}: ${err.message}`);
  }
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Deep merge b into a (objects only; arrays and scalars are replaced). */
export function deepMerge(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = isObject(v) && isObject(out[k]) ? deepMerge(out[k], v) : v;
  }
  return out;
}

/**
 * Apply a theme file on top of the base tree and return the dotted paths it overrides.
 *
 * A theme node with `$value` replaces the base token's value. Its metadata is composed from the
 * base token's metadata, then the theme file's group-level metadata from the root down to the
 * token's parent, then the token's own theme metadata. The theme file therefore wins over the
 * base file at every level: a group-level status in the theme applies to every token the theme
 * overrides, even when the base token declared its own status. Group-level metadata in the theme
 * is never merged into the base groups, so tokens the theme does not override keep their base
 * metadata untouched.
 */
export function applyThemeOverrides(tree, overrides) {
  const overridden = [];
  const walk = (node, path, inheritedType, inheritedUp) => {
    const type = node.$type ?? inheritedType;
    const up = { ...inheritedUp, ...(node.$extensions?.up ?? {}) };
    if ("$value" in node) {
      const parentPath = path.slice(0, -1);
      let parent = tree;
      for (const k of parentPath) {
        if (!isObject(parent[k])) parent[k] = {};
        parent = parent[k];
      }
      const key = path[path.length - 1];
      const base = isObject(parent[key]) ? parent[key] : {};
      const { $extensions: _themeExt, ...rest } = node;
      parent[key] = {
        ...base,
        ...rest,
        ...(type && !node.$type && !base.$type ? { $type: type } : {}),
        $extensions: { ...(base.$extensions ?? {}), up: { ...(base.$extensions?.up ?? {}), ...up } },
      };
      overridden.push(path.join("."));
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      if (!isObject(v)) throw new Error(`Invalid theme node at ${[...path, k].join(".")}: expected an object`);
      walk(v, [...path, k], type, up);
    }
  };
  walk(overrides, [], undefined, {});
  return overridden;
}

/**
 * Load the token tree.
 * @param {string} root repository root
 * @param {{theme?: string}} opts theme name (default "light"); "dark" applies themes/dark.json
 * @returns {{tree: object, files: string[], metadata: object, overridden: Set<string>}}
 */
export function loadTree(root, opts = {}) {
  const src = join(root, "tokens", "src");
  const metadata = readJson(join(src, "$metadata.json"));
  const files = [];
  let tree = {};
  for (const tier of TIERS) {
    for (const file of listJsonFiles(join(src, tier))) {
      files.push(file);
      const json = readJson(file);
      for (const key of Object.keys(json)) {
        if (key.startsWith("$")) continue;
        if (tree[key] && !isObject(tree[key])) throw new Error(`${file}: top-level key "${key}" collides`);
        tree[key] = tree[key] ? deepMerge(tree[key], json[key]) : json[key];
      }
    }
  }
  const theme = opts.theme || "light";
  const themeDef = metadata.themes?.[theme];
  if (!themeDef) throw new Error(`Unknown theme "${theme}"`);
  const overridden = new Set();
  for (const rel of themeDef.overrides || []) {
    const file = join(src, rel);
    files.push(file);
    for (const path of applyThemeOverrides(tree, readJson(file))) overridden.add(path);
  }
  return { tree, files, metadata, overridden };
}

/**
 * Flatten a tree into a Map<path, token>. Each token carries: path, type,
 * value (raw, may contain aliases), description, up (effective metadata),
 * group (top-level group), tier guess.
 */
export function flatten(tree) {
  const tokens = new Map();
  const walk = (node, path, inheritedType, inheritedUp) => {
    const type = node.$type ?? inheritedType;
    const up = { ...inheritedUp, ...(node.$extensions?.up ?? {}) };
    if ("$value" in node) {
      const key = path.join(".");
      if (tokens.has(key)) throw new Error(`Duplicate token path ${key}`);
      tokens.set(key, {
        path: key,
        segments: path,
        type,
        value: node.$value,
        description: node.$description ?? "",
        up,
        deprecated: node.$deprecated ?? up.deprecated ?? false,
      });
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      if (!isObject(v)) throw new Error(`Invalid node at ${[...path, k].join(".")}: expected an object`);
      walk(v, [...path, k], type, up);
    }
  };
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith("$")) continue;
    walk(v, [k], undefined, {});
  }
  return tokens;
}

export const ALIAS_RE = /^\{([a-z0-9][a-z0-9.-]*)\}$/i;

/** Collect alias references inside a value (string or composite). */
export function collectAliases(value, acc = []) {
  if (typeof value === "string") {
    const m = value.match(ALIAS_RE);
    if (m) acc.push(m[1]);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectAliases(v, acc));
  } else if (isObject(value)) {
    Object.values(value).forEach((v) => collectAliases(v, acc));
  }
  return acc;
}

/**
 * Resolve all aliases. Returns {resolved: Map<path, token & {resolved, aliasOf}>, errors: string[]}.
 */
export function resolveAll(tokens) {
  const errors = [];
  const cache = new Map();
  const resolveValue = (value, stack) => {
    if (typeof value === "string") {
      const m = value.match(ALIAS_RE);
      if (!m) return value;
      const target = m[1];
      if (stack.includes(target)) {
        errors.push(`Circular alias: ${[...stack, target].join(" -> ")}`);
        return value;
      }
      const t = tokens.get(target);
      if (!t) {
        errors.push(`Unresolved alias {${target}} referenced from ${stack[stack.length - 1] ?? "?"}`);
        return value;
      }
      return resolveToken(t, [...stack, target]);
    }
    if (Array.isArray(value)) return value.map((v) => resolveValue(v, stack));
    if (isObject(value)) {
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k] = resolveValue(v, stack);
      return out;
    }
    return value;
  };
  const resolveToken = (token, stack) => {
    if (cache.has(token.path)) return cache.get(token.path);
    const v = resolveValue(token.value, stack.length ? stack : [token.path]);
    cache.set(token.path, v);
    return v;
  };
  const resolved = new Map();
  for (const t of tokens.values()) {
    const value = resolveToken(t, [t.path]);
    const aliases = collectAliases(t.value);
    let type = t.type;
    if (!type && aliases.length === 1 && typeof t.value === "string") {
      type = tokens.get(aliases[0])?.type;
    }
    resolved.set(t.path, { ...t, type, resolved: value, aliasOf: aliases.length === 1 && typeof t.value === "string" ? aliases[0] : null });
  }
  return { resolved, errors: [...new Set(errors)] };
}

/** Build the resolved token set for a theme. `overridden` lists the paths the theme file overrides. */
export function buildTheme(root, theme) {
  const { tree, files, metadata, overridden } = loadTree(root, { theme });
  const flat = flatten(tree);
  const { resolved, errors } = resolveAll(flat);
  return { tree, files, metadata, flat, resolved, errors, overridden };
}

/** Status rank, weakest last. A token's status may never outrank the weakest status it resolves through. */
export const STATUS_RANK = Object.freeze({ observed: 0, normalized: 1, proposed: 2, open: 3, obsolete: 4 });

/**
 * Every token a value resolves through: direct and transitive aliases, including references
 * inside composite values, each listed once in depth-first order.
 */
export function aliasChain(resolved, path) {
  const out = [];
  const seen = new Set([path]);
  const visit = (p) => {
    const token = resolved.get(p);
    if (!token) return;
    for (const alias of collectAliases(token.value)) {
      if (seen.has(alias)) continue;
      seen.add(alias);
      const target = resolved.get(alias);
      if (!target) continue;
      out.push(target);
      visit(alias);
    }
  };
  visit(path);
  return out;
}

/**
 * The effective status of a token in a theme: the weakest status among its own and every token
 * in its alias chain, with the path that weakened it (null when its own status already is the weakest).
 */
export function effectiveStatus(resolved, path) {
  const token = resolved.get(path);
  let status = token.up.status;
  let via = null;
  for (const t of aliasChain(resolved, path)) {
    if ((STATUS_RANK[t.up.status] ?? -1) > (STATUS_RANK[status] ?? -1)) {
      status = t.up.status;
      via = t.path;
    }
  }
  return { status, via };
}

/** Convert a token path to a CSS custom property name. */
export const cssVarName = (path, prefix = "up") => `--${prefix}-${path.replace(/\./g, "-")}`;

/** Convert a repo-relative path to posix form. */
export const posix = (p) => p.split(sep).join("/");
export const rel = (root, p) => posix(relative(root, p));
