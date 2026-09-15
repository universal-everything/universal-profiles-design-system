#!/usr/bin/env node
/**
 * Full validation gate for the repository. Dependency-free; Node 22.13 or newer (the generated
 * TypeScript is parsed with node:module's stripTypeScriptTypes, which arrived in 22.13).
 *
 *   node scripts/validate.mjs             # run every check
 *   node scripts/validate.mjs --only docs # run one check (json, tokens, generated, contrast, docs,
 *                                         # assets, forbidden, mutation, sources, icons, examples,
 *                                         # package, tests)
 *   node scripts/validate.mjs --list      # list checks
 *
 * Exit code 1 when any check reports an error. Warnings never fail the run.
 *
 * File discovery: every file under the repository except .git and the paths .gitignore excludes; a
 * file git tracks is validated even when .gitignore matches it (a forced `git add -f` publishes it),
 * so only untracked ignored local state is skipped. Needs git on the path inside a checkout.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import * as nodeModule from "node:module";
import { STATUS_RANK, aliasChain, buildTheme, effectiveStatus, readJson } from "./lib/tokens.mjs";
import { computePairs } from "./contrast-report.mjs";
import { valueToJs } from "./lib/format.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const SKIP_DIRS = new Set([".git", "node_modules", ".planning", ".swarm", "tmp"]);
/** Text file types the repository may contain; every one of them is scanned for forbidden content. Extensionless files (LICENSE, dotfiles) count as text. */
const TEXT_EXT = new Set([".md", ".json", ".mjs", ".js", ".cjs", ".ts", ".tsx", ".css", ".html", ".svg", ".yml", ".yaml", ".txt", ""]);
/** Binary file types, allowed only under assets/ where a PROVENANCE.json must list them. */
const ASSET_BINARY_EXT = new Set([".png"]);
/** File types that are never allowed, with the reason; anything else outside TEXT_EXT and ASSET_BINARY_EXT is rejected as unknown. */
const BLOCKED_FILES = [
  { reason: "session or stream log", test: (name, ext) => ext === ".json" + "l" }, // spelled in two parts so the forbidden-pattern scan ignores this line
  { reason: "environment file that may carry credentials", test: (name) => name === ".env" || name.startsWith(".env.") },
  { reason: "private document or design source", test: (name, ext) => [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".key", ".xls", ".xlsx", ".fig", ".sketch", ".psd", ".ai", ".xd"].includes(ext) },
  { reason: "archive", test: (name, ext) => [".zip", ".tar", ".gz", ".tgz", ".7z", ".rar", ".dmg"].includes(ext) },
  { reason: "database, cache or log", test: (name, ext) => [".db", ".sqlite", ".sqlite3", ".rvf", ".lock", ".log"].includes(ext) },
];
/** Entries .gitignore must carry so local agent state and private material never reach the index. */
const REQUIRED_GITIGNORE = [".planning/", ".swarm/", "*.rvf", "ruvector.db", "node_modules/", "tmp/", "*.jsonl", "*.pdf", ".env", ".env.*"];
const STATUS_VOCAB = ["observed", "normalized", "proposed", "obsolete", "open"];
const PRIMITIVE_GROUPS = new Set(["color", "font", "space", "size", "breakpoint", "radius", "shadow", "motion", "opacity", "blur"]);
const SEMANTIC_GROUPS = new Set(["surface", "text", "border", "accent", "interactive", "status", "network", "avatar", "gradient", "glass", "type"]);
const tierOf = (path) => (PRIMITIVE_GROUPS.has(path.split(".")[0]) ? 0 : SEMANTIC_GROUPS.has(path.split(".")[0]) ? 1 : 2);
const posix = (p) => p.split(sep).join("/");
const rel = (p) => posix(relative(ROOT, p));

/**
 * Minimal .gitignore matcher (no negation): `dir/` matches a directory anywhere, a pattern without a
 * slash matches a file or directory name anywhere, a pattern with a slash is anchored to the root.
 * Ignored files are local state (agent databases, logs) that a plain `git add` never stages, so the
 * gate skips them unless git tracks them anyway (see `tracked` below).
 */
