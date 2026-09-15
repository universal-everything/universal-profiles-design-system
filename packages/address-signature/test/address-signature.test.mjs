import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { sha3_256 } from "../src/keccak.mjs";
import {
  ADDRESS_RE,
  ANONYMOUS_LABEL,
  FALLBACK_STOPS,
  IDENTICON_SIZES,
  auraRecipe,
  auraSvg,
  displayName,
  displayNameParts,
  escapeXml,
  gradientCss,
  gradientReactNative,
  gradientStops,
  gradientSvg,
  identiconData,
  identiconSeed,
  identiconSizeFor,
  identiconSvg,
  isAddress,
  isChecksumAddress,
  keccak256,
  nameSuffix,
  normalizeAddress,
  signatureSvg,
  sliceAddress,
  toChecksumAddress,
} from "../src/index.mjs";

const fixtures = JSON.parse(readFileSync(new URL("./fixtures.json", import.meta.url), "utf8")).fixtures;
const VALID = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed";
const LOWER = VALID.toLowerCase();
const UPPER = "0x" + VALID.slice(2).toUpperCase();
const INVALID = [undefined, null, "", "0x", "0x123", "5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "0xZZAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", 42, {}, "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed0"];

test("keccak256 matches the known digests and accepts bytes as well as strings", () => {
  assert.equal(keccak256(""), "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  assert.equal(keccak256("abc"), "4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45");
  assert.equal(keccak256(new TextEncoder().encode("abc")), keccak256("abc"));
  assert.throws(() => keccak256(42), TypeError);
});

test("the sponge absorbs multi-block input correctly (SHA3 padding checked against node:crypto)", () => {
  // Keccak-256 and SHA3-256 share the sponge and differ only in the padding domain byte, and Node ships
  // SHA3 but not Keccak, so the block boundaries (rate 136 bytes) are verified through the SHA3 sibling.
  for (const length of [0, 1, 135, 136, 137, 271, 272, 273, 1000, 4096]) {
    const input = "a".repeat(length);
    assert.equal(sha3_256(input), createHash("sha3-256").update(input).digest("hex"), `length ${length}`);
  }
  const bytes = new Uint8Array(300).map((_, i) => i % 251);
  assert.equal(sha3_256(bytes), createHash("sha3-256").update(bytes).digest("hex"));
  // Keccak-256 of a multi-block input is deterministic and differs from the single-block prefix.
  const long = keccak256("x".repeat(500));
  assert.match(long, /^[0-9a-f]{64}$/);
  assert.equal(long, keccak256("x".repeat(500)));
  assert.notEqual(long, keccak256("x".repeat(136)));
});

test("isAddress and normalizeAddress accept only 20-byte hex addresses", () => {
  assert.ok(ADDRESS_RE.test(VALID));
  assert.equal(isAddress(VALID), true);
  assert.equal(isAddress(LOWER), true);
  assert.equal(isAddress(UPPER), true);
  assert.equal(normalizeAddress(`  ${VALID} `), LOWER);
  for (const bad of INVALID) {
    assert.equal(isAddress(bad), false, `isAddress(${String(bad)})`);
    assert.equal(normalizeAddress(bad), null, `normalizeAddress(${String(bad)})`);
  }
});

test("toChecksumAddress reproduces the EIP-55 vectors and is case-insensitive on input", () => {
  for (const [address, fx] of Object.entries(fixtures)) {
    assert.equal(toChecksumAddress(address), fx.checksum);
    assert.equal(toChecksumAddress(address.toLowerCase()), fx.checksum);
    assert.equal(toChecksumAddress("0x" + address.slice(2).toUpperCase()), fx.checksum);
  }
  assert.throws(() => toChecksumAddress("0x123"), TypeError);
  assert.throws(() => toChecksumAddress(undefined), TypeError);
});

test("isChecksumAddress accepts checksummed, all-lower and all-upper forms and rejects wrong mixed case", () => {
  assert.equal(isChecksumAddress(VALID), true);
  assert.equal(isChecksumAddress(LOWER), true);
  assert.equal(isChecksumAddress(UPPER), true);
  assert.equal(isChecksumAddress("0x5aaeb6053F3E94C9b9A09f33669435E7Ef1BeAed"), false);
  assert.equal(isChecksumAddress("nope"), false);
});

test("gradientStops derives bytes 1-3 and 18-20 at 50 percent alpha, in upper-case hex", () => {
  const stops = gradientStops(VALID);
  assert.deepEqual(stops, { start: "#5AAEB680", end: "#1BEAED80", valid: true, address: LOWER });
  assert.deepEqual(gradientStops(LOWER), stops);
  assert.deepEqual(gradientStops(UPPER), stops);
  for (const [address, fx] of Object.entries(fixtures)) assert.deepEqual(gradientStops(address), fx.stops);
});

test("gradientStops falls back to the neutral stops for invalid or missing addresses", () => {
  for (const bad of INVALID) {
    assert.deepEqual(gradientStops(bad), { ...FALLBACK_STOPS.light, valid: false, address: null });
    assert.deepEqual(gradientStops(bad, { theme: "dark" }), { ...FALLBACK_STOPS.dark, valid: false, address: null });
  }
});

test("gradientStops reads alpha as a fraction from 0 to 1 or an integer from 2 to 255", () => {
  assert.equal(gradientStops(VALID, { alpha: 0xff }).start, "#5AAEB6FF");
  assert.equal(gradientStops(VALID, { alpha: 0x80 }).start, "#5AAEB680");
  assert.equal(gradientStops(VALID, { alpha: 0 }).start, "#5AAEB600");
  assert.equal(gradientStops(VALID, { alpha: 0.3 }).start, "#5AAEB64D");
  assert.equal(gradientStops(VALID, { alpha: 0.5 }).start, "#5AAEB680");
  assert.equal(gradientStops(VALID, { alpha: 1 }).start, "#5AAEB6FF", "1 is opaque, never 1/255");
  assert.equal(gradientStops(VALID, { alpha: 2 }).start, "#5AAEB602");
  assert.equal(gradientStops(VALID, { alpha: null }).start, "#5AAEB680", "null and undefined mean the default");
  for (const bad of [300, -1, 1.5, 127.5, NaN, Infinity, "80"]) assert.throws(() => gradientStops(VALID, { alpha: bad }), RangeError, `alpha ${String(bad)}`);
});

test("gradient recipes are deterministic across calls and platforms", () => {
  assert.equal(gradientCss(VALID), "linear-gradient(90deg, #5AAEB680, #1BEAED80)");
  assert.equal(gradientCss(VALID), gradientCss(LOWER));
  assert.equal(gradientCss(undefined), "linear-gradient(90deg, #24354210, #24354220)");
  assert.deepEqual(gradientReactNative(VALID), { colors: ["#5AAEB680", "#1BEAED80"], start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } });
  const svg = gradientSvg(VALID, { width: 100, height: 50 });
  assert.equal(svg, gradientSvg(VALID, { width: 100, height: 50 }));
  assert.match(svg, /stop-color="#5AAEB6" stop-opacity="0.502"/);
  assert.match(svg, /stop-color="#1BEAED" stop-opacity="0.502"/);
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="100" height="50"/);
});

