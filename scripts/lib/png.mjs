/**
 * Minimal PNG reader shared by the validators. Dependency-free (node:zlib only).
 *
 * - `pngChunks(buf)` splits a PNG into its chunks and checks the signature and CRCs.
 * - `pngInfo(buf)` reads the header (size, bit depth, colour type, interlace), the ancillary
 *   metadata that matters for provenance (text chunks, physical size, embedded C2PA manifest) and
 *   whether the file can carry transparency at all.
 * - `decodePng(buf)` inflates and unfilters the image (8 and 16 bit; greyscale, RGB, palette,
 *   greyscale-alpha and RGBA; interlaced or not) into 8-bit RGBA samples.
 * - `alphaStats(image)` measures transparency: how many pixels are transparent, whether the
 *   corners and edges are, and the bounding box of the visible pixels (a tight crop touches all
 *   four edges).
 *
 * Nothing here is an image library; it exists so the gate can prove facts about committed rasters
 * (real alpha channel, transparent exterior, tight crop, content-credentials chunk) on Node alone.
 */
import { inflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
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

/** Channels per pixel for each PNG colour type (palette entries expand to RGB on decode). */
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
export const COLOUR_TYPE_NAMES = { 0: "greyscale", 2: "RGB", 3: "indexed", 4: "greyscale with alpha", 6: "RGBA" };

/** Split a PNG into chunks; throws on a bad signature, a truncated chunk or a CRC mismatch. */
export function pngChunks(buf) {
  if (buf.length < 8 || !buf.subarray(0, 8).equals(SIGNATURE)) throw new Error("not a PNG (bad signature)");
  const chunks = [];
  let p = 8;
  while (p < buf.length) {
    if (p + 12 > buf.length) throw new Error("truncated chunk header");
    const length = buf.readUInt32BE(p);
    const type = buf.toString("latin1", p + 4, p + 8);
    if (p + 12 + length > buf.length) throw new Error(`truncated ${type} chunk`);
    const data = buf.subarray(p + 8, p + 8 + length);
    const crc = buf.readUInt32BE(p + 8 + length);
    if (crc32(buf.subarray(p + 4, p + 8 + length)) !== crc) throw new Error(`CRC mismatch in ${type} chunk`);
    chunks.push({ type, data });
    p += 12 + length;
    if (type === "IEND") break;
  }
  if (!chunks.length || chunks[0].type !== "IHDR") throw new Error("first chunk is not IHDR");
  if (chunks[chunks.length - 1].type !== "IEND") throw new Error("no IEND chunk");
  return chunks;
}

const tsaTime = (s) => {
  const m = s.match(/(20[0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})\.[0-9]+Z/);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : null;
};

/**
 * Read the short CBOR text value that follows `key` inside the map introduced by `after` (the C2PA
 * assertions are CBOR; a text string of up to 23 bytes is one length byte 0x60 + n, then the bytes).
 */
const cborTextAfter = (s, after, key) => {
  const start = s.indexOf(after);
  if (start === -1) return null;
  const at = s.indexOf(key, start);
  if (at === -1) return null;
  const lengthByte = s.charCodeAt(at + key.length);
  if (lengthByte < 0x60 || lengthByte > 0x77) return null;
  const length = lengthByte - 0x60;
  return s.slice(at + key.length + 1, at + key.length + 1 + length);
};

const latin1Text = (data) => {
  const nul = data.indexOf(0);
  return { keyword: data.toString("latin1", 0, nul === -1 ? data.length : nul), text: nul === -1 ? "" : data.toString("latin1", nul + 1) };
};

/** Header and metadata facts without decoding pixels. */
export function pngInfo(buf) {
  const chunks = pngChunks(buf);
  const ihdr = chunks[0].data;
  if (ihdr.length !== 13) throw new Error("IHDR must be 13 bytes");
  const info = {
    width: ihdr.readUInt32BE(0),
    height: ihdr.readUInt32BE(4),
    bitDepth: ihdr[8],
    colourType: ihdr[9],
    interlaced: ihdr[12] === 1,
    chunkTypes: [...new Set(chunks.map((c) => c.type))],
    text: {},
    hasTransparencyChunk: chunks.some((c) => c.type === "tRNS"),
    contentCredentials: null,
    physical: null,
  };
  if (!(info.colourType in CHANNELS)) throw new Error(`unknown colour type ${info.colourType}`);
  info.colourTypeName = COLOUR_TYPE_NAMES[info.colourType];
  info.channels = CHANNELS[info.colourType];
  // An alpha channel exists for colour types 4 and 6; palette and opaque types can only add transparency through tRNS.
  info.hasAlphaChannel = info.colourType === 4 || info.colourType === 6;
  info.canBeTransparent = info.hasAlphaChannel || info.hasTransparencyChunk;
  for (const c of chunks) {
    if (c.type === "tEXt") {
      const { keyword, text } = latin1Text(c.data);
      info.text[keyword] = text;
    } else if (c.type === "iTXt") {
      const { keyword } = latin1Text(c.data);
      info.text[keyword] = "(international text)";
    } else if (c.type === "pHYs" && c.data.length === 9) {
      info.physical = { x: c.data.readUInt32BE(0), y: c.data.readUInt32BE(4), unit: c.data[8] === 1 ? "metre" : "unknown" };
    } else if (c.type === "caBX") {
      // C2PA content credentials live in a JUMBF box; the manifest labels are plain text inside it.
      const s = c.data.toString("latin1");
      const agentName = cborTextAfter(s, "softwareAgent", "name");
      const agentVersion = cborTextAfter(s, "softwareAgent", "version");
      info.contentCredentials = {
        bytes: c.data.length,
        c2pa: s.includes("c2pa.claim") || s.includes("c2pa.assertions"),
        softwareAgent: agentName ? `${agentName}${agentVersion ? ` ${agentVersion}` : ""}` : null,
        claimGenerator: /OpenAI Media Service API/.test(s) ? "OpenAI Media Service API" : null,
        actions: ["c2pa.created", "c2pa.converted", "c2pa.watermarked.unbound", "c2pa.edited", "c2pa.opened", "c2pa.placed"].filter((a) => s.includes(a)),
        signer: /OpenAI OpCo, LLC/.test(s) ? "OpenAI OpCo, LLC" : null,
        specVersion: s.match(/specVersion[a-z]([0-9]+\.[0-9]+\.[0-9]+)/)?.[1] ?? null,
        // The time-stamp authority token records when the manifest was countersigned (GeneralizedTime with fractional seconds).
        timestamp: tsaTime(s),
      };
    }
  }
  return info;
}

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/** Reverse the per-scanline filters of one (sub)image in place; returns the raw samples without filter bytes. */
function unfilter(data, width, height, bpp, bitsPerPixel) {
  const stride = Math.ceil((width * bitsPerPixel) / 8);
  const out = Buffer.alloc(stride * height);
  let prev = Buffer.alloc(stride);
  let p = 0;
  for (let y = 0; y < height; y++) {
    const filter = data[p++];
    const line = out.subarray(y * stride, (y + 1) * stride);
    data.copy(line, 0, p, p + stride);
    p += stride;
    switch (filter) {
      case 0:
        break;
      case 1:
        for (let i = bpp; i < stride; i++) line[i] = (line[i] + line[i - bpp]) & 0xff;
        break;
      case 2:
        for (let i = 0; i < stride; i++) line[i] = (line[i] + prev[i]) & 0xff;
        break;
      case 3:
        for (let i = 0; i < stride; i++) line[i] = (line[i] + ((i >= bpp ? line[i - bpp] : 0) + prev[i]) / 2) & 0xff;
        break;
      case 4:
        for (let i = 0; i < stride; i++) line[i] = (line[i] + paeth(i >= bpp ? line[i - bpp] : 0, prev[i], i >= bpp ? prev[i - bpp] : 0)) & 0xff;
        break;
      default:
        throw new Error(`unknown filter type ${filter} on scanline ${y}`);
    }
    prev = line;
  }
  return { samples: out, stride, consumed: p };
}

/**
 * Decode to 8-bit RGBA. 16-bit samples keep their high byte; palette and greyscale expand to RGB;
 * transparency declared through tRNS becomes an alpha value of 0 for the matching colour or index.
 */
export function decodePng(buf) {
  const chunks = pngChunks(buf);
  const info = pngInfo(buf);
  const { width, height, bitDepth, colourType, channels } = info;
  if (![1, 2, 4, 8, 16].includes(bitDepth)) throw new Error(`unsupported bit depth ${bitDepth}`);
  if (colourType !== 0 && colourType !== 3 && bitDepth < 8) throw new Error(`bit depth ${bitDepth} is not valid for colour type ${colourType}`);
  const palette = chunks.find((c) => c.type === "PLTE")?.data ?? null;
  const trns = chunks.find((c) => c.type === "tRNS")?.data ?? null;
  if (colourType === 3 && !palette) throw new Error("indexed PNG without PLTE");
  const idat = Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.data));
  const raw = inflateSync(idat);
  const bitsPerPixel = channels * bitDepth;
  const bpp = Math.max(1, Math.ceil(bitsPerPixel / 8));
  const rgba = Buffer.alloc(width * height * 4);
  const maxSample = (1 << bitDepth) - 1;

  // Read the n-th sample of a scanline as an 8-bit value (16-bit keeps the high byte).
  const sampleAt = (line, n) => {
    if (bitDepth === 8) return line[n];
    if (bitDepth === 16) return line[n * 2];
    const bitPos = n * bitDepth;
    const byte = line[bitPos >> 3];
    const shift = 8 - bitDepth - (bitPos & 7);
    const v = (byte >> shift) & maxSample;
    return colourType === 3 ? v : Math.round((v * 255) / maxSample);
  };
  const rawSampleAt = (line, n) => {
    if (bitDepth === 16) return line.readUInt16BE(n * 2);
    if (bitDepth === 8) return line[n];
    const bitPos = n * bitDepth;
    return (line[bitPos >> 3] >> (8 - bitDepth - (bitPos & 7))) & maxSample;
  };
  const trnsGrey = trns && colourType === 0 && trns.length >= 2 ? trns.readUInt16BE(0) : null;
  const trnsRgb = trns && colourType === 2 && trns.length >= 6 ? [trns.readUInt16BE(0), trns.readUInt16BE(2), trns.readUInt16BE(4)] : null;

  const writePixel = (line, n, x, y) => {
    const o = (y * width + x) * 4;
    switch (colourType) {
      case 0: {
        const g = sampleAt(line, n);
        rgba[o] = rgba[o + 1] = rgba[o + 2] = g;
        rgba[o + 3] = trnsGrey !== null && rawSampleAt(line, n) === trnsGrey ? 0 : 255;
        break;
      }
      case 2: {
        rgba[o] = sampleAt(line, n * 3);
        rgba[o + 1] = sampleAt(line, n * 3 + 1);
        rgba[o + 2] = sampleAt(line, n * 3 + 2);
        rgba[o + 3] = trnsRgb && rawSampleAt(line, n * 3) === trnsRgb[0] && rawSampleAt(line, n * 3 + 1) === trnsRgb[1] && rawSampleAt(line, n * 3 + 2) === trnsRgb[2] ? 0 : 255;
        break;
      }
      case 3: {
        const idx = sampleAt(line, n);
        if (idx * 3 + 2 >= palette.length) throw new Error(`palette index ${idx} out of range`);
        rgba[o] = palette[idx * 3];
        rgba[o + 1] = palette[idx * 3 + 1];
        rgba[o + 2] = palette[idx * 3 + 2];
        rgba[o + 3] = trns && idx < trns.length ? trns[idx] : 255;
        break;
      }
      case 4: {
        const g = sampleAt(line, n * 2);
        rgba[o] = rgba[o + 1] = rgba[o + 2] = g;
        rgba[o + 3] = sampleAt(line, n * 2 + 1);
        break;
      }
      case 6: {
        rgba[o] = sampleAt(line, n * 4);
        rgba[o + 1] = sampleAt(line, n * 4 + 1);
        rgba[o + 2] = sampleAt(line, n * 4 + 2);
        rgba[o + 3] = sampleAt(line, n * 4 + 3);
        break;
      }
      default:
        throw new Error(`unknown colour type ${colourType}`);
    }
  };

  if (!info.interlaced) {
    const { samples, stride, consumed } = unfilter(raw, width, height, bpp, bitsPerPixel);
    if (consumed !== raw.length) throw new Error(`image data length ${raw.length} does not match ${consumed} expected bytes`);
    for (let y = 0; y < height; y++) {
      const line = samples.subarray(y * stride, (y + 1) * stride);
      for (let x = 0; x < width; x++) writePixel(line, x, x, y);
    }
  } else {
    // Adam7: seven passes, each a sub-image with its own filtered scanlines.
    const passes = [
      [0, 0, 8, 8],
      [4, 0, 8, 8],
      [0, 4, 4, 8],
      [2, 0, 4, 4],
      [0, 2, 2, 4],
      [1, 0, 2, 2],
      [0, 1, 1, 2],
    ];
    let offset = 0;
    for (const [x0, y0, dx, dy] of passes) {
      const pw = Math.ceil((width - x0) / dx);
      const ph = Math.ceil((height - y0) / dy);
      if (pw <= 0 || ph <= 0) continue;
      const { samples, stride, consumed } = unfilter(raw.subarray(offset), pw, ph, bpp, bitsPerPixel);
      offset += consumed;
      for (let py = 0; py < ph; py++) {
        const line = samples.subarray(py * stride, (py + 1) * stride);
        for (let px = 0; px < pw; px++) writePixel(line, px, x0 + px * dx, y0 + py * dy);
      }
    }
    if (offset !== raw.length) throw new Error(`interlaced image data length ${raw.length} does not match ${offset} expected bytes`);
  }
  return { width, height, data: rgba, info };
}

