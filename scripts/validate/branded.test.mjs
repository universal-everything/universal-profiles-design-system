import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { affirmativeText, checkBranded } from "./branded.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const fixture = JSON.parse(readFileSync(join(ROOT, "scripts", "validate", "branded-backgrounds.json"), "utf8"));
const sha256Text = (s) => createHash("sha256").update(s, "utf8").digest("hex");

/**
 * An io over the real repository with overrides: `texts` replaces file contents (null removes a file),
 * `hashes` replaces file hashes, `zones` replaces measurements, `infos` replaces header facts, `recompose`
 * replaces the sheet comparison, `dirs` replaces directory listings. Measurements and header facts default
 * to the pinned figures so the baseline is independent of decoding speed; the live gate reads the pixels.
 */
function io({ texts = {}, hashes = {}, zones = {}, infos = {}, recompose = [], dirs = {} } = {}) {
  return {
    readText: (p) => (p in texts ? texts[p] : existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : null),
    sha256: (p) => (p in hashes ? hashes[p] : existsSync(join(ROOT, p)) ? createHash("sha256").update(readFileSync(join(ROOT, p))).digest("hex") : null),
    listDir: (p) => (p in dirs ? dirs[p] : existsSync(join(ROOT, p)) ? readdirSync(join(ROOT, p)) : []),
    measureZone: (p) => {
      if (p in zones) return zones[p];
      const pin = fixture.files[p.split("/").pop()]?.safeZone;
      return pin ? { mean: pin.meanLuminance, deviation: pin.deviation } : { mean: NaN, deviation: NaN };
    },
    inspect: (p) => {
      if (p in infos) return infos[p];
      const pin = fixture.files[p.split("/").pop()];
      return pin ? { dimensions: pin.dimensions, bitDepth: fixture.contract.bitDepth, colourType: fixture.contract.colourType, canBeTransparent: false } : null;
    },
    recompose: () => recompose,
  };
}
const edit = (path, fn) => ({ [path]: fn(readFileSync(join(ROOT, path), "utf8")) });
const editJson = (path, fn) => ({ [path]: JSON.stringify(fn(JSON.parse(readFileSync(join(ROOT, path), "utf8"))), null, 2) });
const first = Object.keys(fixture.files)[0];
const family = first.replace(/-(light|dark)\.png$/, "");
const R = fixture.references;
const S = fixture.supersededReferences;
const errorsOf = (overrides, fix = fixture) => checkBranded(fix, io(overrides)).errors;
const expectError = (overrides, pattern, fix = fixture) => {
  const errors = errorsOf(overrides, fix);
  assert.ok(errors.some((e) => pattern.test(e)), `expected an error matching ${pattern}, got:\n${errors.join("\n") || "(none)"}`);
};
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const recordPrompt = () => JSON.parse(readFileSync(join(ROOT, fixture.record), "utf8")).assets.find((a) => a.path.endsWith(first)).prompt;

test("the repository passes the branded lock as committed", () => {
  const { errors, info } = checkBranded(fixture, io());
  assert.deepEqual(errors, []);
  assert.match(info, /12 branded backgrounds pinned/);
  assert.match(info, /3 reference illustrations/);
  assert.match(info, /11 geometry requirements, 5 avoid requirements and 4 negation guards/);
  assert.match(info, /4 precise-object edits pinned \(10 edit requirements, 2 edit avoid requirements, 3 edit kinds, 2 superseded earlier edits in lineage\)/);
});

/**
 * The closed-cube contract, pinned literally: the validator trusts the fixture, so a rule swapped for a copy
 * of another rule (or quietly loosened) must fail here, where a change is a reviewed edit of this file.
 */