test("SVG and CSS builders validate their options instead of interpolating them", () => {
  assert.throws(() => gradientSvg(VALID, { background: '" onload="alert(1)' }), TypeError);
  assert.throws(() => gradientSvg(VALID, { id: "a b" }), TypeError);
  assert.throws(() => gradientSvg(VALID, { id: '"/><script>' }), TypeError);
  assert.throws(() => gradientSvg(VALID, { width: 0 }), RangeError);
  assert.throws(() => gradientSvg(VALID, { height: -1 }), RangeError);
  assert.throws(() => gradientSvg(VALID, { radius: NaN }), RangeError);
  assert.throws(() => gradientSvg(VALID, { width: "1200" }), RangeError);
  assert.throws(() => gradientCss(VALID, { angle: "90deg); background: url(x" }), RangeError);
  assert.throws(() => auraSvg(VALID, { width: Infinity }), RangeError);
  assert.throws(() => auraSvg(VALID, { id: "up aura" }), TypeError);
  assert.throws(() => signatureSvg(VALID, { width: 0 }), RangeError);
  assert.throws(() => signatureSvg(VALID, { id: "x=y" }), TypeError);
  assert.throws(() => identiconSvg(VALID, { scale: 0 }), RangeError);
  assert.throws(() => identiconData(VALID, { size: 2.5 }), RangeError);
  assert.throws(() => identiconData(VALID, { size: 0 }), RangeError);
  for (const background of ["#FFF", "#1B2832", "#1B283280", "rgb(27, 40, 50)", "rgba(27, 40, 50, 0.5)", "hsl(200 30% 15% / 50%)", "transparent", "white"]) {
    assert.match(gradientSvg(VALID, { background }), new RegExp(`fill="${background.replace(/[()]/g, "\\$&")}"`));
  }
  assert.equal(gradientCss(VALID, { angle: 180 }), "linear-gradient(180deg, #5AAEB680, #1BEAED80)");
  assert.match(gradientSvg(VALID, { id: "cover_1.a:b-c", radius: 12.5 }), /id="cover_1.a:b-c".*rx="12.5"/s);
});

