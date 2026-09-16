#!/usr/bin/env node
/**
 * Compose the background contact sheets under assets/slides/previews from the placement tables in
 * that directory's PROVENANCE.json, on Node alone.
 *
 *   node scripts/compose-previews.mjs           # write every contact sheet whose pixels changed; keep the rest
 *   node scripts/compose-previews.mjs --check   # exit 1 if any sheet's pixels differ from a fresh composition
 *
 * A composition entry with a `canvas` colour and no `base` is a contact sheet: the canvas is filled
 * with the colour, then every placement is area-averaged (the box filter of scripts/lib/png.mjs) to
 * its width and height and copied to its x and y. The output is 8-bit RGB without alpha and carries
 * no ancillary chunk, so the same inputs always give the same pixels; the validators' `branded` and
 * `ambient` checks decode their respective sheet pair and require exactly these pixels, while the
 * `rasters` check measures every placement independently. Entries with a `base` (the app showcases,
 * made with a soft shadow in an image tool) are left alone and reported as skipped.
 *
 * The contract is pixels, not bytes. The encoder's deflate stream comes from the zlib the running
 * Node bundles, and different Node lines bundle different zlib releases, so the same pixels encode to
 * different bytes (and a different hash) from one Node to the next. Write mode therefore decodes the
 * committed sheet first and leaves it untouched when its pixels already equal the fresh composition:
 * `npm run build` is idempotent on every supported Node, and a committed hash changes only when the
 * picture does. Only when a sheet is missing, unreadable or differs in at least one pixel is it
 * written; paste that sheet's printed hash into its record entry and into the pinned selection.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng, encodeRgbPng, scaleArea } from "./lib/png.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const PREVIEWS_DIR = "assets/slides/previews";
const CHECK = process.argv.includes("--check");

const parseColour = (hex) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex ?? "");
  if (!m) throw new Error(`canvas colour ${hex} is not #RRGGBB`);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
};

/** The contact-sheet entries of a previews record: a canvas colour, placements and no base. */
export const contactSheets = (record) => (record.assets ?? []).filter((a) => a.composition?.canvas && !a.composition.base);

/**
 * Compose one contact sheet and return its RGBA samples. `readInput(path)` resolves an input path
 * relative to the record's directory and returns a decoded image.
 */
export function composeSheet(entry, readInput) {
  const [width, height] = String(entry.dimensions).split("x").map(Number);
  if (!Number.isInteger(width) || !Number.isInteger(height)) throw new Error(`${entry.path}: dimensions ${entry.dimensions} are not WxH`);
  const [r, g, b] = parseColour(entry.composition.canvas);
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  for (const p of entry.composition.placements ?? []) {
    if ([p.x, p.y, p.width, p.height].some((v) => !Number.isInteger(v) || v < 0)) throw new Error(`${entry.path}: placement of ${p.path} needs integer x, y, width and height`);
    if (p.x + p.width > width || p.y + p.height > height) throw new Error(`${entry.path}: placement of ${p.path} leaves the canvas`);
    const scaled = scaleArea(readInput(p.path), p.width, p.height);
    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        const q = (y * p.width + x) * 4;
        const o = ((p.y + y) * width + p.x + x) * 4;
        // Inputs are opaque backgrounds; a transparent source pixel would keep the canvas colour.
        if (!scaled[q + 3]) continue;
        data[o] = Math.round(scaled[q]);
        data[o + 1] = Math.round(scaled[q + 1]);
        data[o + 2] = Math.round(scaled[q + 2]);
      }
    }
  }
  return { width, height, data };
}

/** Compose every contact sheet of the record; returns [{ entry, image, png }] (png only when `encode` is true). */
export function composeAll(root = ROOT, { encode = true } = {}) {
  const dir = join(root, PREVIEWS_DIR);
  const record = JSON.parse(readFileSync(join(dir, "PROVENANCE.json"), "utf8"));
  const cache = new Map();
  const readInput = (p) => {
    const abs = resolve(dir, p);
    if (!existsSync(abs)) throw new Error(`input ${p} does not exist`);
    if (!cache.has(abs)) cache.set(abs, decodePng(readFileSync(abs)));
    return cache.get(abs);
  };
  return contactSheets(record).map((entry) => {
    const image = composeSheet(entry, readInput);
    return { entry, image, png: encode ? encodeRgbPng({ ...image, channels: 4 }) : null };
  });
}