const CONTRACT = {
  promptRequirements: [
    { label: "a solid, sealed cube", pattern: "\\bsolid\\b[^.;\\n]*\\bsealed\\b|\\bsealed\\b[^.;\\n]*\\bsolid\\b", flags: "i" },
    { label: "closed", pattern: "\\bclosed\\b", flags: "i" },
    { label: "monolithic", pattern: "\\bmonolithic\\b", flags: "i" },
    { label: "a smooth, unbroken or uninterrupted top", pattern: "\\b(smooth|unbroken|uninterrupted|continuous)\\b[^.;\\n]*\\btops?\\b|\\btops?\\b[^.;\\n]*\\b(smooth|unbroken|uninterrupted|continuous)\\b", flags: "i" },
    { label: "rounded", pattern: "\\brounded\\b", flags: "i" },
    { label: "the white UP! on the front face", pattern: "\\bwhite\\b[^.;\\n]*UP![^.;\\n]*\\bfront\\b|\\bfront\\b[^.;\\n]*\\bwhite\\b[^.;\\n]*UP!", flags: "i" },
    { label: "the UP! cube named", pattern: "UP! cubes?\\b" },
    { label: "no other readable text", pattern: "no other readable text", flags: "i" },
    { label: "opaque", pattern: "\\bopaque\\b", flags: "i" },
    { label: "a layered or dense composition", pattern: "\\b(layered|dense)\\b", flags: "i" },
    { label: "an Avoid line", pattern: "^Avoid:", flags: "m" },
  ],
  avoidRequirements: [
    { label: "holes, openings, slots, lids, rims or cavities rejected", pattern: "\\b(holes?|openings?|slots?|lids?|rims?|cavit(y|ies))\\b", flags: "i" },
    { label: "documents, cards or objects entering or emerging from a cube rejected", pattern: "\\b(documents?|cards?|papers?|objects?)\\b[^\\n]*\\b(entering|emerging)\\b", flags: "i" },
    { label: "handles, tabs or protrusions rejected", pattern: "\\b(handles?|tabs?|protrusions?)\\b", flags: "i" },
    { label: "transparency rejected", pattern: "\\btransparen(cy|t)\\b", flags: "i" },
    { label: "a watermark rejected", pattern: "\\bwatermarks?\\b", flags: "i" },
  ],
  promptNegations: [
    { label: "the closed geometry stated in the negative", scope: "prompt", pattern: "\\b(not|never|no|nor|without|instead of)\\s+(a |an |the |any |fully |completely |entirely |truly )?(closed|sealed|solid|monolithic|unbroken|uninterrupted)\\b", flags: "i" },
    { label: "an opening, aperture, lid, slot, hole, cavity, rim or receptacle requested", scope: "affirmative", pattern: "\\b(openings?|apertures?|lids?|lidded|lid seams?|slots?|slotted|holes?|cavit(y|ies)|rims?|receptacles?|hatch(es)?|hinged?|hinges|recess(ed|es)?|indent(ed|ation|ations)?|dimples?|sunken|concave|hollow(ed)?|unsealed|openable|open-top(ped)?)\\b|\\bopen\\s+(top|cube|cubes|box|container|die|dice)s?\\b", flags: "i" },
    { label: "an object entering or emerging from a cube, or a cube that opens", scope: "affirmative", pattern: "\\b(insert\\w*|enter\\w*|emerg\\w*|spill\\w*|pour\\w*|protrud\\w*|stick\\w*\\s+out|pok\\w*\\s+out|peek\\w*\\s+out|com(e|es|ing)\\s+out\\s+of|ris\\w*\\s+out\\s+of|float\\w*\\s+out\\s+of|tumbl\\w*\\s+out|slid\\w*\\s+(into|out)|slot\\w*\\s+into|drop\\w*\\s+into|plac\\w*\\s+(inside|into)|tuck\\w*\\s+(inside|into)|inside)\\b[^.;\\n]*\\bcubes?\\b|\\bcubes?\\b[^.;\\n]*\\b(insert\\w*|enter\\w*|emerg\\w*|open(s|ed|ing|able)?|unfold\\w*|inside|hold\\w*\\s+(a|an|cards?|documents?|objects?|papers?))\\b", flags: "i" },
    { label: "a flat badge, tile or slab requested", scope: "affirmative", pattern: "\\b(flat|shallow|thin)\\s+(rounded )?(badge|tile|slab|square|rectangle|extrusion|app.icon)s?\\b", flags: "i" },
  ],
  editPromptRequirements: [
    { label: "a precise-object edit", pattern: "^Use case: precise-object-edit$", flags: "m" },
    { label: "closed", pattern: "\\bclosed\\b", flags: "i" },
    { label: "a smooth, unbroken or uninterrupted top", pattern: "\\b(smooth|unbroken|uninterrupted|continuous)\\b[^.;\\n]*\\btops?\\b|\\btops?\\b[^.;\\n]*\\b(smooth|unbroken|uninterrupted|continuous)\\b", flags: "i" },
    { label: "the closed or sealed cube tops as an invariant", pattern: "\\b(closed|sealed)\\b[^.;\\n]*\\b(tops?|top planes?|surfaces?)\\b", flags: "i" },
    { label: "the UP! cube named", pattern: "UP! cubes?\\b" },
    { label: "the UP! lettering preserved", pattern: "\\bpreserv\\w*\\b[^\\n]*UP!|UP![^\\n]*\\bpreserv\\w*\\b", flags: "i" },
    { label: "only the named region edited", pattern: "\\b(edit|change) only\\b", flags: "i" },
    { label: "no new text", pattern: "\\bno (new|other|added) (readable )?text\\b", flags: "i" },
    { label: "no watermark", pattern: "\\bno watermarks?\\b", flags: "i" },
    { label: "an Avoid line", pattern: "^Avoid:", flags: "m" },
  ],
  editAvoidRequirements: [
    { label: "an opening, hole, slot, lid or rim on or from a cube rejected", pattern: "\\b(openings?|holes?|slots?|lids?|rims?)\\b[^\\n]*\\bcubes?\\b", flags: "i" },
    { label: "an insert on or from a cube rejected", pattern: "\\binserts?\\b[^\\n]*\\bcubes?\\b", flags: "i" },
  ],
  editKinds: {
    "object-replacement": {
      promptRequirements: [
        { label: "the object replaced", pattern: "\\breplace\\b", flags: "i" },
        { label: "brand-neutral replacements", pattern: "\\bbrand-neutral\\b", flags: "i" },
        { label: "no text, logo or branding on the replacements", pattern: "\\b(no|neither)\\b[^.;\\n]*\\b(text|logo|branding)\\b", flags: "i" },
        { label: "the UP! cubes not moved or reshaped", pattern: "\\bdo not move or reshape\\b[^.;\\n]*\\bUP! cubes?\\b", flags: "i" },
      ],
      avoidRequirements: [
        { label: "footwear, a shoe or a sneaker rejected", pattern: "\\b(footwear|shoes?|sneakers?)\\b", flags: "i" },
        { label: "a swoosh, stripe, logo or emblem rejected", pattern: "\\b(swoosh(es)?|stripes?|logos?|emblems?)\\b", flags: "i" },
        { label: "a word, letter or monogram rejected", pattern: "\\b(words?|letters?|monograms?)\\b", flags: "i" },
      ],
    },
    "top-plane-cleanup": {
      promptRequirements: [
        { label: "only the top planes edited", pattern: "\\b(edit|change) only\\b[^.;\\n]*\\btop planes?\\b", flags: "i" },
        { label: "a smooth, continuous, convex top surface", pattern: "\\b(smooth|continuous|convex)\\b[^.;\\n]*\\b(surface|plane)s?\\b", flags: "i" },
        { label: "the cubes read as sealed solid dice", pattern: "\\bread\\b[^.;\\n]*\\bsealed solid\\b", flags: "i" },
        { label: "the front faces unchanged", pattern: "\\bdo not change front faces\\b", flags: "i" },
        { label: "no object added or removed", pattern: "\\badd/remove objects\\b|\\badd or remove objects\\b", flags: "i" },
      ],
      avoidRequirements: [
        { label: "an inset or recess rejected", pattern: "\\b(insets?|recess\\w*)\\b", flags: "i" },
        { label: "a seam or receptacle rejected", pattern: "\\b(seams?|receptacles?)\\b", flags: "i" },
        { label: "anything entering or emerging from a cube rejected", pattern: "\\b(entering|emerging)\\b[^\\n]*\\bcubes?\\b", flags: "i" },
      ],
    },
    "occlusion-removal": {
      promptRequirements: [
        { label: "only the named sculpture removed", pattern: "\\bremove only\\b", flags: "i" },
        { label: "clear separation between the cube and its surroundings", pattern: "\\bseparat\\w*\\b[^.;\\n]*\\bcubes?\\b|\\bcubes?\\b[^.;\\n]*\\bseparat\\w*\\b", flags: "i" },
        { label: "visible background between the cube top and every object", pattern: "\\bvisible background\\b[^.;\\n]*\\bcube top\\b", flags: "i" },
        { label: "nothing emerging from or touching the cube top", pattern: "\\bnothing may\\b[^.;\\n]*\\b(emerge|touch)\\w*\\b", flags: "i" },
        { label: "the UP! cubes not moved or reshaped", pattern: "\\bdo not move or reshape\\b[^.;\\n]*\\bUP! cubes?\\b", flags: "i" },
      ],
      avoidRequirements: [
        { label: "a cone or bell rejected", pattern: "\\b(cones?|bells?)\\b", flags: "i" },
        { label: "an object touching or behind the cube top rejected", pattern: "\\b(touching|behind)\\b[^\\n]*\\bcube top\\b", flags: "i" },
        { label: "a protrusion rejected", pattern: "\\bprotrusions?\\b", flags: "i" },
        { label: "anything entering or emerging from a cube rejected", pattern: "\\b(entering|emerging)\\b[^\\n]*\\bcubes?\\b", flags: "i" },
      ],
    },
  },
};
const scopeRules = (rules, promptLabels) => {
  for (const rule of rules ?? []) rule.scope = promptLabels.has(rule.label) ? "prompt" : "affirmative";
};
scopeRules(CONTRACT.promptRequirements, new Set(["no other readable text", "an Avoid line"]));
scopeRules(CONTRACT.editPromptRequirements, new Set(["no new text", "no watermark", "an Avoid line"]));
scopeRules(CONTRACT.editKinds["object-replacement"].promptRequirements, new Set(["no text, logo or branding on the replacements", "the UP! cubes not moved or reshaped"]));
scopeRules(CONTRACT.editKinds["top-plane-cleanup"].promptRequirements, new Set(["the front faces unchanged", "no object added or removed"]));
scopeRules(CONTRACT.editKinds["occlusion-removal"].promptRequirements, new Set(["only the named sculpture removed", "nothing emerging from or touching the cube top", "the UP! cubes not moved or reshaped"]));
const kindRules = (k) => ({ promptRequirements: k.promptRequirements, avoidRequirements: k.avoidRequirements });

test("the geometry contract in the fixture is the one pinned here, rule for rule", () => {
  assert.deepEqual(fixture.geometry.promptRequirements, CONTRACT.promptRequirements);
  assert.deepEqual(fixture.geometry.avoidRequirements, CONTRACT.avoidRequirements);
  assert.deepEqual(fixture.geometry.promptNegations, CONTRACT.promptNegations);
  assert.deepEqual(fixture.geometry.editPromptRequirements, CONTRACT.editPromptRequirements);
  assert.deepEqual(fixture.geometry.editAvoidRequirements, CONTRACT.editAvoidRequirements);
  const kinds = Object.fromEntries(Object.entries(fixture.geometry.editKinds).filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, kindRules(v)]));
  assert.deepEqual(kinds, CONTRACT.editKinds);
  // A rule replaced by a copy of another keeps the count and drops a requirement; the validator rejects the duplicate.
  const fix = JSON.parse(JSON.stringify(fixture));
  fix.geometry.promptRequirements[2].pattern = fix.geometry.promptRequirements[1].pattern;
  expectError({}, /geometry rule "monolithic" repeats the pattern of another rule/, fix);
  const dup = JSON.parse(JSON.stringify(fixture));
  dup.geometry.promptNegations.push({ ...dup.geometry.promptNegations[0] });
  expectError({}, /geometry rule "the closed geometry stated in the negative" is listed twice/, dup);
  const scope = JSON.parse(JSON.stringify(fixture));
  scope.geometry.promptNegations[1].scope = "everywhere";
  expectError({}, /geometry rule .* has the unknown scope "everywhere"/, scope);
  const missingScope = JSON.parse(JSON.stringify(fixture));
  delete missingScope.geometry.promptRequirements[0].scope;
  expectError({}, /geometry rule .* has the unknown scope undefined/, missingScope);
  const editDup = JSON.parse(JSON.stringify(fixture));
  editDup.geometry.editAvoidRequirements[1].pattern = editDup.geometry.editAvoidRequirements[0].pattern;
  expectError({}, /geometry rule "an insert on or from a cube rejected" repeats the pattern of another rule/, editDup);
  const kindDup = JSON.parse(JSON.stringify(fixture));
  kindDup.geometry.editKinds["object-replacement"].avoidRequirements[1].pattern = kindDup.geometry.editKinds["object-replacement"].avoidRequirements[0].pattern;
  expectError({}, /geometry rule "a swoosh, stripe, logo or emblem rejected" repeats the pattern of another rule/, kindDup);
  // A kind without rules is a label, not a contract; a pin that names an unknown kind is rejected.
  const empty = JSON.parse(JSON.stringify(fixture));
  empty.geometry.editKinds["top-plane-cleanup"] = { promptRequirements: [], avoidRequirements: [] };
  expectError({}, /edit kind "top-plane-cleanup" adds no requirement/, empty);
  const unknown = JSON.parse(JSON.stringify(fixture));
  unknown.files[Object.keys(fixture.files).find((n) => fixture.files[n].edit)].edit.kind = "retouch";
  expectError({}, /the pinned edit names the unknown kind "retouch"/, unknown);
});