test("escapeXml escapes the five XML metacharacters and nothing else", () => {
  assert.equal(escapeXml(`<a href="x">Tom & Jerry's</a>`), "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;");
  assert.equal(escapeXml("plain-text_1.2"), "plain-text_1.2");
  assert.equal(escapeXml(42), "42");
});

test("aura recipe places both stops as blobs on the theme canvas", () => {
  const light = auraRecipe(VALID);
  assert.equal(light.canvas, "#F8FAFB");
  assert.equal(light.blobs[0].color, "#5AAEB6");
  assert.equal(light.blobs[1].color, "#1BEAED");
  assert.equal(light.blobs[0].alpha, 0.3);
  const dark = auraRecipe(VALID, { theme: "dark" });
  assert.equal(dark.canvas, "#121B21");
  assert.equal(dark.blobs[0].alpha, 0.45);
  const svg = auraSvg(VALID, { width: 200, height: 100 });
  assert.match(svg, /feGaussianBlur/);
  assert.match(svg, /feTurbulence/);
  assert.equal(svg, auraSvg(VALID, { width: 200, height: 100 }));
  assert.equal(auraRecipe("bad").valid, false);
});

test("nameSuffix is a hash sign plus characters 2-6 of the checksummed address", () => {
  assert.equal(nameSuffix(VALID), "#5aAe");
  assert.equal(nameSuffix(LOWER), "#5aAe");
  assert.equal(nameSuffix(UPPER), "#5aAe");
  for (const [address, fx] of Object.entries(fixtures)) assert.equal(nameSuffix(address), fx.suffix);
  for (const bad of INVALID) assert.equal(nameSuffix(bad), "");
});

test("displayName keeps the suffix, drops the prefix for anonymous profiles", () => {
  assert.equal(displayName("alice", VALID), "@alice#5aAe");
  assert.equal(displayName("  alice  ", VALID), "@alice#5aAe");
  assert.equal(displayName("", VALID), `${ANONYMOUS_LABEL}#5aAe`);
  assert.equal(displayName(undefined, VALID), "anonymous-profile#5aAe");
  assert.equal(displayName("alice", undefined), "@alice");
  assert.equal(displayName("alice", VALID, { prefix: "" }), "alice#5aAe");
  assert.deepEqual(displayNameParts("alice", VALID), { prefix: "@", name: "alice", suffix: "#5aAe", anonymous: false, text: "@alice#5aAe" });
  assert.deepEqual(displayNameParts(null, VALID), { prefix: "", name: ANONYMOUS_LABEL, suffix: "#5aAe", anonymous: true, text: "anonymous-profile#5aAe" });
  // Whitespace-only names are anonymous (trimmed); the shipped mobile component does not trim.
  assert.deepEqual(displayNameParts("   ", VALID), displayNameParts("", VALID));
  assert.equal(displayName("\t\n", VALID), "anonymous-profile#5aAe");
  assert.equal(displayName("", VALID, { anonymousLabel: "anonymes-profil" }), "anonymes-profil#5aAe");
});

test("sliceAddress truncates the checksummed address with three dots", () => {
  assert.equal(sliceAddress(VALID), "0x5aAeb6...eAed");
  assert.equal(sliceAddress(LOWER), "0x5aAeb6...eAed");
  assert.equal(sliceAddress(VALID, { leading: 10, trailing: 8 }), "0x5aAeb6053F...Ef1BeAed");
  assert.equal(sliceAddress(VALID, { leading: 6, trailing: 6 }), "0x5aAeb6...1BeAed");
  assert.equal(sliceAddress(VALID, { leading: 40, trailing: 4 }), toChecksumAddress(VALID));
  assert.equal(sliceAddress(VALID, { leading: 36, trailing: 4 }), toChecksumAddress(VALID));
  assert.equal(sliceAddress(VALID, { separator: "…" }), "0x5aAeb6…eAed");
  assert.equal(sliceAddress(VALID, { trailing: 0 }), "0x5aAeb6...", "a zero trailing count never re-appends the whole address");
  assert.equal(sliceAddress(VALID, { leading: 0, trailing: 4 }), "0x...eAed");
  for (const bad of [-1, 2.5, NaN, Infinity, "6"]) {
    assert.throws(() => sliceAddress(VALID, { leading: bad }), RangeError, `leading ${String(bad)}`);
    assert.throws(() => sliceAddress(VALID, { trailing: bad }), RangeError, `trailing ${String(bad)}`);
  }
  for (const bad of INVALID) assert.equal(sliceAddress(bad), "");
});

