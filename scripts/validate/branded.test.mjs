import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkBranded } from "./branded.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const fixture = JSON.parse(readFileSync(join(ROOT, "scripts", "validate", "branded-backgrounds.json"), "utf8"));

/**
 * An io over the real repository with overrides: `texts` replaces file contents (null removes a file),
 * `hashes` replaces file hashes, `zones` replaces measurements, `recompose` replaces the sheet comparison,
 * `dirs` replaces directory listings. Measurements default to the pinned figures so the baseline is
 * independent of decoding speed; the live gate measures the pixels itself.
 */
function io({ texts = {}, hashes = {}, zones = {}, recompose = [], dirs = {} } = {}) {
  return {
    readText: (p) => (p in texts ? texts[p] : existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : null),
    sha256: (p) => (p in hashes ? hashes[p] : existsSync(join(ROOT, p)) ? createHash("sha256").update(readFileSync(join(ROOT, p))).digest("hex") : null),
    listDir: (p) => (p in dirs ? dirs[p] : existsSync(join(ROOT, p)) ? readdirSync(join(ROOT, p)) : []),
    measureZone: (p, zone) => {
      if (p in zones) return zones[p];
      const pin = fixture.files[p.split("/").pop()]?.safeZone;
      return pin ? { mean: pin.meanLuminance, deviation: pin.deviation } : { mean: NaN, deviation: NaN };
    },
    recompose: () => recompose,
  };
}
const edit = (path, fn) => ({ [path]: fn(readFileSync(join(ROOT, path), "utf8")) });
const editJson = (path, fn) => ({ [path]: JSON.stringify(fn(JSON.parse(readFileSync(join(ROOT, path), "utf8"))), null, 2) });
const first = Object.keys(fixture.files)[0];
const errorsOf = (overrides) => checkBranded(fixture, io(overrides)).errors;
const expectError = (overrides, pattern) => {
  const errors = errorsOf(overrides);
  assert.ok(errors.some((e) => pattern.test(e)), `expected an error matching ${pattern}, got:\n${errors.join("\n") || "(none)"}`);
};

test("the repository passes the branded lock as committed", () => {
  const { errors, info } = checkBranded(fixture, io());
  assert.deepEqual(errors, []);
  assert.match(info, /12 branded backgrounds pinned/);
});

test("a replaced background file is rejected by its hash", () => {
  expectError({ hashes: { [`${fixture.directory}/${first}`]: "0".repeat(64) } }, /is not the pinned file/);
});

test("a changed provenance entry is rejected: hash, prompt, generation id, reference, count, safe zone, measurement", () => {
  const mutate = (fn) => editJson(fixture.record, (p) => { fn(p.assets.find((a) => a.path.endsWith(first))); return p; });
  expectError({ texts: mutate((a) => { a.sha256 = "1".repeat(64); }) }, /sha256 .* differs from the pinned/);
  expectError({ texts: mutate((a) => { a.prompt += " and one more box"; }) }, /prompt differs from the pinned selection/);
  expectError({ texts: mutate((a) => { a.generation.id = "exec-00000000-0000-0000-0000-000000000000"; }) }, /generation id .* differs/);
  expectError({ texts: mutate((a) => { a.generation.inputs[1].node = "1:1"; }) }, /reference node is "1:1"/);
  expectError({ texts: mutate((a) => { a.generation.inputs[1].published = true; }) }, /reference published is true/);
  expectError({ texts: mutate((a) => { a.generation.inputs.splice(0, 1); }) }, /must record the former generic file/);
  expectError({ texts: mutate((a) => { a.embeddedMarks.count += 1; }) }, /declares \d+ UP! boxes, the pinned count/);
  expectError({ texts: mutate((a) => { a.embeddedMarks.rights = "free to reuse"; }) }, /must state the extraction restriction/);
  expectError({ texts: mutate((a) => { a.safeZone.width = 0.99; }) }, /safe zone width is 0.99/);
  expectError({ texts: mutate((a) => { a.safeZone.measured.deviation += 1; }) }, /recorded safe-zone measurement .* differs/);
  expectError({ texts: mutate((a) => { a.status = "observed"; }) }, /status observed, expected proposed/);
  expectError({ texts: mutate((a) => { a.contentCredentials.timestamp = "2026-01-01T00:00:00Z"; }) }, /time stamp .* differs/);
});