/** Pixel-exact comparison of a composed sheet with the committed file; returns the first difference or null. */
export function compareSheet(image, fileBuffer) {
  const committed = decodePng(fileBuffer);
  if (committed.width !== image.width || committed.height !== image.height) return `is ${committed.width}x${committed.height}, the composition gives ${image.width}x${image.height}`;
  let differing = 0;
  let maxDiff = 0;
  for (let i = 0; i < image.width * image.height; i++) {
    const o = i * 4;
    const d = Math.max(Math.abs(committed.data[o] - image.data[o]), Math.abs(committed.data[o + 1] - image.data[o + 1]), Math.abs(committed.data[o + 2] - image.data[o + 2]));
    if (d) {
      differing++;
      if (d > maxDiff) maxDiff = d;
    }
  }
  return differing ? `${differing} of ${image.width * image.height} pixels differ from a fresh composition (largest channel difference ${maxDiff})` : null;
}

/**
 * Decide what a composed sheet needs given the committed file (`existing`, a Buffer, or null when there
 * is none). When the committed file decodes to exactly the composed pixels it is kept byte for byte,
 * whatever zlib wrote it; otherwise the composition is encoded for writing. Returns
 * `{ action: "kept" | "written", bytes, reason }`, where `bytes` are the bytes the file should hold
 * afterwards and `reason` says why (the pixel difference, "does not exist", or the decode error).
 */
export function reconcileSheet(image, existing) {
  if (existing) {
    let problem;
    try {
      problem = compareSheet(image, existing);
    } catch (e) {
      problem = `cannot be decoded: ${e.message}`;
    }
    if (problem === null) return { action: "kept", bytes: existing, reason: "the committed file already has these pixels" };
    return { action: "written", bytes: encodeRgbPng({ ...image, channels: 4 }), reason: problem };
  }
  return { action: "written", bytes: encodeRgbPng({ ...image, channels: 4 }), reason: "does not exist" };
}

/**
 * Compose every contact sheet of the record under `root`, write only those whose pixels are missing or
 * differ, and return one outcome per sheet: `{ path, width, height, action, reason, bytes, sha256 }`
 * (`sha256` is the hash of the file as it is afterwards, so a kept sheet reports its committed hash).
 */
export function writeSheets(root = ROOT) {
  return composeAll(root, { encode: false }).map(({ entry, image }) => {
    const abs = join(root, PREVIEWS_DIR, entry.path);
    const outcome = reconcileSheet(image, existsSync(abs) ? readFileSync(abs) : null);
    if (outcome.action === "written") writeFileSync(abs, outcome.bytes);
    return { path: entry.path, width: image.width, height: image.height, ...outcome, sha256: createHash("sha256").update(outcome.bytes).digest("hex") };
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (CHECK) {
    const results = composeAll(ROOT, { encode: false });
    let failed = 0;
    for (const { entry, image } of results) {
      const abs = join(ROOT, PREVIEWS_DIR, entry.path);
      const problem = existsSync(abs) ? compareSheet(image, readFileSync(abs)) : "does not exist";
      if (problem) {
        failed++;
        console.error(`${entry.path}: ${problem}`);
      }
    }
    if (failed) process.exit(1);
    console.log(`${results.length} contact sheets match a fresh composition pixel for pixel`);
  } else {
    const outcomes = writeSheets(ROOT);
    for (const o of outcomes) console.log(`${o.path}: ${o.width}x${o.height}, ${o.bytes.length} bytes, sha256 ${o.sha256} (${o.action}: ${o.reason})`);
    const written = outcomes.filter((o) => o.action === "written").length;
    if (written) console.log(`${written} of ${outcomes.length} contact sheets written. Record each written sheet's printed hash in assets/slides/previews/PROVENANCE.json and its set-specific pinned fixture, then run node scripts/validate.mjs --only assets plus the matching --only branded or --only ambient check.`);
    else console.log(`${outcomes.length} contact sheets already hold the composed pixels; nothing written, committed bytes and hashes kept.`);
  }
}