test("identicon seed is the lower-cased address and the data matches the reference library output", () => {
  assert.equal(identiconSeed(VALID), LOWER);
  assert.equal(identiconSeed("bad"), null);
  assert.equal(identiconData("bad"), null);
  for (const [address, fx] of Object.entries(fixtures)) {
    const data = identiconData(address);
    assert.deepEqual(data.colors, fx.identicon.colors, address);
    assert.deepEqual(data.grid.map((r) => r.join("")), fx.identicon.grid, address);
    assert.deepEqual(identiconData(address.toLowerCase()), data);
    assert.deepEqual(identiconData("0x" + address.slice(2).toUpperCase()), data);
  }
});

test("identicon grids are 8x8, horizontally mirrored and use only 0, 1 and 2", () => {
  const data = identiconData(VALID);
  assert.equal(data.grid.length, 8);
  for (const row of data.grid) {
    assert.equal(row.length, 8);
    assert.deepEqual(row.slice(0, 4), row.slice(4).reverse());
    for (const cell of row) assert.ok([0, 1, 2].includes(cell));
  }
});

test("identiconSvg is deterministic, self-contained and empty for invalid input", () => {
  const svg = identiconSvg(VALID, { scale: 3 });
  assert.equal(svg, identiconSvg(LOWER, { scale: 3 }));
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="24" height="24"/);
  assert.match(svg, /fill="#0EFEAE"/);
  assert.doesNotMatch(svg, /<script/);
  assert.equal(identiconSvg("bad"), "");
  assert.match(identiconSvg(VALID, { round: true }), /clip-path="circle\(50%\)"/);
  assert.match(identiconSvg(VALID), /aria-label="Identicon for 0x5aAeb6...eAed"/);
  const titled = identiconSvg(VALID, { title: `alice <b>"&'` });
  assert.match(titled, /aria-label="alice &lt;b&gt;&quot;&amp;&apos;"/);
  assert.doesNotMatch(titled, /<b>/);
});

test("signatureSvg renders name, suffix, address and badge, and escapes markup in names", () => {
  const svg = signatureSvg(VALID, { name: "alice <b>", width: 600 });
  assert.match(svg, /aria-label="@alice &lt;b&gt;#5aAe"/);
  assert.match(svg, /<tspan fill="#476A85">#5aAe<\/tspan>/);
  assert.match(svg, /0x5aAeb6053F\.\.\.Ef1BeAed/);
  assert.match(svg, /shape-rendering="crispEdges"/);
  assert.doesNotMatch(svg, /<b>/);
  assert.equal(svg, signatureSvg(VALID, { name: "alice <b>", width: 600 }));
  const dark = signatureSvg(VALID, { name: "alice", theme: "dark" });
  assert.match(dark, /fill="#121B21"/);
  const anonymous = signatureSvg(undefined, {});
  assert.match(anonymous, /anonymous-profile/);
  assert.doesNotMatch(anonymous, /crispEdges/);
});

test("identicon size table matches the shared web and mobile table", () => {
  assert.deepEqual(Object.keys(IDENTICON_SIZES), ["2xs", "xs", "s", "m", "l", "xl", "2xl"]);
  assert.deepEqual(identiconSizeFor("xl"), { avatar: 96, badge: 28, ring: 3, showBadge: true });
  assert.deepEqual(identiconSizeFor(120), { avatar: 120, badge: 36, ring: 3.5, showBadge: true });
  assert.equal(identiconSizeFor("2xs").showBadge, false);
  assert.equal(identiconSizeFor(24).showBadge, true);
  assert.deepEqual(identiconSizeFor(64), { avatar: 64, badge: 19, ring: 2, showBadge: true });
  assert.deepEqual(identiconSizeFor(64.5), { avatar: 64.5, badge: 19, ring: 2, showBadge: true });
  assert.deepEqual(identiconSizeFor(20), { avatar: 20, badge: 6, ring: 1, showBadge: false });
  assert.deepEqual(identiconSizeFor(200), { avatar: 200, badge: 60, ring: 3.5, showBadge: true });
  assert.throws(() => identiconSizeFor("huge"), RangeError);
  assert.throws(() => identiconSizeFor(0), RangeError);
  assert.throws(() => identiconSizeFor(-24), RangeError);
  assert.throws(() => identiconSizeFor(NaN), RangeError);
});