test("a measurement that drifts from the recorded figures is rejected", () => {
  const pin = fixture.files[first].safeZone;
  expectError({ zones: { [`${fixture.directory}/${first}`]: { mean: pin.meanLuminance + 1, deviation: pin.deviation } } }, /safe zone measures/);
});

test("a measurement that is not a number is rejected rather than passed", () => {
  // An empty zone or an undecodable pixel run measures NaN; NaN is never within tolerance of the recorded figure.
  expectError({ zones: { [`${fixture.directory}/${first}`]: { mean: NaN, deviation: NaN } } }, new RegExp(`${first}: safe zone measures NaN/NaN, the recorded measurement is`));
  expectError({ zones: { [`${fixture.directory}/${first}`]: { mean: fixture.files[first].safeZone.meanLuminance, deviation: NaN } } }, /safe zone measures .*\/NaN/);
});

test("a missing background or contact sheet is reported as missing, and nothing else is measured for it", () => {
  const errors = errorsOf({ hashes: { [`${fixture.directory}/${first}`]: null } });
  assert.deepEqual(errors, [`${fixture.directory}/${first}: missing`]);
  const sheet = Object.keys(fixture.previews.sheets)[0];
  assert.deepEqual(errorsOf({ hashes: { [`${fixture.previews.directory}/${sheet}`]: null } }), [`${fixture.previews.directory}/${sheet}: missing`]);
  // A missing app showcase is the assets check's business; the lock only rejects a changed one.
  assert.deepEqual(errorsOf({ hashes: { [`${fixture.previews.directory}/app-showcase-light.png`]: null } }), []);
});

test("the set must cite the decision and the reference, and the contract may not be loosened", () => {
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].decision = "decisions/0011-owner-authorized-product-visuals.md"; return p; }) }, /must cite decisions\/0012/);
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].references[0].inputSha256 = "f".repeat(64); return p; }) }, /reference inputSha256/);
  expectError({ texts: editJson(fixture.record, (p) => { p.contract.maxSafeZoneDeviation = 40; return p; }) }, /contract maxSafeZoneDeviation is 40/);
  expectError({ texts: editJson(fixture.record, (p) => { p.contract.lightRegister.minSafeZoneLuminance = 100; return p; }) }, /minSafeZoneLuminance is 100/);
  expectError({ texts: editJson(fixture.record, (p) => { p.license = "Apache-2.0"; return p; }) }, /licence must state/);
  expectError({ texts: editJson(fixture.record, (p) => { p.assets.push({ ...p.assets.find((a) => a.path.endsWith(first)), path: "backgrounds/slides-v2/extra-light.png" }); return p; }) }, /extra-light.png is in set/);
});

test("the staged prompt file must match the pinned selection", () => {
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets[0].prompt = "different"; return p; }) }, /prompt differs from the pinned selection/);
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets[0].generationId = "exec-other"; return p; }) }, /generation id exec-other differs/);
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.generation.image2 = "an unnamed reference"; return p; }) }, /generation.image2 must cite/);
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets.push({ name: "extra-dark.png", prompt: "x" }); return p; }) }, /extra-dark.png has a prompt entry/);
});

