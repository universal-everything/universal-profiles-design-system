import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { alphaStats, decodePng, pngChunks, pngInfo } from "./png.mjs";

// ---------------------------------------------------------------- a tiny encoder for fixtures
const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "latin1");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};
const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};
/** Forward-filter raw scanlines (stride bytes each) with one filter type, or a rotating type when `filter` is "mixed". */
function filterLines(raw, stride, height, bpp, filter) {
  const out = Buffer.alloc((stride + 1) * height);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const line = raw.subarray(y * stride, (y + 1) * stride);
    const f = filter === "mixed" ? y % 5 : filter;
    out[y * (stride + 1)] = f;
    const dst = out.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      const pred = f === 0 ? 0 : f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : paeth(a, b, c);
      dst[i] = (line[i] - pred) & 0xff;
    }
    prev = line;
  }
  return out;
}
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
/**
 * Encode `samples` (an array of per-pixel sample arrays in the file's colour type and bit depth) as a PNG.
 * Options: filter (0 to 4 or "mixed"), interlaced (Adam7), palette (Buffer), trns (Buffer), text ({ keyword: value }).
 */
function encodePng({ width, height, colourType, bitDepth = 8, samples, filter = 0, interlaced = false, palette = null, trns = null, text = {} }) {
  const channels = CHANNELS[colourType];
  const bitsPerPixel = channels * bitDepth;
  const bpp = Math.max(1, Math.ceil(bitsPerPixel / 8));
  const packRows = (pixels, w, h) => {
    const stride = Math.ceil((w * bitsPerPixel) / 8);
    const raw = Buffer.alloc(stride * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = pixels[y * w + x];
        for (let ch = 0; ch < channels; ch++) {
          const n = x * channels + ch;
          if (bitDepth === 16) raw.writeUInt16BE(px[ch], y * stride + n * 2);
          else if (bitDepth === 8) raw[y * stride + n] = px[ch];
          else {
            const bitPos = n * bitDepth;
            raw[y * stride + (bitPos >> 3)] |= px[ch] << (8 - bitDepth - (bitPos & 7));
          }
        }
      }
    }
    return { raw, stride };
  };
  let body;
  if (!interlaced) {
    const { raw, stride } = packRows(samples, width, height);
    body = filterLines(raw, stride, height, bpp, filter);
  } else {
    const parts = [];
    for (const [x0, y0, dx, dy] of [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]]) {
      const pw = Math.ceil((width - x0) / dx);
      const ph = Math.ceil((height - y0) / dy);
      if (pw <= 0 || ph <= 0) continue;
      const pixels = [];
      for (let py = 0; py < ph; py++) for (let px = 0; px < pw; px++) pixels.push(samples[(y0 + py * dy) * width + (x0 + px * dx)]);
      const { raw, stride } = packRows(pixels, pw, ph);
      parts.push(filterLines(raw, stride, ph, bpp, filter));
    }
    body = Buffer.concat(parts);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = bitDepth;
  ihdr[9] = colourType;
  ihdr[12] = interlaced ? 1 : 0;
  const chunks = [chunk("IHDR", ihdr)];
  if (palette) chunks.push(chunk("PLTE", palette));
  if (trns) chunks.push(chunk("tRNS", trns));
  for (const [k, v] of Object.entries(text)) chunks.push(chunk("tEXt", Buffer.from(`${k}\0${v}`, "latin1")));
  chunks.push(chunk("IDAT", deflateSync(body)), chunk("IEND", Buffer.alloc(0)));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ...chunks]);
}
const rgbaAt = (img, x, y) => [...img.data.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4)];
const pattern = (w, h, fn) => Array.from({ length: w * h }, (_, i) => fn(i % w, Math.floor(i / w)));

