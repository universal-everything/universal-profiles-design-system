#!/usr/bin/env node
/**
 * Generate the example address-gradient backgrounds, share cards and identicons under
 * assets/backgrounds/address-gradient/ from the address-signature package, plus a
 * PNG-independent recipes.json and the directory's PROVENANCE.json.
 *
 *   node scripts/generate-address-backgrounds.mjs           # write
 *   node scripts/generate-address-backgrounds.mjs --check   # exit 1 if any output would change
 *
 * Deterministic and dependency-free. Sample addresses are the public EIP-55 test vectors,
 * not real profiles.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  auraRecipe,
  auraSvg,
  displayName,
  gradientCss,
  gradientReactNative,
  gradientStops,
  gradientSvg,
  identiconData,
  identiconSvg,
  nameSuffix,
  signatureSvg,
  sliceAddress,
} from "../packages/address-signature/src/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = "assets/backgrounds/address-gradient";
const CHECK = process.argv.includes("--check");

export const SAMPLES = [
  { slug: "sample-1", name: "sample-one", address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed" },
  { slug: "sample-2", name: "sample-two", address: "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359" },
  { slug: "sample-3", name: "", address: "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB" },
];

export function generate() {
  const files = new Map();
  const recipes = [];
  for (const s of SAMPLES) {
    const base = `examples/${s.slug}`;
    files.set(`${base}-linear-1200x630-light.svg`, gradientSvg(s.address, { width: 1200, height: 630, theme: "light", id: `${s.slug}-linear-light` }));
    files.set(`${base}-linear-1200x630-dark.svg`, gradientSvg(s.address, { width: 1200, height: 630, theme: "dark", id: `${s.slug}-linear-dark` }));
    files.set(`${base}-aura-1600x900-light.svg`, auraSvg(s.address, { width: 1600, height: 900, theme: "light", id: `${s.slug}-aura-light` }));
    files.set(`${base}-aura-1600x900-dark.svg`, auraSvg(s.address, { width: 1600, height: 900, theme: "dark", id: `${s.slug}-aura-dark` }));
    files.set(`${base}-share-card-1200-light.svg`, signatureSvg(s.address, { name: s.name, width: 1200, theme: "light", id: `${s.slug}-card-light` }));
    files.set(`${base}-share-card-1200-dark.svg`, signatureSvg(s.address, { name: s.name, width: 1200, theme: "dark", id: `${s.slug}-card-dark` }));
    files.set(`${base}-identicon-64.svg`, `${identiconSvg(s.address, { scale: 8 })}\n`);
    const data = identiconData(s.address);
    recipes.push({
      slug: s.slug,
      address: s.address,
      normalized: gradientStops(s.address).address,
      displayName: displayName(s.name, s.address),
      suffix: nameSuffix(s.address),
      truncated: { compact: sliceAddress(s.address), full: sliceAddress(s.address, { leading: 10, trailing: 8 }) },
      gradient: {
        light: { stops: gradientStops(s.address), css: gradientCss(s.address), reactNative: gradientReactNative(s.address) },
        dark: { stops: gradientStops(s.address, { theme: "dark" }), css: gradientCss(s.address, { theme: "dark" }) },
      },
      aura: { light: auraRecipe(s.address), dark: auraRecipe(s.address, { theme: "dark" }) },
      identicon: { colors: data.colors, grid: data.grid.map((row) => row.join("")) },
    });
  }
  files.set(
    "recipes.json",
    `${JSON.stringify(
      {
        $description:
          "PNG-independent recipes for the example addresses: gradient stops, CSS and React Native props, aura blob positions (fractions of the canvas), identicon colours and grid. Any renderer can reproduce the backgrounds from these numbers without rasters.",
        generator: "scripts/generate-address-backgrounds.mjs (packages/address-signature)",
        fallback: { light: gradientStops(undefined), dark: gradientStops(undefined, { theme: "dark" }) },
        samples: recipes,
      },
      null,
      2,
    )}\n`,
  );
  const sha = (content) => createHash("sha256").update(content).digest("hex");
  const assets = [...files.entries()]
    .filter(([path]) => path !== "recipes.json")
    .map(([path, content]) => ({
      path,
      sha256: sha(content),
      method: "procedural",
      inputs: { address: SAMPLES.find((s) => path.includes(s.slug)).address },
      brief: path.includes("aura") ? "IB-01" : path.includes("linear") ? "IB-01" : path.includes("share-card") ? "IB-03" : "IB-01",
    }));
  files.set(
    "PROVENANCE.json",
    `${JSON.stringify(
      {
        $schema: "../../../provenance/provenance.schema.json",
        directory: OUT_DIR,
        method: "procedural",
        tool: "scripts/generate-address-backgrounds.mjs using packages/address-signature (dependency-free)",
        author: "Universal Profiles design system",
        license: "Apache-2.0 (same as the generator); the outputs contain no third-party material",
        rightsNote: "Deterministic outputs of the Address Signature algorithm for public EIP-55 test-vector addresses; not real profiles. Regenerate with the script; do not edit by hand.",
        publication: "public",
        assets,
      },
      null,
      2,
    )}\n`,
  );
  return files;
}

export function checkOutputs() {
  const files = generate();
  const problems = [];
  for (const [rel, content] of files) {
    const abs = join(ROOT, OUT_DIR, rel);
    const current = existsSync(abs) ? readFileSync(abs, "utf8") : null;
    if (current !== content) problems.push(`stale: ${OUT_DIR}/${rel}`);
  }
  const exampleDir = join(ROOT, OUT_DIR, "examples");
  if (existsSync(exampleDir)) {
    for (const name of readdirSync(exampleDir)) {
      if (!files.has(`examples/${name}`)) problems.push(`unexpected file not produced by the generator: ${OUT_DIR}/examples/${name}`);
    }
  }
  return problems;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  if (CHECK) {
    const problems = checkOutputs();
    if (problems.length) {
      console.error(problems.join("\n"));
      console.error("Run: node scripts/generate-address-backgrounds.mjs");
      process.exit(1);
    }
    console.log(`address-gradient examples are up to date (${generate().size} files)`);
  } else {
    const files = generate();
    let changed = 0;
    for (const [rel, content] of files) {
      const abs = join(ROOT, OUT_DIR, rel);
      const current = existsSync(abs) ? readFileSync(abs, "utf8") : null;
      if (current === content) continue;
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
      changed++;
      console.log(`wrote ${OUT_DIR}/${rel}`);
    }
    console.log(`generated ${files.size} files (${changed} changed)`);
  }
}
