import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkAmbient } from "./ambient.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const fixture = JSON.parse(readFileSync(join(ROOT, "scripts", "validate", "ambient-backgrounds.json"), "utf8"));
const branded = JSON.parse(readFileSync(join(ROOT, "scripts", "validate", "branded-backgrounds.json"), "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const clone = (value) => JSON.parse(JSON.stringify(value));

/**
 * Repository IO with surgical overrides. Header facts, C2PA, zone measurements and recomposed pixel
 * hashes default to the fixture so unit mutations do not repeatedly decode 12 full-size PNGs; the live
 * `--only ambient` gate supplies those facts from actual pixels.
 */
function io({ texts = {}, hashes = {}, dirs = {}, infos = {}, zones = {}, recompose } = {}) {
  return {
    readText: (path) => path in texts ? texts[path] : existsSync(join(ROOT, path)) ? readFileSync(join(ROOT, path), "utf8") : null,
    sha256: (path) => path in hashes ? hashes[path] : existsSync(join(ROOT, path)) ? sha256(readFileSync(join(ROOT, path))) : null,
    listDir: (path) => path in dirs ? dirs[path] : existsSync(join(ROOT, path)) ? readdirSync(join(ROOT, path)) : [],
    inspect: (path) => {
      if (path in infos) return infos[path];
      const pin = fixture.files[basename(path)];
      return pin ? {
        dimensions: pin.dimensions,
        bitDepth: fixture.contract.bitDepth,
        colourType: fixture.contract.colourType,
        canBeTransparent: false,
        contentCredentials: { c2pa: true, ...fixture.contract.contentCredentials, timestamp: pin.contentCredentialsTimestamp },
      } : null;
    },
    measureZone: (path) => {
      if (path in zones) return zones[path];
      const pin = fixture.files[basename(path)];
      return pin ? { mean: pin.safeZone.meanLuminance, deviation: pin.safeZone.deviation } : { mean: NaN, deviation: NaN };
    },
    recompose: (paths) => recompose ?? paths.map((path) => ({ path, problem: null, pixelSha256: fixture.previews.sheets[path].pixelSha256 })),
  };
}

const edit = (path, fn) => ({ [path]: fn(readFileSync(join(ROOT, path), "utf8")) });
const editJson = (path, fn) => ({ [path]: JSON.stringify(fn(JSON.parse(readFileSync(join(ROOT, path), "utf8"))), null, 2) });
const errorsOf = (overrides = {}, fix = fixture) => checkAmbient(fix, io(overrides)).errors;
const expectError = (overrides, pattern, fix = fixture) => {
  const errors = errorsOf(overrides, fix);
  assert.ok(errors.some((error) => pattern.test(error)), `expected ${pattern}, got:\n${errors.join("\n") || "(none)"}`);
};

const first = "quiet-corner-light.png";
const firstPath = `${fixture.directory}/${first}`;

/** Mutate one prompt consistently in the record, staged source and pin. */
function withPrompt(name, mutate) {
  const record = JSON.parse(readFileSync(join(ROOT, fixture.record), "utf8"));
  const staged = JSON.parse(readFileSync(join(ROOT, fixture.promptFile), "utf8"));
  const fix = clone(fixture);
  const asset = record.assets.find((entry) => entry.set === fixture.set && entry.path.endsWith(`/${name}`));
  const entry = staged.assets.find((item) => item.name === name);
  assert.ok(asset, `record entry ${name}`);
  assert.ok(entry, `staged entry ${name}`);
  const prompt = mutate(entry.prompt);
  asset.prompt = prompt;
  entry.prompt = prompt;
  fix.files[name].promptSha256 = sha256(prompt);
  return { fix, texts: { [fixture.record]: JSON.stringify(record, null, 2), [fixture.promptFile]: JSON.stringify(staged, null, 2) } };
}

test("the integrated repository passes the ambient lock", () => {
  const { errors, info } = checkAmbient(fixture, io());
  assert.deepEqual(errors, []);
  assert.match(info, /12 ambient backgrounds pinned in 6 light\/dark pairs/);
  assert.match(info, /2 overview sheets pinned and recomposed/);
  assert.match(info, /decision 0014 accepted/);
});

test("the ambient fixture keeps slides-v2's exact four closed-cube polarity guards", () => {
  assert.deepEqual(fixture.geometry.promptNegations, branded.geometry.promptNegations);
  assert.equal(fixture.files && Object.keys(fixture.files).length, 12);
  assert.deepEqual(fixture.previews.order, ["distant-horizon", "mist-orbit-left", "mist-orbit-right", "peripheral-frame", "quiet-corner", "quiet-corner-left"]);
  assert.equal(Object.values(fixture.files).reduce((sum, entry) => sum + entry.cubeCount, 0), 20);
  const changed = clone(fixture);
  changed.geometry.promptNegations[1].pattern = changed.geometry.promptNegations[0].pattern;
  expectError({}, /repeats another rule's pattern/, changed);
  const badScope = clone(fixture);
  badScope.geometry.promptNegations[1].scope = "avoid";
  expectError({}, /unknown scope "avoid"/, badScope);
  const missingScope = clone(fixture);
  delete missingScope.geometry.promptRequirements[0].scope;
  expectError({}, /unknown scope undefined/, missingScope);
});

test("all twelve pins carry exact file, generation, C2PA, pair, count and safe-zone facts", () => {
  const generationIds = new Set();
  for (const [name, pin] of Object.entries(fixture.files)) {
    assert.match(pin.sha256, /^[0-9a-f]{64}$/);
    assert.match(pin.promptSha256, /^[0-9a-f]{64}$/);
    assert.match(pin.generationId, /^exec-[0-9a-f-]{36}$/);
    assert.match(pin.contentCredentialsTimestamp, /^2026-09-16T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal(pin.dimensions, "1672x941");
    assert.ok(pin.cubeCount === 1 || pin.cubeCount === 2, name);
    assert.ok(pin.ambientComposition.visuallyQuietAreaFractionAtLeast >= 0.65, name);
    assert.ok(pin.ambientComposition.aggregateCubeAreaFractionAtMost <= 0.16, name);
    assert.ok(pin.ambientComposition.decorativeAreaFractionAtMost <= 0.25, name);
    assert.equal(pin.ambientComposition.edgeBiased, true, name);
    assert.equal(pin.ambientComposition.centred, false, name);
    assert.equal(pin.ambientComposition.subjectBounds.length, pin.cubeCount, name);
    assert.ok(pin.ambientComposition.minSubjectSeparationFraction >= 0.04, name);
    assert.ok(!generationIds.has(pin.generationId), `${name}: duplicate generation id`);
    generationIds.add(pin.generationId);
  }
  assert.equal(generationIds.size, 12);
});

test("file bytes, PNG header and complete C2PA facts are independently pinned", () => {
  expectError({ hashes: { [firstPath]: "0".repeat(64) } }, /hash .* differs from pinned/);
  const pin = fixture.files[first];
  const good = { dimensions: pin.dimensions, bitDepth: 8, colourType: "RGB", canBeTransparent: false, contentCredentials: { c2pa: true, ...fixture.contract.contentCredentials, timestamp: pin.contentCredentialsTimestamp } };
  expectError({ infos: { [firstPath]: { ...good, dimensions: "1600x900" } } }, /dimensions 1600x900 differ/);
  expectError({ infos: { [firstPath]: { ...good, canBeTransparent: true } } }, /transparency true/);
  expectError({ infos: { [firstPath]: { ...good, contentCredentials: { ...good.contentCredentials, c2pa: false } } } }, /C2PA caBX manifest is missing/);
  expectError({ infos: { [firstPath]: { ...good, contentCredentials: { ...good.contentCredentials, timestamp: "2026-01-01T00:00:00Z" } } } }, /live C2PA timestamp .* differs/);
  expectError({ infos: { [firstPath]: { ...good, contentCredentials: { ...good.contentCredentials, actions: ["c2pa.created"] } } } }, /C2PA actions .* differ/);
});

test("the set, staged prompts and ambient previews remain proposed", () => {
  expectError({ texts: editJson(fixture.record, (record) => { record.sets[fixture.set].status = "observed"; return record; }) }, /set slides-v3-ambient status is "observed", expected proposed/);
  expectError({ texts: editJson(fixture.promptFile, (staged) => { staged.status = "observed"; return staged; }) }, /PROMPTS\.source\.json: status is "observed", expected proposed/);
  expectError({ texts: editJson(fixture.previews.record, (record) => { record.status = "observed"; return record; }) }, /previews\/PROVENANCE\.json: status is "observed", expected proposed/);
  expectError({ texts: editJson(fixture.previews.record, (record) => { record.assets.find((entry) => entry.path === "ambient-backgrounds-light-overview.png").status = "observed"; return record; }) }, /ambient-backgrounds-light-overview\.png status is "observed", expected proposed/);
});

test("ambient and subordinate semantics are required independently", () => {
  const noAmbient = withPrompt(first, (prompt) => prompt
    .replace(/\bambient\b/gi, "presentation")
    .replace(/\bsubtle 16:9 presentation background\b/gi, "generic 16:9 slide image"));
  expectError({ texts: noAmbient.texts }, /omits "ambient presentation use"/, noAmbient.fix);
  const noSubordinate = withPrompt("mist-orbit-right-light.png", (prompt) => prompt.replace(/\bsubordinate\b/gi, "quiet"));
  expectError({ texts: noSubordinate.texts }, /omits "subordinate visual weight"/, noSubordinate.fix);
  const tooManySupportingElements = withPrompt(first, (prompt) => prompt
    .replace("one faint frosted profile-card", "several faint frosted profile-cards")
    .replace("two very soft pearlescent spheres", "numerous very soft pearlescent spheres"));
  expectError({ texts: tooManySupportingElements.texts }, /omits "few explicitly enumerated supporting elements"/, tooManySupportingElements.fix);
  const hiddenPositive = withPrompt(first, (prompt) => `${prompt.replace(/\bmonolithic\b/gi, "[removed]")}\nAvoid: monolithic cube.`);
  expectError({ texts: hiddenPositive.texts }, /omits "monolithic"/, hiddenPositive.fix);
});

test("negated hero wording and Avoid dense wording pass, while affirmative dense hero art fails", () => {
  const baseline = errorsOf().filter((error) => /contradicts the ambient closed-cube contract/.test(error));
  assert.deepEqual(baseline, [], `committed prompts must accept 'not hero art', comparisons with hero art and Avoid: dense:\n${baseline.join("\n")}`);
  const changed = withPrompt(first, (prompt) => `${prompt}\nDetail: Render this as dense hero campaign art with a central focal subject.`);
  const errors = errorsOf({ texts: changed.texts }, changed.fix);
  assert.ok(errors.some((error) => /dense ambient imagery requested/.test(error)), errors.join("\n"));
  assert.ok(errors.some((error) => /hero or campaign imagery requested/.test(error)), errors.join("\n"));
  assert.ok(errors.some((error) => /centred subject requested/.test(error)), errors.join("\n"));
  const plainHero = withPrompt(first, (prompt) => `${prompt}\nDetail: This is hero art.`);
  expectError({ texts: plainHero.texts }, /hero or campaign imagery requested/, plainHero.fix);
  for (const sentence of ["Treat this as the hero.", "This is campaign material."]) {
    const mutation = withPrompt(first, (prompt) => `${prompt}\nDetail: ${sentence}`);
    expectError({ texts: mutation.texts }, /hero or campaign imagery requested/, mutation.fix);
  }
});

test("prompt mutations requesting more than two cubes or forbidden content are rejected", () => {
  const cases = [
    ["\nDetail: exactly three opaque UP! cubes.", /requests more than two UP! cubes/],
    ["\nDetail: exactly 12 small solid UP! cubes.", /requests more than two UP! cubes/],
    ["\nDetail: Add a third UP! cube.", /requests more than two UP! cubes/],
    ["\nDetail: Add one additional UP! cube.", /requests more than two UP! cubes/],
    ["\nDetail: Add two more UP! cubes.", /requests more than two UP! cubes/],
    ["\nDetail: Add two additional UP! cubes.", /requests more than two UP! cubes/],
    ["\nDetail: Add a pair of extra UP! cubes.", /requests more than two UP! cubes/],
    ["\nDetail: Use more than two UP! cubes.", /requests more than two UP! cubes/],
    ["\nDetail: Use at least three UP! cubes.", /requests more than two UP! cubes/],
    ["\nDetail: Make the canvas transparent and every cube translucent.", /transparent cube or canvas requested/],
    ["\nDetail: Include people and faces beside the cube.", /people or faces requested/],
    ["\nDetail: People gather beside the cube and faces fill the backdrop.", /people or faces requested/],
    ["\nDetail: Add a sneaker beside the cube.", /footwear requested/],
    ["\nDetail: Add a Nike logo and third-party mark.", /third-party mark requested/],
    ["\nDetail: Add an Apple mark beside the cube.", /third-party mark requested/],
    ["\nDetail: Add a rocket beside the cube.", /rocket requested/],
    ["\nDetail: Add a readable text caption beside the cube.", /additional readable text requested/],
    ["\nDetail: A caption reading HELLO appears beside the cube.", /additional readable text requested/],
    ["\nDetail: Write HELLO beside the cube.", /additional readable text requested/],
    ["\nDetail: Display the words HELLO WORLD.", /additional readable text requested/],
    ["\nDetail: Add text saying HELLO.", /additional readable text requested/],
    ["\nDetail: Set the lettering to HELLO.", /additional readable text requested/],
    ["\nDetail: Place a watermark in the corner.", /watermark requested/],
    ["\nDetail: Use neon cyberpunk lighting.", /neon or cyberpunk lighting requested/],
    ["\nDetail: Place all headings and body copy outside the safe zone.", /copy outside the safe zone requested/],
    ["\nDetail: Move the cube inside the safe zone.", /subject inside the safe zone requested/],
    ["\nDetail: Move the card into the safe zone.", /subject inside the safe zone requested/],
    ["\nDetail: Place the ribbon across the copy zone.", /subject inside the safe zone requested/],
    ["\nDetail: Put a sphere inside the safe zone.", /subject inside the safe zone requested/],
    ["\nDetail: Move all visual elements into the safe zone.", /subject inside the safe zone requested/],
    ["\nDetail: Allow decoration inside the copy zone.", /subject inside the safe zone requested/],
    ["\nDetail: Give the cube a lid opening and insert a card inside the cube.", /opening, aperture, lid, slot, hole, cavity, rim or receptacle requested|object entering or emerging/],
    ["\nDetail: The front face is open.", /open cube face or plane requested/],
    ["\nDetail: Give the cube a window.", /window, door or cutout requested/],
    ["\nDetail: Pass a card through the cube.", /object passed through or into a cube/],
    ["\nDetail: Make the cube a flat rounded badge.", /flat badge, tile or slab requested/],
    ["\nDetail: Make the cube a front-on app-icon shape.", /badge, tile, slab or app-icon form requested/],
    ["\nDetail: Make the cube a rounded rectangular tile.", /badge, tile, slab or app-icon form requested/],
    ["\nDetail: Turn the cube into a badge.", /badge, tile, slab or app-icon form requested/],
    ["\nDetail: Add a handle to the cube.", /handle, tab or protrusion requested/],
    ["\nDetail: Give the cube a tab.", /handle, tab or protrusion requested/],
    ["\nDetail: Add a protrusion to the cube.", /handle, tab or protrusion requested/],
    ["\nDetail: Give the cube a removable top.", /removable cube surface requested/],
    ["\nDetail: Put the cube in the middle.", /middle or focal placement requested/],
    ["\nDetail: Make the cube the focal point.", /middle or focal placement requested/],
  ];
  for (const [suffix, pattern] of cases) {
    const changed = withPrompt(first, (prompt) => `${prompt}${suffix}`);
    expectError({ texts: changed.texts }, pattern, changed.fix);
  }
  const count = clone(fixture);
  count.files[first].cubeCount = 3;
  expectError({}, /cube count 3 is outside 1\.\.2/, count);
});

test("safe-zone size, pair geometry, thresholds and live measurements cannot drift", () => {
  const small = clone(fixture);
  small.files[first].safeZone.width = 0.2;
  small.files[first].safeZone.height = 0.2;
  expectError({}, /safe zone is too small/, small);
  const offCentreAreaAlternative = clone(fixture);
  offCentreAreaAlternative.files[first].safeZone = { ...offCentreAreaAlternative.files[first].safeZone, x: 0, y: 0, width: 0.45, height: 1 };
  expectError({}, /for the area alternative, not central enough/, offCentreAreaAlternative);
  const pair = clone(fixture);
  pair.files["quiet-corner-dark.png"].safeZone.x = 0.01;
  expectError({}, /quiet-corner light and dark safe zones differ at x/, pair);
  const light = clone(fixture);
  light.files[first].safeZone.meanLuminance = 219.9;
  expectError({}, /light safe-zone luminance 219\.9 is below 220/, light);
  const dark = clone(fixture);
  dark.files["quiet-corner-dark.png"].safeZone.deviation = 12.1;
  expectError({}, /safe-zone deviation 12\.1 exceeds 12/, dark);
  const pin = fixture.files[first].safeZone;
  expectError({ zones: { [firstPath]: { mean: pin.meanLuminance, deviation: pin.deviation + 1 } } }, /safe zone measures/);
  expectError({ zones: { [firstPath]: { mean: NaN, deviation: NaN } } }, /safe zone measures NaN\/NaN/);
});

test("ambient composition rejects insufficient quiet area, excessive occupied area, centering and subject-bound drift", () => {
  for (const [field, value, pattern] of [
    ["visuallyQuietAreaFractionAtLeast", 0.64, /visually quiet area 0\.64 is below 0\.65/],
    ["aggregateCubeAreaFractionAtMost", 0.17, /aggregate cube area 0\.17 exceeds 0\.16/],
    ["decorativeAreaFractionAtMost", 0.26, /decorative area 0\.26 exceeds 0\.25/],
    ["centred", true, /cubes are not centred/],
    ["edgeBiased", false, /must remain edge-biased/],
    ["minSubjectSeparationFraction", 0.03, /subject separation 0\.03 is below 0\.04/],
  ]) {
    const changed = clone(fixture);
    changed.files[first].ambientComposition[field] = value;
    expectError({}, pattern, changed);
  }
  for (const value of [NaN, Infinity, "0.65"]) {
    const nonNumeric = clone(fixture);
    nonNumeric.files[first].ambientComposition.visuallyQuietAreaFractionAtLeast = value;
    expectError({}, /visuallyQuietAreaFractionAtLeast must be a finite number/, nonNumeric);
  }
  for (const value of [-1, 2]) {
    const outOfRange = clone(fixture);
    outOfRange.files[first].ambientComposition.visuallyQuietAreaFractionAtLeast = value;
    expectError({}, /visuallyQuietAreaFractionAtLeast must be between 0 and 1/, outOfRange);
  }
  const review = clone(fixture);
  review.files[first].ambientComposition.review = "computer vision proved it";
  expectError({}, /must state full-resolution visual review, not automated segmentation/, review);
  const enters = clone(fixture);
  enters.files[first].ambientComposition.subjectBounds[0].x = 0.5;
  expectError({}, /subject bound 1 enters the safe zone/, enters);
  const tooClose = clone(fixture);
  tooClose.files[first].ambientComposition.subjectBounds[0].x = 0.69;
  expectError({}, /subject bound 1 is separated from the safe zone by 0\.010, below 0\.04/, tooClose);
  const missing = clone(fixture);
  missing.files[first].ambientComposition.subjectBounds.pop();
  expectError({}, /must pin one subject bound per cube \(1\)/, missing);
  expectError({ texts: editJson(fixture.record, (record) => { record.assets.find((entry) => entry.path.endsWith(`/${first}`)).ambientComposition.subjectBounds[0].x += 0.01; return record; }) }, /ambientComposition\.subjectBounds/);
  const selfReported = clone(fixture);
  selfReported.setVisualReview.cubeCountTotal = 999;
  selfReported.setVisualReview.maxAggregateCubeAreaFraction = 0.01;
  selfReported.setVisualReview.maxDecorativeAreaFraction = 0.01;
  selfReported.setVisualReview.minVisuallyQuietAreaFraction = 0.99;
  expectError({ texts: editJson(fixture.record, (record) => { record.sets[fixture.set].visualReview = clone(selfReported.setVisualReview); return record; }) }, /setVisualReview .* differs from the values derived from files/, selfReported);
});

test("reference bytes, ordered inputs, hash-only draft and left-dark historical resolution are pinned", () => {
  const publicRef = fixture.references.files["title-light.png"];
  expectError({ hashes: { [publicRef.path]: "1".repeat(64) } }, /reference hash .* differs/);
  expectError({ texts: editJson(fixture.record, (record) => { const asset = record.assets.find((entry) => entry.path.endsWith("/quiet-corner-light.png")); asset.generation.inputs[0].sha256 = "2".repeat(64); return record; }) }, /generation input 1: reference sha256/);
  expectError({ texts: editJson(fixture.record, (record) => { const asset = record.assets.find((entry) => entry.path.endsWith("/quiet-corner-light.png")); asset.generation.inputs[0].label = "wrong-reference.png"; return record; }) }, /generation input 1: reference label/);
  expectError({ texts: editJson(fixture.promptFile, (staged) => { staged.assets[0].references.reverse(); return staged; }) }, /references .* differ/);
  const draftKey = Object.keys(fixture.references.files).find((key) => key.startsWith("superseded draft"));
  expectError({ texts: editJson(fixture.promptFile, (staged) => { staged.generation.references[draftKey].path = "/tmp/private.png"; return staged; }) }, /must be hash-only/);
  for (const field of ["sourcePath", "uri", "node", "path", "url"]) {
    const fixtureLocator = clone(fixture);
    fixtureLocator.references.files[draftKey][field] = `private/${field}`;
    expectError({}, new RegExp(`must remain hash-only; unexpected field\\(s\\): ${field}`), fixtureLocator);
    expectError({ texts: editJson(fixture.promptFile, (staged) => { staged.generation.references[draftKey][field] = `private/${field}`; return staged; }) }, new RegExp(`must be hash-only; unexpected field\\(s\\): .*${field}`));
    expectError({ texts: editJson(fixture.record, (record) => { record.sets[fixture.set].references.find((entry) => entry.label === draftKey)[field] = `private/${field}`; return record; }) }, new RegExp(`must be hash-only; unexpected field\\(s\\): ${field}`));
    expectError({ texts: editJson(fixture.record, (record) => { const asset = record.assets.find((entry) => entry.path.endsWith("/mist-orbit-right-dark.png")); asset.generation.inputs.find((entry) => entry.label === draftKey)[field] = `private/${field}`; return record; }) }, new RegExp(`must be hash-only; unexpected field\\(s\\): .*${field}`));
  }
  const truthyPublished = clone(fixture);
  truthyPublished.references.files[draftKey].published = "false";
  expectError({}, /hash-only reference .* must remain published: false/, truthyPublished);
  const reclassified = clone(fixture);
  reclassified.references.files[draftKey].published = true;
  reclassified.references.files[draftKey].path = fixture.references.files["title-dark.png"].path;
  expectError({}, /hash-only reference .* must remain published: false/, reclassified);
  expectError({ texts: editJson(fixture.promptFile, (staged) => { staged.generation.references[draftKey].note = { path: "private/staged.png" }; return staged; }) }, /note must be plain text/);
  expectError({ texts: editJson(fixture.promptFile, (staged) => { delete staged.assets.find((entry) => entry.name === "mist-orbit-left-dark.png").referenceResolution; return staged; }) }, /historical reference resolution differs/);
  expectError({ texts: editJson(fixture.promptFile, (staged) => { staged.generation.references.extra = { sha256: "3".repeat(64) }; return staged; }) }, /unpinned key extra/);
});

test("an unpinned directory file, set entry, prompt entry or edit is rejected", () => {
  expectError({ dirs: { [fixture.directory]: [...fixture.directoryFiles, "extra-light.png"] } }, /unpinned file extra-light\.png/);
  expectError({ dirs: { [fixture.previews.directory]: [...readdirSync(join(ROOT, fixture.previews.directory)), "ambient-backgrounds-extra-overview.png"] } }, /unpinned ambient preview file ambient-backgrounds-extra-overview\.png/);
  expectError({ texts: editJson(fixture.record, (record) => { const source = record.assets.find((entry) => entry.path.endsWith(`/${first}`)); record.assets.push({ ...source, path: `${fixture.recordDirectory}/extra-light.png` }); return record; }) }, /unpinned file extra-light\.png is in set/);
  expectError({ texts: editJson(fixture.promptFile, (staged) => { staged.assets.push({ name: "extra-light.png", prompt: "x" }); return staged; }) }, /unpinned prompt entry extra-light\.png/);
  expectError({ texts: editJson(fixture.promptFile, (staged) => { staged.assets.push({ ...staged.assets[0] }); return staged; }) }, /exactly 12 uniquely named prompt entries/);
  expectError({ texts: editJson(fixture.record, (record) => { record.assets.find((entry) => entry.path.endsWith(`/${first}`)).edit = { id: "exec-unpinned" }; return record; }) }, /records an unpinned edit/);
  expectError({ texts: editJson(fixture.previews.record, (record) => { const source = record.assets.find((entry) => entry.path === "ambient-backgrounds-light-overview.png"); record.assets.push({ ...source, path: "ambient-backgrounds-extra-overview.png" }); return record; }) }, /unpinned ambient preview ambient-backgrounds-extra-overview\.png/);
});

test("overview sheets pin order, committed bytes and recomposed RGB pixels", () => {
  const sheet = "ambient-backgrounds-light-overview.png";
  const path = `${fixture.previews.directory}/${sheet}`;
  expectError({ hashes: { [path]: "4".repeat(64) } }, /hash .* differs/);
  expectError({ recompose: [{ path: sheet, problem: "1 pixel differs", pixelSha256: fixture.previews.sheets[sheet].pixelSha256 }, { path: "ambient-backgrounds-dark-overview.png", problem: null, pixelSha256: fixture.previews.sheets["ambient-backgrounds-dark-overview.png"].pixelSha256 }] }, /1 pixel differs/);
  expectError({ recompose: [{ path: sheet, problem: null, pixelSha256: "5".repeat(64) }, { path: "ambient-backgrounds-dark-overview.png", problem: null, pixelSha256: fixture.previews.sheets["ambient-backgrounds-dark-overview.png"].pixelSha256 }] }, /recomposed RGB pixel hash .* differs/);
  expectError({ texts: editJson(fixture.previews.record, (record) => { const asset = record.assets.find((entry) => entry.path === sheet); [asset.composition.placements[0], asset.composition.placements[1]] = [asset.composition.placements[1], asset.composition.placements[0]]; return record; }) }, /placements differ from the pinned ambient order/);
});

test("decision, documentation, safe-zone table, galleries and source wording are pinned", () => {
  const decision = existsSync(join(ROOT, fixture.decision.path))
    ? readFileSync(join(ROOT, fixture.decision.path), "utf8")
    : `Status: ${fixture.decision.status}\n${fixture.decision.phrases.join("\n")}\n`;
  expectError({ texts: { [fixture.decision.path]: decision.replace("Status: accepted", "Status: proposed") } }, /Status line must read accepted/);
  expectError({ texts: { [fixture.decision.path]: `${decision}\nDiscord thread id private-123\n` } }, /exposes a private conversation or message identifier/);
  expectError({ texts: { [fixture.decision.path]: `${decision}\nThe UP! mark may be extracted from these files.\n` } }, /contradicts the mark boundary/);
  expectError({ texts: { [fixture.decision.path]: `${decision}\nThe UP! mark is not licensed for extraction but may be extracted.\n` } }, /contradicts the mark boundary/);
  expectError({ texts: editJson(fixture.record, (record) => { record.assets.find((entry) => entry.path.endsWith(`/${first}`)).embeddedMarks.rights += " However, the mark may be extracted."; return record; }) }, /embeddedMarks\.rights: contradicts the mark boundary/);
  const [file, phrases] = Object.entries(fixture.wording)[0];
  expectError({ texts: edit(file, (text) => text.replace(phrases[0], "[removed]")) }, new RegExp(`must contain ${JSON.stringify(phrases[0]).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  const gallery = Object.keys(fixture.galleries)[0];
  const image = fixture.galleries[gallery][0];
  expectError({ texts: edit(gallery, (text) => text.replace(image, "gone.png")) }, /gallery does not show/);
  const family = "quiet-corner";
  const rowPhrase = `${fixture.files[`${family}-light.png`].safeZone.x}, ${fixture.files[`${family}-light.png`].safeZone.y}, ${fixture.files[`${family}-light.png`].safeZone.width}, ${fixture.files[`${family}-light.png`].safeZone.height}`;
  expectError({ texts: edit(fixture.readmeTable, (text) => text.replace(rowPhrase, "0, 0, 0.1, 0.1")) }, /quiet-corner row must contain/);
});