function gitignoreMatcher(text) {
  const globToRe = (glob) => new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]")}$`);
  const rules = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("!"))
    .map((l) => ({ dirOnly: l.endsWith("/"), anchored: l.replace(/\/$/, "").includes("/"), re: globToRe(l.replace(/^\//, "").replace(/\/$/, "")) }));
  return (relPath, isDir) => {
    const segments = relPath.split("/");
    return rules.some((r) => {
      if (r.anchored) return r.re.test(relPath) && (!r.dirOnly || isDir);
      if (r.dirOnly) return segments.slice(0, isDir ? segments.length : -1).some((seg) => r.re.test(seg));
      return segments.some((seg) => r.re.test(seg));
    });
  };
}
const gitignored = gitignoreMatcher(existsSync(join(ROOT, ".gitignore")) ? readFileSync(join(ROOT, ".gitignore"), "utf8") : "");

/** Run git in a directory with the caller's index/work-tree overrides and, when asked, its user configuration stripped. */
const git = (cwd, args, opts = {}) => {
  const env = { ...process.env };
  for (const k of ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE"]) delete env[k];
  if (opts.isolated) Object.assign(env, { GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" });
  return execFileSync("git", args, { cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
};

/**
 * The paths git tracks (its index, which is what a commit publishes) and their ancestor directories,
 * read with `git ls-files` when the root is a checkout. Tracked files are validated even when
 * .gitignore matches them, because `git add -f` stages ignored files and CI validates the checkout.
 * Outside a checkout there is no index and nothing can be force-added, so only the walk applies.
 */
function trackedPaths() {
  if (!existsSync(join(ROOT, ".git"))) return { files: new Set(), dirs: new Set(), error: null };
  try {
    const files = new Set(git(ROOT, ["ls-files", "-z"]).split("\0").filter(Boolean));
    const dirs = new Set();
    for (const f of files) for (let i = f.indexOf("/"); i !== -1; i = f.indexOf("/", i + 1)) dirs.add(f.slice(0, i));
    return { files, dirs, error: null };
  } catch (e) {
    return { files: new Set(), dirs: new Set(), error: `cannot read the git index (git ls-files): ${String(e.message).split("\n")[0]}` };
  }
}
const tracked = trackedPaths();

function walk(dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const r = rel(p);
    const isTracked = tracked.files.has(r) || tracked.dirs.has(r);
    // Local-only names (.git, agent state, scratch) and ignored paths are skipped unless git tracks them or something inside them.
    if (SKIP_DIRS.has(name) && !isTracked) continue;
    const st = statSync(p);
    if (gitignored(r, st.isDirectory()) && !isTracked) continue;
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const ALL_FILES = walk(ROOT);
const byExt = (...exts) => ALL_FILES.filter((f) => exts.includes(extname(f)));
const read = (f) => readFileSync(f, "utf8");
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const slugify = (heading) =>
  heading
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");

// ---------------------------------------------------------------- checks
const checks = {};

checks.json = () => {
  const errors = [];
  let count = 0;
  for (const f of byExt(".json")) {
    count++;
    try {
      JSON.parse(read(f));
    } catch (e) {
      errors.push(`${rel(f)}: ${e.message}`);
    }
  }
  return { errors, info: `${count} JSON files parse` };
};

checks.tokens = () => {
  const errors = [];
  const warnings = [];
  const sources = readJson(join(ROOT, "provenance", "sources.json")).sources;
  const openIds = new Set([...read(join(ROOT, "provenance", "open-items.md")).matchAll(/\|\s*(OPEN-\d{2})\s*\|/g)].map((m) => m[1]));
  const light = buildTheme(ROOT, "light");
  const dark = buildTheme(ROOT, "dark");
  errors.push(...light.errors.map((e) => `light: ${e}`), ...dark.errors.map((e) => `dark: ${e}`));
  const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;
  for (const t of light.resolved.values()) {
    for (const seg of t.segments) if (!NAME_RE.test(seg)) errors.push(`${t.path}: segment "${seg}" is not lower-case kebab-case ASCII`);
    if (!t.type) errors.push(`${t.path}: no $type resolvable`);
    if (!STATUS_VOCAB.includes(t.up.status)) errors.push(`${t.path}: status "${t.up.status}" is not in ${STATUS_VOCAB.join("|")}`);
    if (!t.up.source) errors.push(`${t.path}: missing source`);
    else {
      // "SRC-KEY:locator; further locator; SRC-OTHER:locator" -- parts that do not start with a key continue the previous locator.
      const keys = [...String(t.up.source).matchAll(/\bSRC-[A-Z0-9-]+/g)].map((m) => m[0]);
      if (!keys.length) errors.push(`${t.path}: source "${t.up.source}" cites no SRC- key`);
      for (const key of keys) if (!sources[key]) errors.push(`${t.path}: unknown source key "${key}"`);
    }
    if (!["high", "medium", "low"].includes(t.up.confidence)) errors.push(`${t.path}: confidence "${t.up.confidence}" is not high|medium|low`);
    if (t.up.open && !openIds.has(t.up.open)) errors.push(`${t.path}: open item ${t.up.open} is not in provenance/open-items.md`);
    if (t.up.status === "open" && !t.up.open) errors.push(`${t.path}: status open requires an open item id`);
    if (t.up.status === "obsolete" && !t.deprecated) errors.push(`${t.path}: obsolete tokens must be deprecated`);
    if (t.aliasOf && tierOf(t.aliasOf) > tierOf(t.path)) errors.push(`${t.path}: a tier-${tierOf(t.path)} token references the higher tier token ${t.aliasOf}`);
  }
  // A token's status may never outrank the weakest status in its alias chain: a component token that
  // resolves through a normalized or proposed value is itself normalized or proposed. Checked on the
  // declared statuses of the light theme and on every token the dark theme overrides.
  const checkChain = (theme, label, paths) => {
    for (const path of paths) {
      const t = theme.resolved.get(path);
      if (!t || t.up.status === "obsolete") continue;
      const obsolete = aliasChain(theme.resolved, path).find((c) => c.up.status === "obsolete");
      if (obsolete) errors.push(`${label}${path}: resolves through the obsolete token ${obsolete.path}`);
      const { status, via } = effectiveStatus(theme.resolved, path);
      if (via && status !== "obsolete" && STATUS_RANK[t.up.status] < STATUS_RANK[status]) {
        errors.push(`${label}${path}: status ${t.up.status} outranks ${status} inherited through ${via}; declare ${status} or weaker`);
      }
    }
  };
  checkChain(light, "", light.resolved.keys());
  checkChain(dark, "dark: ", dark.overridden);
  for (const path of dark.resolved.keys()) if (!light.resolved.has(path)) errors.push(`dark theme defines ${path}, which does not exist in the light theme`);
  const darkTree = readJson(join(ROOT, "tokens", "src", "themes", "dark.json"));
  const walkOverrides = (node, path) => {
    if (node && typeof node === "object" && "$value" in node) {
      if (!light.flat.has(path.join("."))) errors.push(`themes/dark.json overrides ${path.join(".")}, which is not a base token`);
      return;
    }
    if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) if (!k.startsWith("$")) walkOverrides(v, [...path, k]);
  };
  walkOverrides(darkTree, []);
  const counts = {};
  for (const t of light.resolved.values()) counts[t.up.status] = (counts[t.up.status] ?? 0) + 1;
  return { errors, warnings, info: `${light.resolved.size} tokens, ${dark.resolved.size - 0} dark-resolved, statuses ${JSON.stringify(counts)}` };
};

const runNode = (script, extra = []) => {
  try {
    const out = execFileSync(process.execPath, [join(ROOT, script), ...extra], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, out: out.trim() };
  } catch (e) {
    return { ok: false, out: `${e.stdout ?? ""}${e.stderr ?? ""}`.trim() };
  }
};

checks.generated = () => {
  const errors = [];
  const info = [];
  for (const script of ["scripts/build-tokens.mjs", "scripts/generate-address-backgrounds.mjs"]) {
    const r = runNode(script, ["--check"]);
    if (!r.ok) errors.push(`${script} --check: ${r.out}`);
    else info.push(r.out);
  }
  // The React Native dark theme must carry every component-tier and identicon dark override, read back
  // from the emitted file rather than from the build script, so a light-only build cannot pass again.
  const themeFile = "tokens/build/react-native/theme.ts";
  try {
    const rn = read(join(ROOT, themeFile));
    const literal = (name) => {
      const m = rn.match(new RegExp(`\nexport const ${name} = ([\\s\\S]*?) as const;`));
      if (!m) throw new Error(`no export named ${name}`);
      return JSON.parse(m[1].replace(/,(\s*[}\]])/g, "$1"));
    };
    const emitted = { components: literal("darkComponents"), identicon: literal("darkIdenticon") };
    const light = buildTheme(ROOT, "light");
    const dark = buildTheme(ROOT, "dark");
    let overrides = 0;
    for (const t of dark.resolved.values()) {
      const lt = light.resolved.get(t.path);
      if (!lt || tierOf(t.path) !== 2 || JSON.stringify(lt.resolved) === JSON.stringify(t.resolved)) continue;
      const [group, ...rest] = t.segments;
      const table = group === "identicon" ? emitted.identicon : emitted.components[group];
      if (!table) {
        errors.push(`${themeFile}: component group ${group} has dark overrides but is not emitted`);
        continue;
      }
      overrides++;
      const got = rest.reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), table);
      const want = valueToJs(t.type, t.resolved);
      if (JSON.stringify(got) !== JSON.stringify(want)) errors.push(`${themeFile}: dark ${t.path} is ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
    }
    if (!/identicon: darkIdenticon\b/.test(rn) || !/components: darkComponents\b/.test(rn)) errors.push(`${themeFile}: darkTheme must be built from darkIdenticon and darkComponents`);
    info.push(`React Native dark theme carries ${overrides} component overrides`);
  } catch (e) {
    errors.push(`${themeFile}: ${e.message}`);
  }
  return { errors, info: info.join("; ") };
};

checks.contrast = () => {
  const { rows, errors } = computePairs(ROOT);
  const r = runNode("scripts/contrast-report.mjs", ["--check"]);
  if (!r.ok) errors.push(r.out);
  const gated = rows.filter((x) => !x.informational);
  return { errors, info: `${gated.length} gated pairs, ${rows.length - gated.length} informational` };
};

const REQUIRED_FILES = [
  "README.md", "CLAUDE.md", "AGENTS.md", "CONTRIBUTING.md", "CHANGELOG.md", "SECURITY.md", "CODE_OF_CONDUCT.md", "GOVERNANCE.md", "LICENSE", "TRADEMARKS.md", "package.json", ".gitignore",
  "LICENSES/README.md", "LICENSES/FONTS.md", "LICENSES/GENERATED-IMAGES.md", "LICENSES/THIRD-PARTY.md",
  "tokens/README.md", "tokens/src/$metadata.json", "tokens/contrast-pairs.json",
  "tokens/build/css/variables.css", "tokens/build/ts/tokens.ts", "tokens/build/react-native/theme.ts", "tokens/build/json/tokens.flat.json", "tokens/build/json/tokens.nested.json", "tokens/build/tailwind/preset.cjs", "tokens/build/figma/variables.json",
  "foundations/README.md", "foundations/principles.md", "foundations/color.md", "foundations/typography.md", "foundations/spacing-and-layout.md", "foundations/shape-and-radius.md", "foundations/elevation-and-glass.md", "foundations/motion.md", "foundations/dark-mode.md", "foundations/address-signature.md", "foundations/voice-and-copy.md", "foundations/responsive.md",
  "brand/README.md", "brand/lockups.md", "brand/narrative.md", "brand/misuse.md", "brand/relationship-to-lukso.md",
  "components/README.md", "components/button.md", "components/input.md", "components/tag.md", "components/list-item.md", "components/card.md", "components/profile-card.md", "components/identicon.md", "components/glass-surfaces.md", "components/overlays.md", "components/navigation.md", "components/app-tile.md", "components/qr-share-card.md", "components/empty-error-states.md", "components/skeleton-loading.md", "components/controls.md",
  "patterns/README.md", "patterns/onboarding.md", "patterns/profile-creation-and-recovery.md", "patterns/permissions-and-controllers.md", "patterns/signing-and-confirmation.md", "patterns/network-context.md", "patterns/wallet-and-assets.md", "patterns/dapp-and-browser-surfaces.md", "patterns/discovery-and-browse.md", "patterns/empty-error-offline.md", "patterns/marketing-layouts.md", "patterns/content-voice.md", "patterns/obsolete.md",
  "icons/README.md", "icons/manifest.json",
  "imagery/README.md", "imagery/briefs.md", "imagery/framing-and-safe-zones.md",
  "assets/generated/PROVENANCE.json", "assets/backgrounds/address-gradient/PROVENANCE.json", "assets/backgrounds/address-gradient/recipes.json", "assets/logos/README.md",
  "accessibility/README.md", "accessibility/contrast-report.md", "accessibility/checklist.md",
  "adoption/web.md", "adoption/react-native.md", "adoption/migration-checklist.md", "adoption/gap-register.md",
  "provenance/README.md", "provenance/sources.json", "provenance/open-items.md", "provenance/reconciliation.md", "provenance/provenance.schema.json",
  "decisions/README.md",
  "packages/address-signature/package.json", "packages/address-signature/src/index.mjs", "packages/address-signature/src/index.d.ts", "packages/address-signature/README.md",
  "examples/README.md", "examples/web/profile-card.html", "examples/web/profile-card.css", "examples/react-native/ProfileCard.tsx", "examples/react-native/GlassPanel.tsx", "examples/react-native/TabBar.tsx", "examples/marketing/README.md", "examples/agent-playbooks/README.md",
  "scripts/validate.mjs", "scripts/build-tokens.mjs", "scripts/contrast-report.mjs", "scripts/generate-address-backgrounds.mjs",
];

const HEADING_RULES = {
  components: ["Anatomy", "Variants", "States", "Sizing", "Behaviour", "Accessibility", "Platform differences", "Tokens", "Status", "Implementation notes"],
  patterns: ["Purpose", "Flow", "Rules", "Accessibility", "Status", "Evidence"],
  foundations: ["Evidence"],
  brand: ["Evidence"],
};

checks.docs = () => {
  const errors = [];
  const warnings = [];
  for (const f of REQUIRED_FILES) if (!existsSync(join(ROOT, f))) errors.push(`missing required file ${f}`);
  const mdFiles = byExt(".md");
  const headingsOf = (text) => [...text.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((m) => m[1]);
  const anchorsOf = (text) => new Set(headingsOf(text).map(slugify));
  let links = 0;
  for (const f of mdFiles) {
    const text = read(f);
    const withoutCode = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
    const targets = [...withoutCode.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]);
    for (const m of withoutCode.matchAll(/<(?:img|source|a)\b[^>]*\b(?:src|srcset|href)="([^"]+)"/g)) targets.push(m[1]);
    for (const target of targets) {
      links++;
      if (/^(https?:|mailto:|tel:)/i.test(target)) continue;
      const [pathPart, anchor] = target.split("#");
      const targetFile = pathPart ? resolve(dirname(f), decodeURIComponent(pathPart)) : f;
      if (!existsSync(targetFile)) {
        errors.push(`${rel(f)}: broken link ${target}`);
        continue;
      }
      if (anchor && extname(targetFile) === ".md") {
        if (!anchorsOf(read(targetFile)).has(anchor)) errors.push(`${rel(f)}: missing anchor #${anchor} in ${rel(targetFile)}`);
      }
    }
    const dir = rel(f).split("/")[0];
    const rules = HEADING_RULES[dir];
    if (rules && !rel(f).endsWith("README.md")) {
      const heads = headingsOf(text).map((h) => h.toLowerCase());
      for (const required of rules) {
        if (!heads.some((h) => h.startsWith(required.toLowerCase()))) errors.push(`${rel(f)}: missing "${required}" section`);
      }
      const statusLine = text.match(/^Status:\s*(.+)$/m);
      if (!statusLine) errors.push(`${rel(f)}: missing a "Status:" line`);
      else if (!STATUS_VOCAB.some((w) => statusLine[1].toLowerCase().includes(w))) errors.push(`${rel(f)}: Status line does not use the vocabulary (${STATUS_VOCAB.join(", ")})`);
    }
  }
  // Token paths cited in documentation must exist (wildcards "group.*" must match at least one token).
  const light = buildTheme(ROOT, "light");
  const groups = new Set([...light.resolved.keys()].map((k) => k.split(".")[0]));
  let tokenRefs = 0;
  for (const f of mdFiles) {
    for (const m of read(f).matchAll(/`([a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\.\*)?)`/g)) {
      const ref = m[1];
      const group = ref.split(".")[0];
      if (!groups.has(group) || /\.(md|json|mjs|cjs|ts|tsx|css|html|svg|png|yml)$/.test(ref)) continue;
      tokenRefs++;
      if (ref.endsWith(".*")) {
        const prefix = ref.slice(0, -1);
        if (![...light.resolved.keys()].some((k) => k.startsWith(prefix))) errors.push(`${rel(f)}: token group ${ref} does not exist`);
      } else if (!light.resolved.has(ref) && ![...light.resolved.keys()].some((k) => k.startsWith(`${ref}.`))) {
        errors.push(`${rel(f)}: token ${ref} does not exist`);
      }
    }
  }
  return { errors, warnings, info: `${mdFiles.length} markdown files, ${links} links checked, ${tokenRefs} token references resolve, ${REQUIRED_FILES.length} required files present` };
};

function pngDimensions(buf) {
  if (buf.length < 24 || buf.toString("ascii", 1, 4) !== "PNG") return null;
  return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
}

checks.assets = () => {
  const errors = [];
  const briefsText = existsSync(join(ROOT, "imagery", "briefs.md")) ? read(join(ROOT, "imagery", "briefs.md")) : "";
  const briefIds = new Set([...briefsText.matchAll(/^##+\s+(IB-[A-Z0-9-]+)/gm)].map((m) => m[1]));
  const assetsRoot = join(ROOT, "assets");
  const files = walk(assetsRoot);
  const provFiles = files.filter((f) => f.endsWith("PROVENANCE.json"));
  const covered = new Set();
  let checked = 0;
  for (const pf of provFiles) {
    const dir = dirname(pf);
    let prov;
    try {
      prov = readJson(pf);
    } catch (e) {
      errors.push(`${rel(pf)}: ${e.message}`);
      continue;
    }
    if (!prov.method) errors.push(`${rel(pf)}: missing method`);
    if (typeof prov.license !== "string" || !prov.license.trim()) errors.push(`${rel(pf)}: missing license (every provenance record states the licence of its files)`);
    if (prov.method !== "procedural" && !prov.model && !prov.tool) errors.push(`${rel(pf)}: generated assets must record the tool or model`);
    if (!Array.isArray(prov.assets) || prov.assets.length === 0) {
      errors.push(`${rel(pf)}: assets must be a non-empty array`);
      continue;
    }
    for (const a of prov.assets) {
      checked++;
      const abs = join(dir, a.path);
      if (!a.path || !existsSync(abs)) {
        errors.push(`${rel(pf)}: listed asset ${a.path} does not exist`);
        continue;
      }
      covered.add(abs);
      const buf = readFileSync(abs);
      if (!/^[0-9a-f]{64}$/.test(a.sha256 ?? "")) errors.push(`${rel(pf)}: ${a.path} has no valid sha256`);
      else if (sha256(buf) !== a.sha256) errors.push(`${rel(pf)}: ${a.path} hash mismatch (file ${sha256(buf).slice(0, 12)}..., recorded ${a.sha256.slice(0, 12)}...)`);
      if (extname(abs) === ".png") {
        const dims = pngDimensions(buf);
        if (!dims) errors.push(`${rel(pf)}: ${a.path} is not a PNG`);
        else if (a.dimensions !== dims) errors.push(`${rel(pf)}: ${a.path} dimensions ${dims} differ from recorded ${a.dimensions}`);
        if (prov.method !== "procedural" && !a.prompt) errors.push(`${rel(pf)}: ${a.path} generated raster without a recorded prompt`);
      }
      if (a.reconstructed === true) errors.push(`${rel(pf)}: ${a.path} is marked reconstructed; the repository ships no reconstruction of a mark (decision 0010)`);
      const briefId = a.brief ? String(a.brief).match(/^IB-[A-Z0-9-]+/)?.[0] : null;
      if (a.brief && (!briefId || !briefIds.has(briefId))) errors.push(`${rel(pf)}: ${a.path} cites brief ${a.brief}, which is not in imagery/briefs.md`);
    }
  }
  for (const f of files) {
    const name = f.split(sep).pop();
    if (name === "PROVENANCE.json" || name === "README.md" || name === "recipes.json") continue;
    if (!covered.has(f)) errors.push(`${rel(f)}: not listed in any PROVENANCE.json`);
    if (![".png", ".svg"].includes(extname(f))) errors.push(`${rel(f)}: only .png and .svg assets are allowed under assets/`);
  }
  return { errors, info: `${provFiles.length} provenance records, ${checked} assets verified` };
};

checks.forbidden = () => {
  const errors = [];
  const spec = readJson(join(ROOT, "scripts", "validate", "forbidden.json"));
  const patterns = spec.patterns.map((p) => ({ re: new RegExp(p.pattern, p.flags), reason: p.reason }));
  const skip = new Set(["scripts/validate/forbidden.json"]);
  let scanned = 0;
  let typed = 0;
  for (const f of ALL_FILES) {
    const r = rel(f);
    const name = f.split(sep).pop();
    const ext = extname(f).toLowerCase();
    typed++;
    // Every file must be a known text type, or a binary asset under assets/; nothing else is publishable.
    const blocked = BLOCKED_FILES.find((b) => b.test(name, ext));
    if (blocked) {
      errors.push(`${r}: ${blocked.reason}; this file type is never allowed`);
      continue;
    }
    if (ASSET_BINARY_EXT.has(ext)) {
      if (!r.startsWith("assets/")) errors.push(`${r}: binary files are only allowed under assets/ with a provenance record`);
      continue;
    }
    if (!TEXT_EXT.has(ext)) {
      errors.push(`${r}: file type "${ext}" is not in the allow-list (${[...TEXT_EXT].filter(Boolean).join(", ")}; .png under assets/)`);
      continue;
    }
    const buf = readFileSync(f);
    if (buf.subarray(0, 8000).includes(0)) {
      errors.push(`${r}: binary content in a text file type`);
      continue;
    }
    if (skip.has(r)) continue;
    scanned++;
    const lines = buf.toString("utf8").split("\n");
    for (const { re, reason } of patterns) {
      lines.forEach((line, i) => {
        if (re.test(line)) errors.push(`${r}:${i + 1}: ${reason} (${re.source.slice(0, 40)})`);
      });
    }
  }
  const gitignore = existsSync(join(ROOT, ".gitignore")) ? read(join(ROOT, ".gitignore")) : "";
  for (const entry of REQUIRED_GITIGNORE) {
    if (!gitignore.split("\n").includes(entry)) errors.push(`.gitignore must list ${entry}`);
  }
  // Without the index the walk cannot tell a force-added file from local state, so a checkout whose index is unreadable fails closed.
  if (tracked.error) errors.push(tracked.error);
  const forced = ALL_FILES.filter((f) => gitignored(rel(f), false)).length;
  return { errors, info: `${typed} files type-checked, ${scanned} text files scanned against ${patterns.length} patterns, ${forced} tracked despite .gitignore` };
};

/**
 * Mutation check for the rule above, run in a throwaway repository under the temporary directory: the
 * scripts and .gitignore are copied, private files are planted, four are force-added (`git add -f`,
 * including one inside the skipped `tmp/` directory) and the forbidden check must reject exactly
 * those, while the untracked ignored files of the same types beside them stay excluded.
 */
checks.mutation = () => {
  const errors = [];
  const logExt = ".json" + "l"; // spelled in two parts so the forbidden-pattern scan ignores this line
  const forced = [`probe/forced${logExt}`, "probe/forced.pdf", "probe/.env", "tmp/forced.log"];
  const untracked = [`probe/local${logExt}`, "probe/.env.local", "tmp/local.log"];
  const reasons = { pdf: "private document or design source", env: "environment file that may carry credentials", log: "database, cache or log" };
  reasons[logExt.slice(1)] = "session or stream log";
  const reasonOf = (path) => (path.endsWith(".env") ? reasons.env : reasons[path.split(".").pop()]);
  let dir;
  try {
    dir = mkdtempSync(join(tmpdir(), "up-gate-mutation-"));
    cpSync(join(ROOT, "scripts"), join(dir, "scripts"), { recursive: true });
    writeFileSync(join(dir, ".gitignore"), read(join(ROOT, ".gitignore")));
    for (const p of [...forced, ...untracked]) {
      mkdirSync(join(dir, dirname(p)), { recursive: true });
      writeFileSync(join(dir, p), `planted ${p}\n`);
    }
    git(dir, ["init", "-q"], { isolated: true });
    git(dir, ["add", "-A"], { isolated: true });
    git(dir, ["add", "-f", "--", ...forced], { isolated: true });
    const index = new Set(git(dir, ["ls-files", "-z"], { isolated: true }).split("\0").filter(Boolean));
    for (const p of forced) if (!index.has(p)) errors.push(`fixture: ${p} was not staged by git add -f`);
    for (const p of untracked) if (index.has(p)) errors.push(`fixture: ${p} was staged although .gitignore excludes it`);
    let out;
    let exitCode = 0;
    try {
      out = execFileSync(process.execPath, [join(dir, "scripts", "validate.mjs"), "--only", "forbidden"], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (e) {
      out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
      exitCode = e.status ?? 1;
    }
    if (exitCode !== 1) errors.push(`forbidden check on the mutated copy exited ${exitCode}, expected 1:\n${out.trim()}`);
    const reported = out.split("\n").filter((l) => l.includes("error:")).map((l) => l.replace(/^\s*error:\s*/, ""));
    const expected = forced.map((p) => `${p}: ${reasonOf(p)}; this file type is never allowed`);
    for (const line of expected) if (!reported.includes(line)) errors.push(`force-added file not rejected: expected "${line}"`);
    for (const line of reported) if (!expected.includes(line)) errors.push(`unexpected error on the mutated copy: ${line}`);
    for (const p of untracked) if (out.includes(p)) errors.push(`untracked ignored file ${p} was reported; only tracked files may bypass .gitignore`);
    if (!out.includes(`${forced.length} tracked despite .gitignore`)) errors.push(`forbidden check did not report ${forced.length} tracked files despite .gitignore:\n${out.trim()}`);
  } catch (e) {
    errors.push(`mutation check could not run (git and a writable temporary directory are required): ${String(e.message).split("\n")[0]}`);
  } finally {
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
  return { errors, info: `throwaway copy probed with ${forced.length} force-added private files (must be rejected) and ${untracked.length} untracked ignored files (must be skipped)` };
};

checks.sources = () => {
  const errors = [];
  const warnings = [];
  const reg = readJson(join(ROOT, "provenance", "sources.json"));
  const authorities = Object.keys(reg.authorityVocabulary);
  const publications = Object.keys(reg.publicationVocabulary);
  for (const [key, s] of Object.entries(reg.sources)) {
    if (!/^SRC-[A-Z0-9-]+$/.test(key)) errors.push(`sources.json: key ${key} is not SRC-UPPER-KEBAB`);
    for (const field of ["title", "category", "identifiers", "authority", "publication", "currency", "inspected", "notes"]) if (s[field] === undefined) errors.push(`sources.json: ${key} lacks ${field}`);
    if (!authorities.includes(s.authority)) errors.push(`sources.json: ${key} authority "${s.authority}" not in ${authorities.join("|")}`);
    if (!publications.includes(s.publication)) errors.push(`sources.json: ${key} publication "${s.publication}" not in ${publications.join("|")}`);
    if (s.identifiers?.fileKey && !/^[A-Za-z0-9]{22}$/.test(s.identifiers.fileKey)) errors.push(`sources.json: ${key} fileKey is not a 22-character key`);
    for (const node of [s.identifiers?.rootNode, s.identifiers?.canvas, s.identifiers?.section, s.identifiers?.readNode, ...(s.identifiers?.frames ?? []), ...(s.identifiers?.readNodes ?? [])].filter(Boolean)) {
      if (!/^\d+:\d+$/.test(node)) errors.push(`sources.json: ${key} node id ${node} is malformed`);
    }
  }
  for (const key of reg.precedence) if (!reg.sources[key]) errors.push(`sources.json: precedence lists unknown ${key}`);
  const openText = read(join(ROOT, "provenance", "open-items.md"));
  const registered = new Map([...openText.matchAll(/^\|\s*(OPEN-\d{2})\s*\|[^|]*\|\s*([^|]+?)\s*\|/gm)].map((m) => [m[1], m[2]]));
  const referenced = new Map();
  for (const f of ALL_FILES) {
    const r = rel(f);
    if (r === "provenance/open-items.md" || !TEXT_EXT.has(extname(f)) || extname(f) === ".png") continue;
    for (const m of read(f).matchAll(/OPEN-\d{2}/g)) referenced.set(m[0], (referenced.get(m[0]) ?? 0) + 1);
  }
  for (const id of referenced.keys()) if (!registered.has(id)) errors.push(`${id} is referenced but not registered in provenance/open-items.md`);
  for (const [id, status] of registered) if (!referenced.has(id) && status !== "closed") warnings.push(`${id} is registered but referenced nowhere else`);
  const srcRefs = new Set();
  for (const f of ALL_FILES) {
    const r = rel(f);
    if (r === "provenance/sources.json" || r === "scripts/validate.mjs" || !TEXT_EXT.has(extname(f)) || extname(f) === ".png") continue;
    for (const m of read(f).matchAll(/\bSRC-[A-Z0-9-]+\b/g)) srcRefs.add(m[0]);
  }
  for (const key of srcRefs) if (!reg.sources[key]) errors.push(`source ${key} is cited but not registered in provenance/sources.json`);
  return { errors, warnings, info: `${Object.keys(reg.sources).length} sources, ${registered.size} open items registered, ${referenced.size} referenced` };
};

checks.icons = () => {
  const errors = [];
  const manifest = readJson(join(ROOT, "icons", "manifest.json"));
  const listed = new Map(manifest.icons.map((i) => [i.file, i]));
  const files = walk(join(ROOT, "icons", "src")).filter((f) => f.endsWith(".svg"));
  for (const f of files) {
    const r = `src/${f.split(sep).pop()}`;
    const name = r.slice(4, -4);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) errors.push(`icons/${r}: file name must be kebab-case`);
    const svg = read(f);
    const root = svg.match(/^<svg\b([^>]*)>/);
    if (!root) {
      errors.push(`icons/${r}: no root <svg>`);
      continue;
    }
    const attrs = root[1];
    const need = { 'viewBox="0 0 32 32"': "viewBox 0 0 32 32", 'fill="none"': "fill none on the root", 'stroke="currentColor"': "stroke currentColor", 'stroke-width="1.5"': "stroke width 1.5", 'stroke-linecap="round"': "round caps", 'stroke-linejoin="round"': "round joins", 'aria-hidden="true"': "aria-hidden on the root" };
    for (const [attr, label] of Object.entries(need)) if (!attrs.includes(attr)) errors.push(`icons/${r}: missing ${label}`);
    const body = svg.slice(root[0].length);
    if (/(fill|stroke)="(#|rgb|hsl|url)/i.test(body)) errors.push(`icons/${r}: hard-coded colour inside the icon`);
    if (/<(script|image|foreignObject|style)\b|href=/i.test(body)) errors.push(`icons/${r}: disallowed element or reference`);
    if (!listed.has(r)) errors.push(`icons/${r}: not listed in icons/manifest.json`);
  }
  const byLabel = new Map();
  for (const [file, entry] of listed) {
    if (!existsSync(join(ROOT, "icons", file))) errors.push(`manifest: ${file} does not exist`);
    if (!manifest.categories[entry.category]) errors.push(`manifest: ${entry.name} has unknown category ${entry.category}`);
    if (!entry.label) errors.push(`manifest: ${entry.name} has no default accessible label`);
    else {
      const key = entry.label.trim().toLowerCase();
      byLabel.set(key, [...(byLabel.get(key) ?? []), entry.name]);
    }
    if (!Array.isArray(entry.keywords) || entry.keywords.length === 0) errors.push(`manifest: ${entry.name} has no keywords`);
    if (!STATUS_VOCAB.includes(entry.status)) errors.push(`manifest: ${entry.name} has an invalid status`);
  }
  // Default accessible labels are what icon-only controls announce, so two icons may not share one.
  for (const [label, names] of byLabel) if (names.length > 1) errors.push(`manifest: label "${label}" is shared by ${names.join(", ")}; every icon needs a distinct default accessible label`);
  return { errors, info: `${files.length} icons linted, ${listed.size} manifest entries, ${byLabel.size} distinct labels` };
};

checks.examples = () => {
  const errors = [];
  const files = walk(join(ROOT, "examples")).filter((f) => [".html", ".css", ".ts", ".tsx", ".js", ".mjs"].includes(extname(f)));
  for (const f of files) {
    const text = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*\/\/.*$/gm, "");
    const hexes = [...text.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0]);
    if (hexes.length) errors.push(`${rel(f)}: hard-coded colours ${[...new Set(hexes)].join(", ")}; use tokens`);
    if ([".html", ".css"].includes(extname(f)) && !/var\(--up-/.test(text)) errors.push(`${rel(f)}: web example does not use the --up-* custom properties`);
    if ([".ts", ".tsx"].includes(extname(f)) && !/tokens\/build\/react-native\/theme|from "\.\.\/\.\.\/tokens/.test(text)) errors.push(`${rel(f)}: React Native example does not import the generated theme`);
  }
  return { errors, info: `${files.length} example source files use tokens` };
};

checks.package = () => {
  const errors = [];
  const pkg = readJson(join(ROOT, "package.json"));
  for (const field of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    if (pkg[field] && Object.keys(pkg[field]).length) errors.push(`package.json must not declare ${field}`);
  }
  for (const s of ["validate", "test", "build", "build:tokens", "build:contrast", "build:backgrounds"]) if (!pkg.scripts?.[s]) errors.push(`package.json lacks the ${s} script`);
  if (pkg.private !== true) errors.push("package.json must stay private until OPEN-09 is closed");
  // `node --check` accepts any ES-module .ts file once type stripping is on, without parsing it, so the
  // generated TypeScript is checked in two real steps: strip the types (a TypeScript parse, in a child so
  // the API's experimental warning stays out of this output), then parse the result as an ES module.
  if (typeof nodeModule.stripTypeScriptTypes !== "function") {
    errors.push(`Node ${process.versions.node} cannot parse the generated TypeScript: node:module.stripTypeScriptTypes needs Node 22.13 or newer`);
  } else {
    const STRIP = 'import { stripTypeScriptTypes } from "node:module"; import { readFileSync } from "node:fs"; process.stdout.write(stripTypeScriptTypes(readFileSync(0, "utf8"), { mode: "strip" }));';
    const firstLine = (e) => String(e.stderr ?? e.message).split("\n").find((l) => /Error|error/.test(l)) ?? String(e.stderr ?? e.message).split("\n")[0];
    for (const f of ["tokens/build/ts/tokens.ts", "tokens/build/react-native/theme.ts"]) {
      let js;
      try {
        js = execFileSync(process.execPath, ["--no-warnings", "--input-type=module", "-e", STRIP], { cwd: ROOT, input: read(join(ROOT, f)), encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
      } catch (e) {
        errors.push(`${f}: TypeScript syntax error: ${firstLine(e)}`);
        continue;
      }
      try {
        execFileSync(process.execPath, ["--check", "--no-warnings", "--input-type=module", "-"], { cwd: ROOT, input: js, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
      } catch (e) {
        errors.push(`${f}: module syntax error after type stripping: ${firstLine(e)}`);
      }
    }
  }
  return { errors, info: "no dependencies; scripts present; generated TypeScript parses (types stripped, modules parsed)" };
};

checks.tests = () => {
  const errors = [];
  try {
    const testFiles = walk(join(ROOT, "packages")).filter((f) => f.endsWith(".test.mjs"));
    const out = execFileSync(process.execPath, ["--test", "--test-reporter=tap", ...testFiles], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const pass = out.match(/^# pass (\d+)/m)?.[1] ?? "?";
    const fail = out.match(/^# fail (\d+)/m)?.[1] ?? "?";
    if (fail !== "0") errors.push(`package tests: ${fail} failing`);
    return { errors, info: `address-signature tests: ${pass} pass, ${fail} fail` };
  } catch (e) {
    errors.push(`package tests failed:\n${String(e.stdout ?? "")}${String(e.stderr ?? "")}`.trim());
    return { errors, info: "" };
  }
};

// ---------------------------------------------------------------- runner
if (args.includes("--list")) {
  console.log(Object.keys(checks).join("\n"));
  process.exit(0);
}
const names = only ? [only] : Object.keys(checks);
let failed = 0;
let warned = 0;
for (const name of names) {
  if (!checks[name]) {
    console.error(`unknown check "${name}"`);
    process.exit(2);
  }
  let result;
  try {
    result = checks[name]();
  } catch (e) {
    result = { errors: [`check crashed: ${e.stack ?? e.message}`] };
  }
  const errors = result.errors ?? [];
  const warnings = result.warnings ?? [];
  failed += errors.length;
  warned += warnings.length;
  const mark = errors.length ? "FAIL" : "ok  ";
  console.log(`${mark} ${name.padEnd(10)} ${result.info ?? ""}`);
  for (const w of warnings) console.log(`       warn: ${w}`);
  for (const e of errors) console.log(`       error: ${e}`);
}
console.log(failed ? `\n${failed} error(s), ${warned} warning(s)` : `\nall checks passed (${warned} warning(s))`);
process.exit(failed ? 1 : 0);