test("the affirmative text drops the Avoid lines and the negated part of every clause, and keeps the rest", () => {
  const prompt = "Subject: a SOLID SEALED cube; no lid on it; front carries exact white \"UP!\".\nConstraints: closed solid cubes only; no other readable text.\nAvoid: hole, opening, slot, lid; no watermark.";
  const text = affirmativeText(prompt);
  assert.doesNotMatch(text, /Avoid|watermark|\blid\b|readable text/);
  assert.match(text, /SOLID SEALED cube/);
  assert.match(text, /front carries exact white/);
  assert.match(text, /closed solid cubes only/);
  // A request that precedes a negation in the same clause is kept; what follows the negation word is dropped.
  const bundled = affirmativeText("Detail: a visible top opening and no other detail; cubes without any lid seam, never hollow.");
  assert.match(bundled, /a visible top opening and/);
  assert.doesNotMatch(bundled, /other detail|lid seam|hollow/);
  assert.match(bundled, /cubes/);
  // A removal clause takes its object away rather than asking for it, so an edit that removes an inset or a slot is not a request for one.
  const removal = affirmativeText("Primary request: Edit only the top planes. Remove any darker inset rounded rectangle, recess-like shading, indentation or slot-like highlight; delete the rim. Make each top plane a smooth continuous convex surface.");
  assert.doesNotMatch(removal, /\b(inset|recess|indentation|slot|rim)\b/);
  assert.match(removal, /Edit only the top planes/);
  assert.match(removal, /Make each top plane a smooth continuous convex surface/);
  assert.match(affirmativeText("Detail: add a lid, then remove the seam."), /add a lid/);
});

test("a replaced background file is rejected by its hash", () => {
  expectError({ hashes: { [`${fixture.directory}/${first}`]: "0".repeat(64) } }, /is not the pinned file/);
});

test("a file whose header facts drift is rejected: dimensions, opacity, bit depth, colour type", () => {
  const path = `${fixture.directory}/${first}`;
  const ok = { dimensions: fixture.files[first].dimensions, bitDepth: 8, colourType: "RGB", canBeTransparent: false };
  assert.deepEqual(errorsOf({ infos: { [path]: ok } }), []);
  expectError({ infos: { [path]: { ...ok, dimensions: "1600x900" } } }, new RegExp(`${first}: is 1600x900, the pinned dimensions are ${fixture.files[first].dimensions}`));
  expectError({ infos: { [path]: { ...ok, canBeTransparent: true } } }, new RegExp(`${first}: carries transparency; every branded background is opaque`));
  expectError({ infos: { [path]: { ...ok, bitDepth: 16 } } }, new RegExp(`${first}: is 16-bit, the contract requires 8-bit`));
  expectError({ infos: { [path]: { ...ok, colourType: "RGBA" } } }, new RegExp(`${first}: is RGBA, the contract requires RGB`));
  expectError({ infos: { [path]: null } }, new RegExp(`${first}: cannot be read as a PNG`));
});

test("a changed provenance entry is rejected: hash, dimensions, prompt, generation id, references, count, safe zone, measurement", () => {
  const mutate = (fn) => editJson(fixture.record, (p) => { fn(p.assets.find((a) => a.path.endsWith(first))); return p; });
  expectError({ texts: mutate((a) => { a.sha256 = "1".repeat(64); }) }, /sha256 .* differs from the pinned/);
  expectError({ texts: mutate((a) => { a.dimensions = "1671x941"; }) }, /dimensions 1671x941 differ from the pinned/);
  expectError({ texts: mutate((a) => { a.prompt += " and one more cube"; }) }, /prompt differs from the pinned selection/);
  expectError({ texts: mutate((a) => { a.generation.id = "exec-00000000-0000-0000-0000-000000000000"; }) }, /generation id .* differs/);
  expectError({ texts: mutate((a) => { a.generation.inputs[0].sha256 = "f".repeat(64); }) }, /reference get-started-\d.png sha256 is "ffff/);
  expectError({ texts: mutate((a) => { a.generation.inputs[0].published = false; }) }, /reference get-started-\d.png published is false/);
  expectError({ texts: mutate((a) => { a.generation.inputs[0].source = "another-source"; }) }, /reference get-started-\d.png source is "another-source"/);
  expectError({ texts: mutate((a) => { a.generation.inputs[0].path = "assets/slides/onboarding/get-started-1.png"; }) }, /records an input that is not a pinned reference: assets\/slides\/onboarding\/get-started-1.png/);
  expectError({ texts: mutate((a) => { a.generation.inputs.splice(0, 1); }) }, /must record the reference get-started-\d.png/);
  expectError({ texts: mutate((a) => { a.generation.inputs.push({ role: "Image 1: the edit target", sha256: "e".repeat(64) }); }) }, /records an input that is not a pinned reference/);
  expectError({ texts: mutate((a) => { a.embeddedMarks.count += 1; }) }, /declares \d+ UP! cubes, the pinned count/);
  expectError({ texts: mutate((a) => { a.embeddedMarks.rights = "free to reuse"; }) }, /must state the extraction restriction/);
  expectError({ texts: mutate((a) => { a.safeZone.width = 0.99; }) }, /safe zone width is 0.99/);
  expectError({ texts: mutate((a) => { a.safeZone.measured.deviation += 1; }) }, /recorded safe-zone measurement .* differs/);
  expectError({ texts: mutate((a) => { a.status = "observed"; }) }, /status observed, expected proposed/);
  expectError({ texts: mutate((a) => { a.contentCredentials.timestamp = "2026-01-01T00:00:00Z"; }) }, /time stamp .* differs/);
});

test("the reference illustrations are pinned by hash on disk, in their record, in the set block and in the staged file", () => {
  const [refName, refSha] = Object.entries(R.files)[0];
  expectError({ hashes: { [`${R.directory}/${refName}`]: "9".repeat(64) } }, new RegExp(`${R.directory}/${refName}: sha256 9999.* is not the pinned reference ${refSha.slice(0, 12)}`));
  expectError({ hashes: { [`${R.directory}/${refName}`]: null } }, new RegExp(`${R.directory}/${refName}: missing`));
  expectError({ texts: editJson(R.record, (p) => { p.assets.find((a) => a.path === refName).sha256 = "8".repeat(64); return p; }) }, new RegExp(`${escape(R.record)}: ${refName} sha256 .* differs from the pinned reference`));
  expectError({ texts: editJson(R.record, (p) => { p.assets = p.assets.filter((a) => a.path !== refName); return p; }) }, new RegExp(`${escape(R.record)}: no entry for the reference ${refName}`));
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].references = p.sets[fixture.set].references.filter((r) => !r.path.endsWith(refName)); return p; }) }, new RegExp(`set ${fixture.set} must list the reference ${refName}`));
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].references[0].sha256 = "7".repeat(64); return p; }) }, /set slides-v2 reference get-started-\d.png sha256 is "7777/);
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].references.push({ role: "reference", path: "assets/slides/onboarding/get-started-1.png", sha256: "6".repeat(64) }); return p; }) }, /set slides-v2 lists a reference that is not pinned: assets\/slides\/onboarding\/get-started-1.png/);
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.generation.references[refName].sha256 = "5".repeat(64); return p; }) }, new RegExp(`generation.references.${refName} sha256 .* differs from the pinned`));
  expectError({ texts: editJson(fixture.promptFile, (p) => { delete p.generation.references[refName]; return p; }) }, new RegExp(`generation.references must list ${refName}`));
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets[0].references = ["get-started-1.png"]; return p; }) }, /references \["get-started-1.png"\] differ from the pinned/);
});

test("the superseded board exports may not be an input, a prompt citation or an unqualified mention anywhere", () => {
  const mutate = (fn) => editJson(fixture.record, (p) => { fn(p.assets.find((a) => a.path.endsWith(first))); return p; });
  for (const sup of S.nodes) {
    expectError({ texts: mutate((a) => { a.generation.inputs.push({ role: "Image 2", node: sup.node }); }) }, new RegExp(`generation input cites the superseded reference node ${escape(sup.node)}`));
    expectError({ texts: mutate((a) => { a.generation.inputs[0].sha256 = sup.inputSha256; }) }, new RegExp(`cites the superseded reference node ${escape(sup.node)}`));
    expectError({ texts: mutate((a) => { a.prompt = `${a.prompt}\nReference: node ${sup.node}.`; }) }, new RegExp(`prompt cites the superseded reference node ${escape(sup.node)}`));
    expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].supersededReferences = p.sets[fixture.set].supersededReferences.filter((s) => s.node !== sup.node); return p; }) }, new RegExp(`must record the superseded reference node ${escape(sup.node)}`));
    expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].supersededReferences.find((s) => s.node === sup.node).status = "the reference"; return p; }) }, new RegExp(`must record the superseded reference node ${escape(sup.node)} .* as superseded`));
    expectError({ texts: editJson(fixture.promptFile, (p) => { p.generation.supersededReferences = p.generation.supersededReferences.split(sup.node).join("0:0"); return p; }) }, new RegExp(`generation.supersededReferences must name node ${escape(sup.node)} as superseded`));
    expectError({ texts: editJson(fixture.promptFile, (p) => { p.generation.mode += ` from node ${sup.node}`; return p; }) }, new RegExp(`generation.mode must not cite the superseded node ${escape(sup.node)}`));
    expectError({ texts: edit("assets/generated/backgrounds/README.md", (t) => `${t}\nThe reference is board node ${sup.node}.\n`) }, new RegExp(`README.md:\\d+: names the superseded reference node ${escape(sup.node)} without calling it superseded`));
    assert.deepEqual(errorsOf({ texts: edit("assets/generated/backgrounds/README.md", (t) => `${t}\nBoard node ${sup.node} is superseded by the closed-cube set.\n`) }), []);
  }
});

