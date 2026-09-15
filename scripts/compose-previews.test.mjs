import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import { PREVIEWS_DIR, compareSheet, composeAll, reconcileSheet, writeSheets } from "./compose-previews.mjs";
import { decodePng, encodeRgbPng, pngChunks } from "./lib/png.mjs";

/*
 * The contact-sheet contract is pixels, not bytes: the deflate stream comes from the zlib the running
 * Node bundles, so the same pixels encode to different bytes on different Node lines. These tests build
 * a throwaway previews record with tiny inputs and prove that write mode creates a missing sheet, keeps a
 * committed sheet byte for byte when its pixels already match (whatever encoder wrote it), and rewrites
 * it only when a pixel differs or the file cannot be read.
 */

// ---------------------------------------------------------------- fixtures
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
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/**
 * Re-encode a decoded RGBA image as an 8-bit RGB PNG with a different byte layout than encodeRgbPng
 * produces: filter type 0 on every scanline, a fast deflate level and a text chunk. Same pixels,
 * different bytes, the way another zlib (or another tool) would write the same picture.
 */
function otherEncoding(image) {
  const { width, height, data } = image;
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const s = (y * width + x) * 4;
      const d = y * (stride + 1) + 1 + x * 3;
      raw[d] = data[s];
      raw[d + 1] = data[s + 1];
      raw[d + 2] = data[s + 2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("tEXt", Buffer.from("Software\0another encoder", "latin1")), chunk("IDAT", deflateSync(raw, { level: 1 })), chunk("IEND", Buffer.alloc(0))]);
}

/** An opaque RGBA test image whose pixels follow a simple formula, so that any drift is visible. */
function pattern(width, height, seed) {
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      data[o] = (x * 37 + seed) & 0xff;
      data[o + 1] = (y * 59 + seed * 3) & 0xff;
      data[o + 2] = (x * y + seed * 7) & 0xff;
      data[o + 3] = 255;
    }
  }
  return { width, height, data };
}

/**
 * A throwaway repository root holding one previews record with two contact sheets (a 12 by 8 and a
 * 10 by 6 canvas) over two small inputs, plus a base-composition entry the composer must skip.
 */
