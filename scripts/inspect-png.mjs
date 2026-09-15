#!/usr/bin/env node
/**
 * Print the facts a provenance entry needs about a PNG, without any image library:
 *
 *   node scripts/inspect-png.mjs <file.png> [more.png ...] [--zone x,y,w,h] [--grid] [--json]
 *
 * For each file: SHA-256, dimensions, bit depth, colour type, alpha facts (transparent pixels,
 * corners, edges, tight crop, visible bounding box), text and physical-size chunks, the embedded
 * C2PA content credentials (software agent, claim generator, actions, signer, time stamp), and the
 * mean luminance and its standard deviation inside the given text-safe zone (fractions of the
 * width and height; default the whole image). `--grid` adds a six-by-four luminance map to find a
 * quiet zone. Read-only; dependency-free.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { alphaStats, decodePng } from "./lib/png.mjs";

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith("--") && !/^[0-9.,]+$/.test(a));
const zoneArg = args.includes("--zone") ? args[args.indexOf("--zone") + 1] : null;
const zone = zoneArg ? zoneArg.split(",").map(Number) : [0, 0, 1, 1];
const asJson = args.includes("--json");
const withGrid = args.includes("--grid");
if (!files.length || zone.length !== 4 || zone.some((v) => Number.isNaN(v))) {
  console.error("usage: node scripts/inspect-png.mjs <file.png> [...] [--zone x,y,w,h] [--grid] [--json]");
  process.exit(2);
}

function luminance(img, [x0, y0, w, h]) {
  const { width, height, data } = img;
  let sum = 0;
  let sum2 = 0;
  let n = 0;
  for (let y = Math.floor(y0 * height); y < Math.floor((y0 + h) * height); y++) {
    for (let x = Math.floor(x0 * width); x < Math.floor((x0 + w) * width); x++) {
      const o = (y * width + x) * 4;
      const l = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
      sum += l;
      sum2 += l * l;
      n++;
    }
  }
  const mean = n ? sum / n : NaN;
  return { mean: +mean.toFixed(1), deviation: +Math.sqrt(Math.max(0, sum2 / n - mean * mean)).toFixed(1) };
}

const results = [];
for (const file of files) {
  const buf = readFileSync(file);
  const img = decodePng(buf);
  const { info } = img;
  const alpha = alphaStats(img);
  const result = {
    file,
    sha256: createHash("sha256").update(buf).digest("hex"),
    dimensions: `${info.width}x${info.height}`,
    aspectRatio: +(info.width / info.height).toFixed(4),
    bitDepth: info.bitDepth,
    colourType: info.colourTypeName,
    interlaced: info.interlaced,
    alphaChannel: info.hasAlphaChannel,
    transparencyChunk: info.hasTransparencyChunk,
    alpha: {
      transparentPixels: alpha.transparent,
      transparentFraction: +alpha.transparentFraction.toFixed(4),
      semiTransparentPixels: alpha.partial,
      cornersTransparent: alpha.cornersTransparent,
      edgeTransparentFraction: +alpha.edgeTransparentFraction.toFixed(4),
      tight: alpha.tight,
      visible: alpha.visible,
    },
    text: info.text,
    physical: info.physical,
    contentCredentials: info.contentCredentials,
    zone: { x: zone[0], y: zone[1], width: zone[2], height: zone[3], ...luminance(img, zone) },
  };
  if (withGrid) {
    result.grid = [];
    for (let r = 0; r < 4; r++) result.grid.push([0, 1, 2, 3, 4, 5].map((c) => luminance(img, [c / 6, r / 4, 1 / 6, 1 / 4])));
  }
  results.push(result);
}

if (asJson) {
  console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
} else {
  for (const r of results) {
    console.log(`${r.file}`);
    console.log(`  sha256        ${r.sha256}`);
    console.log(`  dimensions    ${r.dimensions} (aspect ${r.aspectRatio}) ${r.bitDepth}-bit ${r.colourType}${r.interlaced ? ", interlaced" : ""}`);
    console.log(`  alpha         ${r.alphaChannel ? `channel present; ${r.alpha.transparentPixels} transparent (${(r.alpha.transparentFraction * 100).toFixed(1)} percent), ${r.alpha.semiTransparentPixels} semi-transparent; corners ${r.alpha.cornersTransparent ? "transparent" : "opaque"}; edge ${(r.alpha.edgeTransparentFraction * 100).toFixed(1)} percent transparent; crop ${r.alpha.tight ? "tight" : `loose (visible ${r.alpha.visible.width}x${r.alpha.visible.height} at ${r.alpha.visible.x},${r.alpha.visible.y})`}` : "none"}`);
    if (Object.keys(r.text).length) console.log(`  text          ${Object.entries(r.text).map(([k, v]) => `${k}=${v}`).join("; ")}`);
    if (r.physical) console.log(`  physical      ${r.physical.x} by ${r.physical.y} pixels per ${r.physical.unit}`);
    if (r.contentCredentials) console.log(`  credentials   ${r.contentCredentials.c2pa ? "C2PA" : "unknown"} ${r.contentCredentials.specVersion ?? ""}; agent ${r.contentCredentials.softwareAgent ?? "?"}; generator ${r.contentCredentials.claimGenerator ?? "?"}; actions ${r.contentCredentials.actions.join(", ")}; signer ${r.contentCredentials.signer ?? "?"}; time stamp ${r.contentCredentials.timestamp ?? "?"}`);
    else console.log("  credentials   none");
    console.log(`  zone          x ${r.zone.x} y ${r.zone.y} w ${r.zone.width} h ${r.zone.height}: mean luminance ${r.zone.mean}, deviation ${r.zone.deviation}`);
    if (r.grid) for (const row of r.grid) console.log(`  grid          ${row.map((c) => `${String(c.mean).padStart(5)}/${String(c.deviation).padStart(4)}`).join(" ")}`);
  }
}