/** Mutate one prompt in the record and the staged file alike and re-pin its hash, so only the geometry check speaks. */
function withPrompt(fn) {
  const record = JSON.parse(readFileSync(join(ROOT, fixture.record), "utf8"));
  const staged = JSON.parse(readFileSync(join(ROOT, fixture.promptFile), "utf8"));
  const entry = record.assets.find((a) => a.path.endsWith(first));
  const prompt = fn(entry.prompt);
  entry.prompt = prompt;
  staged.assets.find((e) => e.name === first).prompt = prompt;
  const fix = JSON.parse(JSON.stringify(fixture));
  fix.files[first].promptSha256 = sha256Text(prompt);
  return { texts: { [fixture.record]: JSON.stringify(record, null, 2), [fixture.promptFile]: JSON.stringify(staged, null, 2) }, fix };
}
const omitted = (errors, label) => errors.includes(`${fixture.record}: ${first} prompt omits the geometry requirement ${JSON.stringify(label)}`);
const avoidOmitted = (errors, label) => errors.includes(`${fixture.record}: ${first} prompt's Avoid line does not reject ${JSON.stringify(label).replace(/ rejected"$/, '"')}`);
const contradicted = (errors, label) => errors.includes(`${fixture.record}: ${first} prompt contradicts the closed-cube contract: ${JSON.stringify(label)}`);
/** Only what the geometry check says about a prompt, so these tests do not depend on the state of the documents. */
const promptErrors = (errors) => errors.filter((e) => /prompt (omits|contradicts|cites|'s Avoid line)/.test(e));

test("a re-pinned prompt that drops the closed-cube geometry is rejected, requirement by requirement", () => {
  const prompt = recordPrompt();
  // The committed prompt satisfies every requirement, and re-pinning it unchanged is clean.
  const same = withPrompt((p) => p);
  assert.deepEqual(promptErrors(errorsOf({ texts: same.texts }, same.fix)), []);
  for (const req of fixture.geometry.promptRequirements) {
    const re = new RegExp(req.pattern, req.flags ?? "");
    assert.match(prompt, re, `the committed prompt of ${first} states ${req.label}`);
    const { texts, fix } = withPrompt((p) => p.replace(new RegExp(req.pattern, `g${req.flags ?? ""}`), "[removed]"));
    const errors = errorsOf({ texts }, fix);
    assert.ok(omitted(errors, req.label), `record: expected the omission of ${req.label}, got:\n${errors.join("\n") || "(none)"}`);
    assert.ok(errors.some((e) => e.includes(`${fixture.promptFile}: ${first} prompt omits the geometry requirement ${JSON.stringify(req.label)}`)), `staged file: expected the omission of ${req.label}`);
  }
  // The mutation the owner's correction guards against: the closed and sealed language removed, everything else intact.
  const opened = withPrompt((p) => p.replace(/\b(closed|sealed)\b/gi, "").replace(/\bmonolithic\b/gi, "").replace(/\bunbroken\b|\buninterrupted\b|\bcontinuous\b|\bsmooth\b/gi, ""));
  const o = errorsOf({ texts: opened.texts }, opened.fix);
  assert.ok(omitted(o, "a solid, sealed cube"), o.join("\n"));
  assert.ok(omitted(o, "closed"), o.join("\n"));
  assert.ok(omitted(o, "monolithic"), o.join("\n"));
  assert.ok(omitted(o, "a smooth, unbroken or uninterrupted top"), o.join("\n"));
  const hidden = withPrompt((p) => `${p.replace(/\bmonolithic\b/gi, "[removed]")}\nAvoid: monolithic cube.`);
  const hiddenErrors = errorsOf({ texts: hidden.texts }, hidden.fix);
  assert.ok(omitted(hiddenErrors, "monolithic"), hiddenErrors.join("\n"));
  // The Avoid line must keep rejecting the openings, the inserts and the protrusions.
  for (const req of fixture.geometry.avoidRequirements) {
    const { texts, fix } = withPrompt((p) => p.split("\n").map((l) => (l.startsWith("Avoid:") ? l.replace(new RegExp(req.pattern, `g${req.flags ?? ""}`), "[removed]") : l)).join("\n"));
    const errors = errorsOf({ texts }, fix);
    assert.ok(avoidOmitted(errors, req.label), `expected the Avoid line to be reported for ${req.label}, got:\n${errors.join("\n") || "(none)"}`);
  }
  const noAvoid = withPrompt((p) => p.split("\n").filter((l) => !l.startsWith("Avoid:")).join("\n"));
  const n = errorsOf({ texts: noAvoid.texts }, noAvoid.fix);
  assert.ok(omitted(n, "an Avoid line"), n.join("\n"));
  assert.ok(fixture.geometry.avoidRequirements.every((req) => avoidOmitted(n, req.label)), n.join("\n"));
  // A prompt in the shape of the rejected open-receptacle draft fails the closed requirements, each reported by name.
  const draft = withPrompt(() => "Use case: precise-object-edit\nPrimary request: replace every flat badge with a genuine volumetric UP! container cube.\nCube geometry: approximately equal width, height and depth; front, top and side faces in three-quarter perspective; softly rounded cube edges; a subtle top opening, aperture or lid seam so it reads as a container; the exact white \"UP!\" once on the front face.\nAvoid: front-on app-icon shapes, thin slabs.");
  const d = errorsOf({ texts: draft.texts }, draft.fix);
  for (const label of ["a solid, sealed cube", "closed", "monolithic", "a smooth, unbroken or uninterrupted top", "no other readable text", "opaque", "a layered or dense composition"]) assert.ok(omitted(d, label), `the open-receptacle draft must omit ${label}:\n${d.join("\n")}`);
  assert.ok(contradicted(d, "an opening, aperture, lid, slot, hole, cavity, rim or receptacle requested"), d.join("\n"));
});

test("positive open-top language is rejected wherever it stands, while Avoid clauses and negated clauses are not", () => {
  const prompt = recordPrompt();
  // Every positive form of an opening trips the guard, in the record and in the staged file.
  for (const line of ["Subject: each cube has a subtle top opening so it reads as a container.", "Cube geometry: a lid seam on top.", "Detail: a slot cut into the top face.", "Detail: a hollow cube with a recessed oval.", "Detail: an open top on the large cube.", "Detail: a lidded cube.", "Detail: an openable cube.", "Detail: a hollow cube.", "Detail: a hollowed-out top.", "Detail: a slotted top.", "Detail: a hinged top that lifts.", "Detail: a shallow circular indentation on the top.", "Detail: a sunken concave top.", "Detail: open cubes.", "Detail: a visible top opening and no other detail."]) {
    const { texts, fix } = withPrompt((p) => `${p}\n${line}`);
    const errors = errorsOf({ texts }, fix);
    assert.ok(contradicted(errors, "an opening, aperture, lid, slot, hole, cavity, rim or receptacle requested"), `${line}\n${errors.join("\n") || "(none)"}`);
    assert.ok(errors.some((e) => e.startsWith(`${fixture.promptFile}: ${first} prompt contradicts the closed-cube contract`)), `staged file: ${line}`);
  }
  for (const line of ["Detail: a profile card entering the large cube.", "Detail: the cube opens to reveal a document.", "Detail: ribbons emerging from each cube.", "Detail: cards emerge from the cube.", "Detail: documents emerge from the cube.", "Detail: objects emerge from the cube.", "Detail: tokens spill out of the cube.", "Detail: a profile card slides into the large cube.", "Detail: cards poke out of the cube.", "Detail: a document sits inside the cube.", "Detail: the cube holds a card.", "Detail: a card inserted into the cube.", "Detail: a cube that unfolds."]) {
    const { texts, fix } = withPrompt((p) => `${p}\n${line}`);
    assert.ok(contradicted(errorsOf({ texts }, fix), "an object entering or emerging from a cube, or a cube that opens"), line);
  }
  for (const line of ["Note: the cubes are not sealed.", "Note: never a closed cube.", "Note: without a solid body."]) {
    const { texts, fix } = withPrompt((p) => `${p}\n${line}`);
    assert.ok(contradicted(errorsOf({ texts }, fix), "the closed geometry stated in the negative"), line);
  }
  const flat = withPrompt((p) => `${p}\nDetail: render the small ones as a flat badge.`);
  assert.ok(contradicted(errorsOf({ texts: flat.texts }, flat.fix), "a flat badge, tile or slab requested"));
  // The forbidden nouns inside an Avoid clause or a negated clause never trip a guard.
  for (const line of ["Avoid: cubes with a lid, an open top, a slot, a hollow body or a recessed oval; no documents entering cubes.", "Constraints: no lid, no opening, no slot, no hole, no cavity and no rim on any cube; nothing enters or emerges from a cube.", "Subject: cubes without any lid seam or aperture, never hollow.", "Constraints: no lidded or openable cubes; nothing spills out of or emerges from a cube; never a hollow cube; no indentation, no sunken or concave top, no slotted or hinged top; no card slides into a cube and nothing sits inside a cube.", "Avoid: lidded cubes, openable cubes, cards, documents or objects that emerge from the cube, anything that spills out of the cube, hollow cubes."]) {
    const { texts, fix } = withPrompt((p) => `${p}\n${line}`);
    assert.deepEqual(promptErrors(errorsOf({ texts }, fix)), [], line);
  }
  // Valid variations pass: the closed language in other words, the mark without quotation marks.
  const variant = withPrompt(() => prompt
    .replace("SOLID SEALED dice-like rounded periwinkle cube", "sealed, solid, rounded periwinkle die-like cube")
    .replace(/exact white "UP!"/g, "exact white UP! mark"));
  assert.deepEqual(promptErrors(errorsOf({ texts: variant.texts }, variant.fix)), []);
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

test("the pinned safe zones meet the slide contract and are shared by the light and dark file of a family", () => {
  for (const [name, pin] of Object.entries(fixture.files)) {
    const z = pin.safeZone;
    if (name.endsWith("-light.png")) assert.ok(z.meanLuminance >= fixture.contract.lightMinSafeZoneLuminance, `${name} light zone`);
    else assert.ok(z.meanLuminance <= fixture.contract.darkMaxSafeZoneLuminance, `${name} dark zone`);
    assert.ok(z.deviation <= fixture.contract.maxSafeZoneDeviation, `${name} quiet zone`);
  }
  const fix = JSON.parse(JSON.stringify(fixture));
  fix.files[`${family}-dark.png`].safeZone.width += 0.1;
  expectError({}, new RegExp(`${family}: the light and dark zones differ`), fix);
  const loose = JSON.parse(JSON.stringify(fixture));
  loose.files[first].safeZone.deviation = 30;
  expectError({}, new RegExp(`${first}: the pinned safe zone .* does not meet the slide contract`), loose);
});

test("a missing background or contact sheet is reported as missing, and nothing else is measured for it", () => {
  const errors = errorsOf({ hashes: { [`${fixture.directory}/${first}`]: null } });
  assert.deepEqual(errors, [`${fixture.directory}/${first}: missing`]);
  const sheet = Object.keys(fixture.previews.sheets)[0];
  assert.deepEqual(errorsOf({ hashes: { [`${fixture.previews.directory}/${sheet}`]: null } }), [`${fixture.previews.directory}/${sheet}: missing`]);
  // A missing app showcase is the assets check's business; the lock only rejects a changed one.
  assert.deepEqual(errorsOf({ hashes: { [`${fixture.previews.directory}/app-showcase-light.png`]: null } }), []);
});

test("the set must cite the decision, and the contract may not be loosened", () => {
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].decision = fixture.decision.predecessor.path; return p; }) }, new RegExp(`must cite ${escape(fixture.decision.path)}`));
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].count = 11; return p; }) }, /declares 11 files, the pinned selection has 12/);
  expectError({ texts: editJson(fixture.record, (p) => { p.contract.maxSafeZoneDeviation = 40; return p; }) }, /contract maxSafeZoneDeviation is 40/);
  expectError({ texts: editJson(fixture.record, (p) => { p.contract.lightRegister.minSafeZoneLuminance = 100; return p; }) }, /minSafeZoneLuminance is 100/);
  expectError({ texts: editJson(fixture.record, (p) => { p.contract.alphaChannel = true; return p; }) }, /contract alphaChannel is true/);
  expectError({ texts: editJson(fixture.record, (p) => { p.license = "Apache-2.0"; return p; }) }, /licence must state/);
  expectError({ texts: editJson(fixture.record, (p) => { p.assets.push({ ...p.assets.find((a) => a.path.endsWith(first)), path: "backgrounds/slides-v2/extra-light.png" }); return p; }) }, /extra-light.png is in set/);
});