test("the contact sheets must keep the pinned grid, hashes, restriction and pixels, and the showcases must stay untouched", () => {
  const sheet = Object.keys(fixture.previews.sheets)[0];
  const mutate = (fn) => editJson(fixture.previews.record, (p) => { fn(p.assets.find((a) => a.path === sheet), p); return p; });
  expectError({ texts: mutate((a) => { [a.composition.placements[0], a.composition.placements[1]] = [a.composition.placements[1], a.composition.placements[0]]; }) }, /placement 1 path/);
  expectError({ texts: mutate((a) => { a.composition.placements[2].x = 25; }) }, /placement 3 x is 25/);
  expectError({ texts: mutate((a) => { a.composition.placements.pop(); }) }, /has 5 placements/);
  expectError({ texts: mutate((a) => { a.composition.canvas = "#000000"; }) }, /canvas #000000/);
  expectError({ texts: mutate((a) => { a.sha256 = "2".repeat(64); }) }, /sha256 .* differs from the pinned/);
  expectError({ texts: mutate((a) => { delete a.embeddedMarks; }) }, /embeddedMarks note/);
  expectError({ texts: mutate((a, p) => { p.license = "Apache-2.0"; }) }, /licence must carry the embedded-mark restriction/);
  expectError({ texts: mutate((a, p) => { p.assets.find((x) => x.path === "app-showcase-light.png").sha256 = "3".repeat(64); }) }, /app-showcase-light.png changed/);
  expectError({ hashes: { [`${fixture.previews.directory}/${sheet}`]: "4".repeat(64) } }, /is not the pinned file/);
  expectError({ recompose: [{ path: sheet, problem: "12 of 1500768 pixels differ from a fresh composition" }] }, /pixels differ/);
});

test("the decision record, its index and the source register are required", () => {
  expectError({ texts: { [fixture.decision.path]: null } }, /0012-branded-slide-backgrounds.md: missing/);
  expectError({ texts: edit(fixture.decision.path, (t) => t.replace(/^Status: accepted/m, "Status: proposed")) }, /Status line must read accepted/);
  expectError({ texts: edit(fixture.decision.path, (t) => t.split(fixture.reference.inputSha256).join("")) }, /must state "0ecc/);
  expectError({ texts: edit(fixture.decision.path, (t) => t.replace(/not granted/g, "granted")) }, /must state "not granted"/);
  expectError({ texts: edit(fixture.decision.index, (t) => t.split("\n").filter((l) => !l.includes("0012-branded")).join("\n")) }, /does not list/);
  expectError({ texts: editJson(fixture.sources.register, (r) => { r.sources[fixture.sources.boardKey].identifiers.readNodes = []; return r; }) }, /must list node 1131:25142/);
  expectError({ texts: editJson(fixture.sources.register, (r) => { r.sources[fixture.sources.generatedKey].notes = "Sixteen images."; return r; }) }, /notes must cite decision 0012/);
});

test("mark files, README table drift, missing wording and contradictory claims are rejected", () => {
  expectError({ dirs: { [fixture.logosDirectory]: ["README.md", "up-box.png"] } }, /contains up-box.png/);
  expectError({ texts: edit(fixture.readmeTable, (t) => t.replace("| 0, 0, 0.5, 1 (left half) |", "| 0, 0, 0.6, 1 (left half) |")) }, /identity-orbits row must state the zone/);
  expectError({ texts: edit(fixture.readmeTable, (t) => t.replace("| 250, deviation 4 |", "| 251, deviation 3 |")) }, /measured light zone/);
  expectError({ texts: edit("TRADEMARKS.md", (t) => t.replace("not licensed for extraction or standalone reuse", "licensed")) }, /TRADEMARKS.md: must contain/);
  expectError({ texts: { "LICENSES/README.md": null } }, /LICENSES\/README.md: missing/);
  expectError({ texts: edit("README.md", (t) => `${t}\nThe slide backgrounds contain no marks and no text.\n`) }, /README.md:\d+: claims the backgrounds carry no words/);
  expectError({ texts: edit("imagery/briefs.md", (t) => t.replace("## IB-12 Presentation background family (slides-v2)\n", "## IB-12 Presentation background family (slides-v2)\n\nBackground only: no logos.\n")) }, /imagery\/briefs.md:\d+: claims/);
  // "no other words" is the accurate form and passes; a claim in another brief's section is outside the scan.
  assert.deepEqual(errorsOf({ texts: edit("README.md", (t) => `${t}\nThey show the UP! mark and no other words, letters or marks.\n`) }), []);
  assert.deepEqual(errorsOf({ texts: edit("imagery/briefs.md", (t) => t.replace("## IB-11 Cultural-token object set\n", "## IB-11 Cultural-token object set\n\nNo text.\n")) }), []);
});