// ---------------------------------------------------------------- tests
test("RGBA 8-bit decodes exactly under every filter type, plain and interlaced", () => {
  const w = 13;
  const h = 11;
  const samples = pattern(w, h, (x, y) => [(x * 19) & 0xff, (y * 23) & 0xff, (x * y) & 0xff, x === 0 || y === 0 ? 0 : 255]);
  for (const filter of [0, 1, 2, 3, 4, "mixed"]) {
    for (const interlaced of [false, true]) {
      const img = decodePng(encodePng({ width: w, height: h, colourType: 6, samples, filter, interlaced }));
      assert.equal(img.width, w);
      assert.equal(img.height, h);
      assert.equal(img.info.interlaced, interlaced);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) assert.deepEqual(rgbaAt(img, x, y), samples[y * w + x], `filter ${filter} interlaced ${interlaced} at ${x},${y}`);
    }
  }
});

test("RGB, greyscale, greyscale-alpha, 16-bit and palette images expand to RGBA", () => {
  const rgb = decodePng(encodePng({ width: 3, height: 2, colourType: 2, samples: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15], [16, 17, 18]], filter: 4 }));
  assert.deepEqual(rgbaAt(rgb, 2, 1), [16, 17, 18, 255]);
  assert.equal(rgb.info.hasAlphaChannel, false);
  const grey = decodePng(encodePng({ width: 2, height: 2, colourType: 0, samples: [[0], [128], [200], [255]] }));
  assert.deepEqual(rgbaAt(grey, 1, 0), [128, 128, 128, 255]);
  const greyAlpha = decodePng(encodePng({ width: 2, height: 1, colourType: 4, samples: [[10, 0], [20, 90]], filter: 1 }));
  assert.deepEqual(rgbaAt(greyAlpha, 0, 0), [10, 10, 10, 0]);
  assert.deepEqual(rgbaAt(greyAlpha, 1, 0), [20, 20, 20, 90]);
  const sixteen = decodePng(encodePng({ width: 2, height: 1, colourType: 2, bitDepth: 16, samples: [[0x1234, 0xabcd, 0xffff], [0, 0x8000, 0x00ff]], filter: 2 }));
  assert.deepEqual(rgbaAt(sixteen, 0, 0), [0x12, 0xab, 0xff, 255]);
  assert.deepEqual(rgbaAt(sixteen, 1, 0), [0, 0x80, 0, 255]);
  assert.equal(sixteen.info.bitDepth, 16);
  const palette = Buffer.from([255, 0, 0, 0, 255, 0, 0, 0, 255, 9, 9, 9]);
  const indexed = decodePng(encodePng({ width: 4, height: 1, colourType: 3, bitDepth: 2, samples: [[0], [1], [2], [3]], palette, trns: Buffer.from([255, 0]) }));
  assert.deepEqual(rgbaAt(indexed, 0, 0), [255, 0, 0, 255]);
  assert.deepEqual(rgbaAt(indexed, 1, 0), [0, 255, 0, 0]);
  assert.deepEqual(rgbaAt(indexed, 3, 0), [9, 9, 9, 255]);
  assert.equal(indexed.info.colourTypeName, "indexed");
  assert.equal(indexed.info.canBeTransparent, true);
  const keyed = decodePng(encodePng({ width: 2, height: 1, colourType: 2, samples: [[1, 2, 3], [4, 5, 6]], trns: Buffer.from([0, 4, 0, 5, 0, 6]) }));
  assert.deepEqual(rgbaAt(keyed, 1, 0), [4, 5, 6, 0]);
});