test("the staged prompt file must match the pinned selection", () => {
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets[0].prompt = "different"; return p; }) }, /prompt differs from the pinned selection/);
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets[0].generationId = "exec-other"; return p; }) }, /generation id exec-other differs/);
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets.push({ name: "extra-dark.png", prompt: "x" }); return p; }) }, /extra-dark.png has a prompt entry/);
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets = p.assets.filter((e) => e.name !== first); return p; }) }, new RegExp(`no entry for ${first}`));
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

test("the galleries must show every pinned file and both contact sheets", () => {
  for (const [file, images] of Object.entries(fixture.galleries)) {
    if (file.startsWith("$")) continue;
    for (const image of images) expectError({ texts: edit(file, (t) => t.split(image).join("missing.png")) }, new RegExp(`${escape(file)}: the gallery no longer shows ${escape(image)}`));
  }
});

test("the decision record, its predecessor, the index and the source register are required", () => {
  const decisionName = fixture.decision.path.split("/").pop();
  expectError({ texts: { [fixture.decision.path]: null } }, new RegExp(`${escape(decisionName)}: missing`));
  expectError({ texts: edit(fixture.decision.path, (t) => t.replace(/^Status: accepted/m, "Status: proposed")) }, /Status line must read accepted/);
  for (const [name, sha] of Object.entries(R.files)) {
    expectError({ texts: edit(fixture.decision.path, (t) => t.split(sha).join("")) }, new RegExp(`must state "${sha.slice(0, 4)}`));
    expectError({ texts: edit(fixture.decision.path, (t) => t.split(name).join("")) }, new RegExp(`must state "${escape(name)}"`));
  }
  expectError({ texts: edit(fixture.decision.path, (t) => t.replace(/not granted/g, "granted")) }, /must state "not granted"/);
  expectError({ texts: edit(fixture.decision.path, (t) => t.split("solid, closed and sealed").join("volumetric")) }, /must state "solid, closed and sealed"/);
  expectError({ texts: edit(fixture.decision.path, (t) => t.split("the Universal Profile is a container").join("the profile is an address")) }, /must state "the Universal Profile is a container"/);
  expectError({ texts: edit(fixture.decision.index, (t) => t.split("\n").filter((l) => !l.includes(decisionName)).join("\n")) }, /does not list/);
  expectError({ texts: edit(fixture.decision.index, (t) => t.split("\n").map((l) => (l.includes(decisionName) ? l.replace(/accepted/g, "proposed") : l)).join("\n")) }, new RegExp(`row for decision ${fixture.decision.id} must say accepted`));
  // The predecessor stays in the tree, keeps its history and points at the correction.
  expectError({ texts: { [fixture.decision.predecessor.path]: null } }, new RegExp(`${escape(fixture.decision.predecessor.path)}: missing`));
  expectError({ texts: edit(fixture.decision.predecessor.path, (t) => t.replace(/^Status:.*$/m, "Status: accepted")) }, new RegExp(`${escape(fixture.decision.predecessor.path)}: Status line must say that .* superseded by ${fixture.decision.id}`));
  expectError({ texts: edit(fixture.decision.index, (t) => t.split("\n").map((l) => (l.includes(fixture.decision.predecessor.path.split("/").pop()) ? l.split(fixture.decision.id).join("00xx") : l)).join("\n")) }, new RegExp(`row for decision ${fixture.decision.predecessor.id} must point to ${fixture.decision.id}`));
  expectError({ texts: editJson(fixture.sources.register, (r) => { r.sources[fixture.sources.boardKey].notes = "Sixteen images."; return r; }) }, new RegExp(`${fixture.sources.boardKey} notes must cite decision 0013`));
  expectError({ texts: editJson(fixture.sources.register, (r) => { r.sources[fixture.sources.boardKey].notes = r.sources[fixture.sources.boardKey].notes.split("superseded").join("used"); return r; }) }, new RegExp(`notes must name node ${escape(S.nodes[0].node)} as superseded`));
  expectError({ texts: editJson(fixture.sources.register, (r) => { r.sources[fixture.sources.generatedKey].notes = "Sixteen images."; return r; }) }, new RegExp(`${fixture.sources.generatedKey} notes must cite decision 0013`));
  expectError({ texts: editJson(fixture.sources.register, (r) => { r.sources[fixture.sources.referenceKey].notes = "Shipped art."; return r; }) }, new RegExp(`${fixture.sources.referenceKey} notes must cite decision 0013`));
  expectError({ texts: editJson(fixture.sources.register, (r) => { delete r.sources[fixture.sources.referenceKey]; return r; }) }, new RegExp(`no ${fixture.sources.referenceKey}`));
});