function makeRoot() {
  const root = mkdtempSync(join(tmpdir(), "compose-previews-"));
  const dir = join(root, PREVIEWS_DIR);
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(root, "assets", "inputs"), { recursive: true });
  writeFileSync(join(root, "assets", "inputs", "a.png"), encodeRgbPng({ ...pattern(8, 4, 1), channels: 4 }));
  writeFileSync(join(root, "assets", "inputs", "b.png"), encodeRgbPng({ ...pattern(4, 4, 2), channels: 4 }));
  const record = {
    assets: [
      { path: "sheet-one.png", dimensions: "12x8", composition: { canvas: "#121B21", placements: [{ path: "../../inputs/a.png", x: 1, y: 1, width: 4, height: 2 }, { path: "../../inputs/b.png", x: 7, y: 3, width: 2, height: 2 }] } },
      { path: "sheet-two.png", dimensions: "10x6", composition: { canvas: "#F8FAFB", placements: [{ path: "../../inputs/b.png", x: 2, y: 1, width: 4, height: 4 }] } },
      { path: "showcase.png", dimensions: "10x6", composition: { base: { path: "../../inputs/a.png" }, placements: [] } },
    ],
  };
  writeFileSync(join(dir, "PROVENANCE.json"), JSON.stringify(record, null, 2));
  return { root, dir, record };
}
const withRoot = (fn) => {
  const fixture = makeRoot();
  try {
    return fn(fixture);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
};

// ---------------------------------------------------------------- tests
test("write mode creates a missing sheet, and a second run keeps it byte for byte", () => {
  withRoot(({ root, dir }) => {
    const first = writeSheets(root);
    assert.deepEqual(first.map((o) => [o.path, o.action, o.reason]), [["sheet-one.png", "written", "does not exist"], ["sheet-two.png", "written", "does not exist"]]);
    assert.ok(!existsSync(join(dir, "showcase.png")), "a base composition is not a contact sheet and is never written");
    const bytes = first.map((o) => readFileSync(join(dir, o.path)));
    bytes.forEach((b, i) => {
      assert.equal(sha256(b), first[i].sha256, "the reported hash is the hash of the file on disk");
      assert.equal(compareSheet(composeAll(root, { encode: false })[i].image, b), null, "the written file holds the composed pixels");
    });
    const second = writeSheets(root);
    assert.deepEqual(second.map((o) => o.action), ["kept", "kept"]);
    second.forEach((o, i) => {
      assert.equal(o.reason, "the committed file already has these pixels");
      assert.equal(o.sha256, first[i].sha256, "a kept sheet reports its committed hash");
      assert.ok(readFileSync(join(dir, o.path)).equals(bytes[i]), "the bytes on disk are untouched");
    });
  });
});

test("a committed sheet with the same pixels but different bytes is kept, so its hash survives another zlib", () => {
  withRoot(({ root, dir }) => {
    writeSheets(root);
    const ours = readFileSync(join(dir, "sheet-one.png"));
    const theirs = otherEncoding(decodePng(ours));
    assert.ok(!theirs.equals(ours), "the alternative encoding differs in bytes");
    assert.notEqual(sha256(theirs), sha256(ours));
    assert.deepEqual(pngChunks(theirs).map((c) => c.type), ["IHDR", "tEXt", "IDAT", "IEND"]);
    writeFileSync(join(dir, "sheet-one.png"), theirs);
    const outcomes = writeSheets(root);
    assert.equal(outcomes[0].action, "kept");
    assert.equal(outcomes[0].sha256, sha256(theirs));
    assert.ok(readFileSync(join(dir, "sheet-one.png")).equals(theirs), "the committed bytes were not replaced by a fresh encoding");
    assert.equal(outcomes[1].action, "kept");
  });
});

test("a sheet is rewritten only when a pixel differs, the size differs or the file cannot be decoded", () => {
  withRoot(({ root, dir, record }) => {
    writeSheets(root);
    const good = readFileSync(join(dir, "sheet-one.png"));
    // One channel of one pixel flipped, in an otherwise identical file.
    const drifted = decodePng(good);
    drifted.data[(3 * 12 + 2) * 4 + 1] ^= 0x10;
    writeFileSync(join(dir, "sheet-one.png"), encodeRgbPng({ ...drifted, channels: 4 }));
    let outcomes = writeSheets(root);
    assert.equal(outcomes[0].action, "written");
    assert.match(outcomes[0].reason, /^1 of 96 pixels differ from a fresh composition \(largest channel difference 16\)$/);
    assert.ok(readFileSync(join(dir, "sheet-one.png")).equals(good), "the rewrite restores the composed pixels (same encoder, same bytes)");
    assert.equal(outcomes[1].action, "kept", "the untouched sheet is left alone");
    // A file of the wrong size.
    writeFileSync(join(dir, "sheet-two.png"), encodeRgbPng({ ...pattern(10, 5, 9), channels: 4 }));
    outcomes = writeSheets(root);
    assert.equal(outcomes[1].action, "written");
    assert.equal(outcomes[1].reason, "is 10x5, the composition gives 10x6");
    assert.equal(compareSheet(composeAll(root, { encode: false })[1].image, readFileSync(join(dir, "sheet-two.png"))), null);
    // A file that is not a PNG.
    writeFileSync(join(dir, "sheet-two.png"), "not a png");
    outcomes = writeSheets(root);
    assert.equal(outcomes[1].action, "written");
    assert.match(outcomes[1].reason, /^cannot be decoded: not a PNG/);
    assert.equal(compareSheet(composeAll(root, { encode: false })[1].image, readFileSync(join(dir, "sheet-two.png"))), null);
    // A changed placement table changes the pixels, so the sheet is written again; the record stays the source.
    record.assets[0].composition.canvas = "#000000";
    writeFileSync(join(dir, "PROVENANCE.json"), JSON.stringify(record, null, 2));
    outcomes = writeSheets(root);
    assert.equal(outcomes[0].action, "written");
    assert.match(outcomes[0].reason, /pixels differ from a fresh composition/);
    const back = decodePng(readFileSync(join(dir, "sheet-one.png")));
    assert.deepEqual([back.data[0], back.data[1], back.data[2]], [0, 0, 0], "the canvas now follows the record");
  });
});

test("reconcileSheet keeps matching bytes as they are and encodes only when it must", () => {
  const image = pattern(6, 3, 4);
  const encoded = encodeRgbPng({ ...image, channels: 4 });
  const kept = reconcileSheet(image, otherEncoding(image));
  assert.equal(kept.action, "kept");
  assert.ok(!kept.bytes.equals(encoded), "the kept bytes are the committed ones, not a fresh encoding");
  assert.equal(compareSheet(image, kept.bytes), null);
  const missing = reconcileSheet(image, null);
  assert.deepEqual([missing.action, missing.reason], ["written", "does not exist"]);
  assert.ok(missing.bytes.equals(encoded));
  const corrupt = reconcileSheet(image, Buffer.from("\x89PNG\r\n\x1a\nbroken"));
  assert.equal(corrupt.action, "written");
  assert.match(corrupt.reason, /^cannot be decoded: /);
  assert.ok(corrupt.bytes.equals(encoded));
  const other = pattern(6, 3, 5);
  const differs = reconcileSheet(image, encodeRgbPng({ ...other, channels: 4 }));
  assert.equal(differs.action, "written");
  assert.match(differs.reason, /of 18 pixels differ/);
  assert.ok(differs.bytes.equals(encoded));
});