/**
 * Transparency facts for a decoded image. `threshold` is the alpha value at or below which a pixel
 * counts as transparent (0 means fully transparent only).
 */
export function alphaStats(image, threshold = 0) {
  const { width, height, data } = image;
  const total = width * height;
  let transparent = 0;
  let partial = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a <= threshold) {
        transparent++;
        continue;
      }
      if (a < 255) partial++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const alphaAt = (x, y) => data[(y * width + x) * 4 + 3];
  const corners = [alphaAt(0, 0), alphaAt(width - 1, 0), alphaAt(0, height - 1), alphaAt(width - 1, height - 1)];
  let edgeTransparent = 0;
  let edgeTotal = 0;
  for (let x = 0; x < width; x++) for (const y of [0, height - 1]) { edgeTotal++; if (alphaAt(x, y) <= threshold) edgeTransparent++; }
  for (let y = 1; y < height - 1; y++) for (const x of [0, width - 1]) { edgeTotal++; if (alphaAt(x, y) <= threshold) edgeTransparent++; }
  const visible = maxX >= 0 ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null;
  return {
    total,
    transparent,
    partial,
    opaque: total - transparent - partial,
    transparentFraction: transparent / total,
    cornersTransparent: corners.every((a) => a <= threshold),
    edgeTransparentFraction: edgeTotal ? edgeTransparent / edgeTotal : 0,
    visible,
    // A tight crop leaves no fully transparent row or column at any edge.
    tight: visible !== null && visible.x === 0 && visible.y === 0 && visible.width === width && visible.height === height,
  };
}