test("mark files, README table drift, missing wording and contradictory claims are rejected", () => {
  const light = fixture.files[`${family}-light.png`].safeZone;
  const zone = `| ${light.x}, ${light.y}, ${light.width}, ${light.height} (`;
  const measured = `| ${Math.round(light.meanLuminance)}, deviation ${Math.round(light.deviation)} |`;
  const table = readFileSync(join(ROOT, fixture.readmeTable), "utf8");
  assert.ok(table.includes(zone) && table.includes(measured), "the README table states the pinned zone and measurement of the first family");
  expectError({ dirs: { [fixture.logosDirectory]: ["README.md", "up-cube.png"] } }, /contains up-cube.png/);
  expectError({ texts: edit(fixture.readmeTable, (t) => t.replace(zone, `| ${light.x}, ${light.y}, ${light.width + 0.1}, ${light.height} (`)) }, new RegExp(`${family} row must state the zone`));
  expectError({ texts: edit(fixture.readmeTable, (t) => t.replace(measured, `| ${Math.round(light.meanLuminance) + 1}, deviation ${Math.round(light.deviation) + 1} |`)) }, /measured light zone/);
  expectError({ texts: edit("TRADEMARKS.md", (t) => t.replace("not licensed for extraction or standalone reuse", "licensed")) }, /TRADEMARKS.md: must contain/);
  expectError({ texts: { "LICENSES/README.md": null } }, /LICENSES\/README.md: missing/);
  expectError({ texts: edit("README.md", (t) => `${t}\nThe slide backgrounds contain no marks and no text.\n`) }, /README.md:\d+: claims the backgrounds carry no words/);
  expectError({ texts: edit("imagery/briefs.md", (t) => t.replace("## IB-12 Presentation background family (slides-v2)\n", "## IB-12 Presentation background family (slides-v2)\n\nBackground only: no logos.\n")) }, /imagery\/briefs.md:\d+: claims/);
  // "no other words" is the accurate form and passes; a claim in another brief's section is outside the scan.
  assert.deepEqual(errorsOf({ texts: edit("README.md", (t) => `${t}\nThey show the UP! mark and no other words, letters or marks.\n`) }), []);
  assert.deepEqual(errorsOf({ texts: edit("imagery/briefs.md", (t) => t.replace("## IB-11 Cultural-token object set\n", "## IB-11 Cultural-token object set\n\nNo text.\n")) }), []);
});

test("documents must state the closed-cube contract and may not fall back to the flat-badge or the open-receptacle form", () => {
  for (const [file, phrases] of Object.entries(fixture.geometry.documentPhrases)) {
    for (const phrase of phrases) {
      expectError({ texts: edit(file, (t) => t.split(phrase).join("[removed]")) }, new RegExp(`${escape(file)}: must state the closed-cube contract: ${escape(JSON.stringify(phrase))}`));
    }
  }
  expectError({ texts: edit("README.md", (t) => `${t}\nThe UP! box is the cube mark with the badge face.\n`) }, /README.md:\d+: describes the depicted UP! object as the superseded flat-badge form/);
  expectError({ texts: edit("brand/lockups.md", (t) => `${t}\nEvery box keeps the exact rounded-square periwinkle 3D form.\n`) }, /brand\/lockups.md:\d+: describes the depicted UP! object as the superseded flat-badge form/);
  // The open-receptacle form of the rejected draft, in the words of its prompts and documents.
  for (const line of ["Each cube has a subtle top opening, aperture or lid seam so it reads as a container.", "Every branded object shows a top face with the container opening.", "The cube is a container one can open.", "Its lid shows it can be opened.", "The object opens into a receptacle."]) {
    expectError({ texts: edit("imagery/README.md", (t) => `${t}\n${line}\n`) }, /imagery\/README.md:\d+: describes the depicted UP! object as the rejected open-receptacle form/);
  }
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.generation.geometry += " Each cube has a small opening on top."; return p; }) }, /PROMPTS.source.json:\d+: describes the depicted UP! object as the rejected open-receptacle form/);
  // Accurate closed-cube wording passes, negative statements pass, and the rejected draft may be named.
  for (const line of ["Each file shows solid, closed and sealed UP! container cubes with smooth, continuous top and side planes, never a flat badge.", "There is no hole, slot, lid, rim, cavity or insert; nothing opens, enters or emerges.", "The open-receptacle draft of 2026-09-15 was rejected and never published.", "Never a top opening, not a lid, without an aperture."]) {
    assert.deepEqual(errorsOf({ texts: edit("README.md", (t) => `${t}\n${line}\n`) }), [], line);
  }
});

/** Every pinned precise-object edit: the file name, its pin, and whether it is a chain (a lineage of earlier edits). */
const editedFiles = Object.keys(fixture.files).filter((n) => fixture.files[n].edit);
const chained = editedFiles.find((n) => (fixture.files[n].edit.lineage ?? []).length);
const single = editedFiles.find((n) => !(fixture.files[n].edit.lineage ?? []).length);
const readRecord = () => JSON.parse(readFileSync(join(ROOT, fixture.record), "utf8"));
/** Mutate one file's edit in the record and the staged file alike; `fix` re-pins the edit prompt hash (and the lineage prompt hashes) when a prompt changes. */
function withEdit(name, fn, { staged = fn } = {}) {
  const record = readRecord();
  const stagedFile = JSON.parse(readFileSync(join(ROOT, fixture.promptFile), "utf8"));
  const entry = record.assets.find((a) => a.path.endsWith(name));
  fn(entry.edit, entry, record);
  staged(stagedFile.assets.find((e) => e.name === name).edit);
  const fix = JSON.parse(JSON.stringify(fixture));
  fix.files[name].edit.promptSha256 = sha256Text(entry.edit.prompt);
  (fix.files[name].edit.lineage ?? []).forEach((l, i) => { l.promptSha256 = sha256Text(entry.edit.lineage[i].prompt); });
  return { texts: { [fixture.record]: JSON.stringify(record, null, 2), [fixture.promptFile]: JSON.stringify(stagedFile, null, 2) }, fix };
}
const editErrors = (errors) => errors.filter((e) => /edit|lineage/.test(e));

test("the four pinned edits cover three kinds, two of them chains that end at the generation output", () => {
  assert.equal(editedFiles.length, 4);
  assert.deepEqual(new Set(editedFiles.map((n) => fixture.files[n].edit.kind)), new Set(["object-replacement", "top-plane-cleanup", "occlusion-removal"]));
  assert.ok(chained && single, "the fixture pins a chain and a single edit");
  const record = readRecord();
  for (const name of editedFiles) {
    const pin = fixture.files[name].edit;
    const entry = record.assets.find((a) => a.path.endsWith(name));
    assert.equal(sha256Text(entry.edit.prompt), pin.promptSha256, `${name}: the record's edit prompt is the pinned one`);
    assert.equal(entry.edit.kind, pin.kind, `${name}: the record names the pinned kind`);
    assert.notEqual(entry.sha256, pin.targetSha256, `${name}: the file on disk is the edit's output, not its target`);
    const lineage = pin.lineage ?? [];
    // The chain: the pinned edit targets the previous edit's output, and the last link targets the entry's own generation.
    const last = lineage.length ? lineage[lineage.length - 1] : pin;
    assert.equal(last.targetGenerationId, fixture.files[name].generationId, `${name}: the chain ends at the file's own generation output`);
    if (lineage.length) {
      assert.equal(pin.targetSha256, lineage[0].outputSha256, `${name}: the pinned edit targets the earlier edit's output`);
      assert.equal(pin.targetGenerationId, lineage[0].generationId);
      assert.equal(entry.edit.lineage.length, lineage.length);
      assert.equal(sha256Text(entry.edit.lineage[0].prompt), lineage[0].promptSha256, `${name}: the lineage prompt is the pinned one`);
    }
  }
  // A pin whose chain is broken is rejected before any file is read: a target that is not the previous step, an output that is not the next target, a superseded output pinned as the file.
  const target = JSON.parse(JSON.stringify(fixture));
  target.files[chained].edit.targetGenerationId = fixture.files[chained].generationId;
  expectError({}, new RegExp(`${escape(chained)}: the pinned edit targets generation .*, but the previous step of the chain is .* \\(the earlier edit\\)`), target);
  const output = JSON.parse(JSON.stringify(fixture));
  output.files[chained].edit.lineage[0].outputSha256 = "a".repeat(64);
  expectError({}, new RegExp(`${escape(chained)}: the pinned edit targets .*, but the earlier edit's output is aaaa`), output);
  const end = JSON.parse(JSON.stringify(fixture));
  end.files[chained].edit.lineage[0].targetGenerationId = "exec-elsewhere";
  expectError({}, new RegExp(`${escape(chained)}: lineage edit 1 targets generation exec-elsewhere, but the previous step of the chain is .* \\(the entry's own generation\\)`), end);
  const self = JSON.parse(JSON.stringify(fixture));
  self.files[chained].edit.lineage[0].outputSha256 = fixture.files[chained].sha256;
  expectError({}, new RegExp(`${escape(chained)}: a lineage edit's output is the pinned file itself`), self);
  const directSingle = JSON.parse(JSON.stringify(fixture));
  directSingle.files[single].edit.targetGenerationId = "exec-other";
  expectError({}, new RegExp(`${escape(single)}: the pinned edit targets generation exec-other, but the previous step of the chain is .* \\(the entry's own generation\\)`), directSingle);
});