test("alphaStats reports transparent exteriors, corners, edges and tight crops", () => {
  const w = 10;
  const h = 8;
  const loose = decodePng(encodePng({ width: w, height: h, colourType: 6, samples: pattern(w, h, (x, y) => [50, 60, 70, x >= 2 && x < 8 && y >= 1 && y < 7 ? 255 : 0]) }));
  const st = alphaStats(loose);
  assert.equal(st.tight, false);
  assert.equal(st.cornersTransparent, true);
  assert.equal(st.edgeTransparentFraction, 1);
  assert.deepEqual(st.visible, { x: 2, y: 1, width: 6, height: 6 });
  assert.equal(st.transparent, w * h - 36);
  assert.equal(st.partial, 0);
  // Rounded corners only: tight, corners transparent, most of the edge opaque.
  const rounded = decodePng(encodePng({ width: w, height: h, colourType: 6, samples: pattern(w, h, (x, y) => [1, 2, 3, (x === 0 || x === w - 1) && (y === 0 || y === h - 1) ? 0 : 255]) }));
  const rs = alphaStats(rounded);
  assert.equal(rs.tight, true);
  assert.equal(rs.cornersTransparent, true);
  assert.equal(rs.transparent, 4);
  assert.ok(rs.edgeTransparentFraction > 0 && rs.edgeTransparentFraction < 0.2);
  const opaque = decodePng(encodePng({ width: 3, height: 3, colourType: 2, samples: pattern(3, 3, () => [9, 9, 9]) }));
  const os = alphaStats(opaque);
  assert.equal(os.transparent, 0);
  assert.equal(os.cornersTransparent, false);
  assert.equal(os.tight, true);
});

test("pngInfo reads text chunks and pngChunks rejects corrupt files", () => {
  const buf = encodePng({ width: 1, height: 1, colourType: 6, samples: [[1, 2, 3, 4]], text: { Software: "test", Comment: "hello" } });
  const info = pngInfo(buf);
  assert.deepEqual(info.text, { Software: "test", Comment: "hello" });
  assert.equal(info.contentCredentials, null);
  assert.equal(info.hasAlphaChannel, true);
  assert.equal(pngChunks(buf).map((c) => c.type).join(","), "IHDR,tEXt,tEXt,IDAT,IEND");
  const corrupt = Buffer.from(buf);
  corrupt[corrupt.length - 20] ^= 0xff; // inside IDAT
  assert.throws(() => pngChunks(corrupt), /CRC mismatch/);
  assert.throws(() => pngChunks(Buffer.from("not a png at all")), /bad signature/);
  assert.throws(() => decodePng(buf.subarray(0, buf.length - 4)), /truncated|IEND/);
});

test("a C2PA manifest chunk is summarised from its plain-text labels", () => {
  // A stand-in caBX payload with the CBOR text markers the reader looks for (length byte 0x60 + n before each string).
  const manifest = Buffer.concat([
    Buffer.from("jumbf c2pa.assertions c2pa.actions.v2 c2pa.created c2pa.converted softwareAgent ", "latin1"),
    Buffer.from([0x64]), Buffer.from("name", "latin1"), Buffer.from([0x69]), Buffer.from("gpt-image", "latin1"),
    Buffer.from([0x67]), Buffer.from("version", "latin1"), Buffer.from([0x63]), Buffer.from("2.0", "latin1"),
    Buffer.from(" c2pa.claim.v2 OpenAI Media Service API specVersion", "latin1"), Buffer.from([0x65]), Buffer.from("2.2.0 OpenAI OpCo, LLC 20260915191310.359796Z", "latin1"),
  ]);
  const plain = encodePng({ width: 1, height: 1, colourType: 2, samples: [[1, 2, 3]] });
  const chunks = pngChunks(plain);
  const withManifest = Buffer.concat([plain.subarray(0, 8), chunk("IHDR", chunks[0].data), chunk("caBX", manifest), ...chunks.slice(1).map((c) => chunk(c.type, c.data))]);
  const cc = pngInfo(withManifest).contentCredentials;
  assert.equal(cc.c2pa, true);
  assert.equal(cc.softwareAgent, "gpt-image 2.0");
  assert.equal(cc.claimGenerator, "OpenAI Media Service API");
  assert.deepEqual(cc.actions, ["c2pa.created", "c2pa.converted"]);
  assert.equal(cc.signer, "OpenAI OpCo, LLC");
  assert.equal(cc.specVersion, "2.2.0");
  assert.equal(cc.timestamp, "2026-09-15T19:13:10Z");
});