test("a pinned precise-object edit must agree between the record, the staged file, the set block and the pin", () => {
  for (const name of editedFiles) {
    const pin = fixture.files[name].edit;
    // Re-pinning the committed edit unchanged is clean.
    const same = withEdit(name, () => {});
    assert.deepEqual(editErrors(errorsOf({ texts: same.texts }, same.fix)), []);
    const mutate = (fn) => editJson(fixture.record, (p) => { fn(p.assets.find((a) => a.path.endsWith(name))); return p; });
    expectError({ texts: mutate((a) => { a.edit.id = "exec-00000000-0000-0000-0000-000000000000"; }) }, /edit generation id exec-0000.* differs from the pinned/);
    expectError({ texts: mutate((a) => { a.edit.method = "regeneration"; }) }, /edit method "regeneration" differs from the pinned "precise-object-edit"/);
    expectError({ texts: mutate((a) => { a.edit.kind = "retouch"; }) }, new RegExp(`${escape(name)} edit kind "retouch" differs from the pinned "${pin.kind}"`));
    expectError({ texts: mutate((a) => { a.edit.prompt += " and a hat"; }) }, /edit prompt differs from the pinned edit/);
    expectError({ texts: mutate((a) => { a.edit.target.sha256 = "d".repeat(64); }) }, /edit target sha256 dddd.* differs from the pinned/);
    expectError({ texts: mutate((a) => { a.edit.target.generationId = "exec-other"; }) }, /edit target generation id exec-other differs from the pinned/);
    expectError({ texts: mutate((a) => { a.edit.target.contentCredentialsTimestamp = "2026-01-01T00:00:00Z"; }) }, /edit target time stamp 2026-01-01T00:00:00Z differs/);
    expectError({ texts: mutate((a) => { a.edit.target.published = true; }) }, /edit target must be recorded as superseded and published: false/);
    expectError({ texts: mutate((a) => { a.edit.target.status = "the reference"; }) }, /edit target must be recorded as superseded/);
    expectError({ texts: mutate((a) => { a.edit.target.node = S.nodes[0].node; }) }, new RegExp(`edit block cites the superseded reference node ${escape(S.nodes[0].node)}`));
    expectError({ texts: mutate((a) => { delete a.edit; }) }, new RegExp(`${escape(name)} must record the pinned precise-object edit ${escape(pin.generationId)}`));
    // The edit target must not be a repository file.
    const self = JSON.parse(JSON.stringify(fixture));
    self.files[name].edit.targetSha256 = fixture.files[first].sha256;
    expectError({ texts: mutate((a) => { a.edit.target.sha256 = fixture.files[first].sha256; }) }, /edit target .* is a pinned file or reference/, self);
    // The set's edits block must list the edit with its target and generation.
    expectError({ texts: editJson(fixture.record, (p) => { delete p.sets[fixture.set].edits.files[name]; return p; }) }, new RegExp(`set ${fixture.set} edits block must list ${escape(name)}`));
    expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].edits.files[name].targetGenerationId = "exec-other"; return p; }) }, new RegExp(`set ${fixture.set} edits block must list ${escape(name)}`));
    // The staged file must carry the same edit.
    expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets.find((e) => e.name === name).edit.generationId = "exec-other"; return p; }) }, /edit generation id exec-other differs from the pinned/);
    expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets.find((e) => e.name === name).edit.kind = "retouch"; return p; }) }, new RegExp(`${escape(name)} edit kind "retouch" differs from the pinned`));
    expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets.find((e) => e.name === name).edit.targetSha256 = "c".repeat(64); return p; }) }, /edit target cccc.* differs from the pinned/);
    expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets.find((e) => e.name === name).edit.prompt = "different"; return p; }) }, /edit prompt differs from the pinned edit/);
    expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets.find((e) => e.name === name).edit.targetGenerationId = "exec-other"; return p; }) }, /edit target generation id exec-other must be/);
    expectError({ texts: editJson(fixture.promptFile, (p) => { delete p.assets.find((e) => e.name === name).edit; return p; }) }, new RegExp(`${escape(name)} must carry the pinned edit`));
  }
  // The set's edits block may list nothing else, and a file without a pinned edit may not record one, in the record or in the staged file.
  const plain = Object.keys(fixture.files).find((n) => !fixture.files[n].edit);
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].edits.files[plain] = { editGenerationId: "exec-x", editTargetSha256: "a".repeat(64) }; return p; }) }, new RegExp(`edits block lists ${escape(plain)}, which has no pinned edit`));
  expectError({ texts: editJson(fixture.record, (p) => { p.assets.find((a) => a.path.endsWith(plain)).edit = { id: "exec-x", prompt: "x" }; return p; }) }, new RegExp(`${escape(plain)} records an edit that is not pinned`));
  expectError({ texts: editJson(fixture.promptFile, (p) => { p.assets.find((e) => e.name === plain).edit = { generationId: "exec-x", prompt: "x" }; return p; }) }, new RegExp(`${escape(plain)} records an edit that is not pinned`));
  // An untracked final edit cannot pass: a new output on disk with a fresh edit block fails on the file hash, the record hash, the edit id and the set block alike, until the pin is changed on purpose.
  const untracked = withEdit(single, (e, entry, record) => {
    entry.sha256 = "b".repeat(64);
    record.sets[fixture.set].edits.files[single].editGenerationId = "exec-new";
    e.target = { ...e.target, sha256: fixture.files[single].sha256, generationId: e.id, contentCredentialsTimestamp: entry.contentCredentials.timestamp };
    e.id = "exec-new";
  }, { staged: (d) => { d.generationId = "exec-new"; d.targetSha256 = fixture.files[single].sha256; d.targetGenerationId = fixture.files[single].edit.generationId; } });
  const u = errorsOf({ texts: untracked.texts, hashes: { [`${fixture.directory}/${single}`]: "b".repeat(64) } }, untracked.fix);
  for (const re of [/sha256 bbbb.* differs from the pinned/, /edit generation id exec-new differs from the pinned/, /edit target sha256 .* differs from the pinned/, /edit target generation id .* differs from the pinned/, /edits block must list/, /is not the pinned file/, /PROMPTS.source.json: .* edit target generation id .* must be/]) assert.ok(u.some((e) => re.test(e)), `untracked edit: expected ${re}, got:\n${u.join("\n")}`);
});

test("a chain's lineage must agree between the record, the staged file, the set block and the pin, and end at the generation", () => {
  const pin = fixture.files[chained].edit;
  const mutate = (fn) => editJson(fixture.record, (p) => { fn(p.assets.find((a) => a.path.endsWith(chained))); return p; });
  expectError({ texts: mutate((a) => { a.edit.lineage = []; }) }, new RegExp(`${escape(chained)} edit lineage records 0 earlier edit\\(s\\), the pin has ${pin.lineage.length}`));
  expectError({ texts: mutate((a) => { a.edit.lineage.push({ ...a.edit.lineage[0], id: "exec-extra" }); }) }, new RegExp(`edit lineage records ${pin.lineage.length + 1} earlier edit\\(s\\), the pin has ${pin.lineage.length}`));
  expectError({ texts: mutate((a) => { a.edit.lineage[0].id = "exec-other"; }) }, /lineage edit 1 generation id exec-other differs from the pinned/);
  expectError({ texts: mutate((a) => { a.edit.lineage[0].prompt += " and a hat"; }) }, /lineage edit 1 prompt differs from the pinned lineage/);
  expectError({ texts: mutate((a) => { a.edit.lineage[0].output.sha256 = "e".repeat(64); }) }, /lineage edit 1 output sha256 eeee.* differs from the pinned/);
  expectError({ texts: mutate((a) => { a.edit.lineage[0].output.published = true; }) }, /lineage edit 1 output must be recorded as superseded and published: false/);
  expectError({ texts: mutate((a) => { a.edit.lineage[0].target.sha256 = "e".repeat(64); }) }, /lineage edit 1 target sha256 eeee.* differs from the pinned/);
  expectError({ texts: mutate((a) => { a.edit.lineage[0].target.generationId = "exec-other"; }) }, /lineage edit 1 target generation id exec-other differs from the pinned/);
  expectError({ texts: mutate((a) => { a.edit.lineage[0].target.contentCredentialsTimestamp = "2026-01-01T00:00:00Z"; }) }, /lineage edit 1 target time stamp 2026-01-01T00:00:00Z differs/);
  expectError({ texts: mutate((a) => { a.edit.lineage[0].status = "current"; }) }, /lineage edit 1 must carry status superseded/);
  // A lineage output may not be a repository file.
  const self = JSON.parse(JSON.stringify(fixture));
  self.files[chained].edit.lineage[0].outputSha256 = fixture.files[first].sha256;
  self.files[chained].edit.targetSha256 = fixture.files[first].sha256;
  expectError({ texts: mutate((a) => { a.edit.lineage[0].output.sha256 = fixture.files[first].sha256; a.edit.target.sha256 = fixture.files[first].sha256; }) }, /lineage edit 1 output .* is a pinned file or reference/, self);
  // The set block lists the chain by id, target and output.
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].edits.files[chained].lineage = []; return p; }) }, new RegExp(`edits block must list ${escape(chained)} .* and the ${pin.lineage.length} earlier edit\\(s\\) of its lineage`));
  expectError({ texts: editJson(fixture.record, (p) => { p.sets[fixture.set].edits.files[chained].lineage[0].outputSha256 = "f".repeat(64); return p; }) }, new RegExp(`edits block must list ${escape(chained)}`));
  // The staged file mirrors the chain.
  const stagedLineage = (fn) => editJson(fixture.promptFile, (p) => { fn(p.assets.find((e) => e.name === chained).edit); return p; });
  expectError({ texts: stagedLineage((d) => { delete d.lineage; }) }, new RegExp(`${escape(chained)} edit lineage records 0 earlier edit\\(s\\), the pin has ${pin.lineage.length}`));
  expectError({ texts: stagedLineage((d) => { d.lineage[0].generationId = "exec-other"; }) }, new RegExp(`${escape(chained)} lineage edit 1 generation id exec-other differs from the pinned`));
  expectError({ texts: stagedLineage((d) => { d.lineage[0].outputSha256 = "f".repeat(64); }) }, /lineage edit 1 output ffff.* differs from the pinned/);
  expectError({ texts: stagedLineage((d) => { d.lineage[0].targetSha256 = "f".repeat(64); }) }, /lineage edit 1 target ffff.* differs from the pinned/);
  expectError({ texts: stagedLineage((d) => { d.lineage[0].targetGenerationId = "exec-other"; }) }, /lineage edit 1 target generation id exec-other differs from the pinned/);
  expectError({ texts: stagedLineage((d) => { d.lineage[0].prompt = "different"; }) }, /lineage edit 1 prompt differs from the pinned lineage/);
  // A single edit may not grow a lineage that is not pinned.
  expectError({ texts: editJson(fixture.record, (p) => { const a = p.assets.find((x) => x.path.endsWith(single)); a.edit.lineage = [{ id: "exec-x", prompt: "x", output: { sha256: "1".repeat(64) }, target: { sha256: "2".repeat(64) } }]; return p; }) }, new RegExp(`${escape(single)} edit lineage records 1 earlier edit\\(s\\), the pin has 0`));
  // The decision record names every pinned edit, every edited file's hash and every lineage edit.
  for (const name of editedFiles) {
    const e = fixture.files[name].edit;
    expectError({ texts: edit(fixture.decision.path, (t) => t.split(e.generationId).join("exec-gone")) }, new RegExp(`must name the pinned edit of ${escape(name)}`));
    expectError({ texts: edit(fixture.decision.path, (t) => t.split(fixture.files[name].sha256).join("")) }, new RegExp(`must name the edited file's hash of ${escape(name)}`));
    for (const l of e.lineage ?? []) expectError({ texts: edit(fixture.decision.path, (t) => t.split(l.generationId).join("exec-gone")) }, new RegExp(`must name lineage edit 1 of ${escape(name)}`));
  }
});

test("a re-pinned edit prompt is held to the core edit contract, the rules of its kind and the negation guards", () => {
  const record = readRecord();
  for (const name of editedFiles) {
    const pin = fixture.files[name].edit;
    const entry = record.assets.find((a) => a.path.endsWith(name));
    const kind = fixture.geometry.editKinds[pin.kind];
    const omitted = (errors, label, what = "edit prompt") => errors.includes(`${fixture.record}: ${name} ${what} omits the geometry requirement ${JSON.stringify(label)}`);
    const avoidOmitted = (errors, label, what = "edit prompt") => errors.includes(`${fixture.record}: ${name} ${what}'s Avoid line does not reject ${JSON.stringify(label).replace(/ rejected"$/, '"')}`);
    for (const req of fixture.geometry.editPromptRequirements) {
      assert.match(entry.edit.prompt, new RegExp(req.pattern, req.flags ?? ""), `${name}: the committed edit prompt states ${req.label}`);
      const { texts, fix } = withEdit(name, (e) => { e.prompt = e.prompt.replace(new RegExp(req.pattern, `g${req.flags ?? ""}`), "[removed]"); });
      const errors = errorsOf({ texts }, fix);
      assert.ok(omitted(errors, req.label), `${name}: expected the omission of ${req.label}, got:\n${errors.join("\n") || "(none)"}`);
      assert.ok(errors.some((e) => e.includes(`${fixture.promptFile}: ${name} edit prompt omits the geometry requirement ${JSON.stringify(req.label)}`)), `staged file: ${req.label}`);
    }
    for (const req of fixture.geometry.editAvoidRequirements) {
      const { texts, fix } = withEdit(name, (e) => { e.prompt = e.prompt.split("\n").map((l) => (l.startsWith("Avoid:") ? l.replace(new RegExp(req.pattern, `g${req.flags ?? ""}`), "[removed]") : l)).join("\n"); });
      assert.ok(avoidOmitted(errorsOf({ texts }, fix), req.label), `${name}: expected the Avoid line to be reported for ${req.label}`);
    }
    for (const req of kind.promptRequirements) {
      assert.match(entry.edit.prompt, new RegExp(req.pattern, req.flags ?? ""), `${name}: the committed ${pin.kind} edit prompt states ${req.label}`);
      const { texts, fix } = withEdit(name, (e) => { e.prompt = e.prompt.replace(new RegExp(req.pattern, `g${req.flags ?? ""}`), "[removed]"); });
      assert.ok(omitted(errorsOf({ texts }, fix), req.label, `${pin.kind} edit prompt`), `${name}: expected the ${pin.kind} omission of ${req.label}`);
    }
    for (const req of kind.avoidRequirements) {
      const { texts, fix } = withEdit(name, (e) => { e.prompt = e.prompt.split("\n").map((l) => (l.startsWith("Avoid:") ? l.replace(new RegExp(req.pattern, `g${req.flags ?? ""}`), "[removed]") : l)).join("\n"); });
      assert.ok(avoidOmitted(errorsOf({ texts }, fix), req.label, `${pin.kind} edit prompt`), `${name}: expected the ${pin.kind} Avoid line to be reported for ${req.label}`);
    }
    // The other kinds' rules are not required of this prompt: re-pinned under another kind, its own rules are reported as missing, which is the point of naming the kind.
    const other = Object.keys(fixture.geometry.editKinds).find((k) => !k.startsWith("$") && k !== pin.kind);
    const swapped = JSON.parse(JSON.stringify(fixture));
    swapped.files[name].edit.kind = other;
    const s = errorsOf({ texts: editJson(fixture.record, (p) => { p.assets.find((a) => a.path.endsWith(name)).edit.kind = other; return p; }) }, swapped);
    assert.ok(s.some((e) => e.includes(`${name} ${other} edit prompt omits the geometry requirement`)), `${name} under kind ${other}:\n${s.join("\n")}`);
    // An edit that asks for an opening, an insert or the geometry in the negative fails like a generation prompt; a removal of those things does not.
    for (const [line, label] of [["Detail: cut a slot into the top of the large cube.", "an opening, aperture, lid, slot, hole, cavity, rim or receptacle requested"], ["Detail: a card emerges from the cube.", "an object entering or emerging from a cube, or a cube that opens"], ["Note: the cubes are not sealed.", "the closed geometry stated in the negative"], ["Detail: flatten the small ones into a thin tile.", "a flat badge, tile or slab requested"]]) {
      const { texts, fix } = withEdit(name, (e) => { e.prompt = `${e.prompt}\n${line}`; });
      expectError({ texts }, new RegExp(`${escape(name)} edit prompt contradicts the closed-cube contract: ${escape(JSON.stringify(label))}`), fix);
    }
    const removal = withEdit(name, (e) => { e.prompt = `${e.prompt}\nDetail: remove any lid, slot, recess or inset from every cube top; delete the seam.`; });
    assert.deepEqual(editErrors(errorsOf({ texts: removal.texts }, removal.fix)), [], `${name}: a removal clause is not a request`);
    // The committed edit prompt, re-pinned unchanged, passes.
    const same = withEdit(name, () => {});
    assert.deepEqual(editErrors(errorsOf({ texts: same.texts }, same.fix)), []);
  }
  // A lineage prompt is held to the core contract: the closed language removed from it is reported for the lineage edit.
  const gone = withEdit(chained, (e) => { e.lineage[0].prompt = e.lineage[0].prompt.replace(/\bclosed\b/gi, "[removed]"); }, { staged: (d) => { d.lineage[0].prompt = d.lineage[0].prompt.replace(/\bclosed\b/gi, "[removed]"); } });
  expectError({ texts: gone.texts }, new RegExp(`${escape(chained)} lineage edit 1 edit prompt omits the geometry requirement "closed"`), gone.fix);
  const opened = withEdit(chained, (e) => { e.lineage[0].prompt = `${e.lineage[0].prompt}\nDetail: a lidded cube.`; }, { staged: (d) => { d.lineage[0].prompt = `${d.lineage[0].prompt}\nDetail: a lidded cube.`; } });
  expectError({ texts: opened.texts }, new RegExp(`${escape(chained)} lineage edit 1 edit prompt contradicts the closed-cube contract`), opened.fix);
  const objectReplacement = editedFiles.find((name) => fixture.files[name].edit.kind === "object-replacement");
  const hiddenKindPositive = withEdit(objectReplacement, (e) => { e.prompt = `${e.prompt.replace(/\bbrand-neutral\b/gi, "[removed]")}\nAvoid: brand-neutral replacements.`; });
  expectError({ texts: hiddenKindPositive.texts }, new RegExp(`${escape(objectReplacement)} object-replacement edit prompt omits the geometry requirement "brand-neutral replacements"`), hiddenKindPositive.fix);
});
