/**
 * Pure lock for the additive slides-v3-ambient background family. All repository access is supplied
 * through `io`, which keeps the mutation tests fast and lets the live gate use the same PNG reader and
 * contact-sheet composer as the rest of the repository.
 *
 * This lock deliberately does not share the slides-v2 fixture. It reuses the polarity-aware text
 * helpers from branded.mjs and pins the same four closed-cube negation guards, while carrying a
 * separate ambient contract: sparse, edge-biased, low-contrast and subordinate rather than dense hero
 * imagery. Cube counts, occupied-area bounds and subject separation are recorded human review facts;
 * luminance, deviation, PNG headers, C2PA metadata, hashes and gallery pixels are measured by code.
 *
 * io.readText(path)             text or null
 * io.sha256(path)               SHA-256 or null
 * io.listDir(path)              file names, or []
 * io.inspect(path)              PNG/C2PA facts, or null
 * io.measureZone(path, zone)    { mean, deviation }
 * io.recompose(paths)           [{ path, problem, pixelSha256 }]
 */
import { createHash } from "node:crypto";
import { affirmativeText, avoidText } from "./branded.mjs";

const sha256Text = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const near = (a, b, tolerance) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
const jsonEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const rule = (entry) => ({ ...entry, re: new RegExp(entry.pattern, entry.flags ?? "") });
const SCOPES = new Set(["prompt", "affirmative"]);
const EXTRACTION_PERMISSION = /(?:UP!|\bmarks?|\bcubes?)\b[^.;\n]{0,50}\b(?:may|can|could)\s+(?:be\s+)?(?:extract|crop|trace|reuse)\w*\b|\b(?:may|can|could)\s+(?:extract|crop|trace|reuse)\w*\b[^.;\n]{0,50}(?:UP!|\bmarks?|\bcubes?)\b|\b(?:extraction|cropping|tracing|standalone reuse)\b[^.;\n]{0,30}\b(?:allowed|permitted|licensed|authori[sz]ed)\b|\b(?:allow|permit|license|authori[sz]e)\w*\b[^.;\n]{0,40}\b(?:extraction|cropping|tracing|standalone reuse)\b/i;
const CONTRAST_EXTRACTION_PERMISSION = /\b(?:but|however|yet|although|nevertheless)\b[^.;\n]{0,50}\b(?:may|can|could)\s+(?:be\s+)?(?:extract|crop|trace|reuse)\w*\b/i;
const AMBIENT_COMPOSITION_FIELDS = [
  "review",
  "subjectBounds",
  "minSubjectSeparationFraction",
  "aggregateCubeAreaFractionAtMost",
  "decorativeAreaFractionAtMost",
  "visuallyQuietAreaFractionAtLeast",
  "edgeBiased",
  "centred",
];

/** Check one positive/Avoid/forbidden prompt contract with the same polarity model as slides-v2. */
function checkPromptRules(errors, at, prompt, required, avoided, forbidden, kind) {
  if (typeof prompt !== "string") return;
  const promptRequirements = prompt.split("\n").filter((line) => !/^Avoid:/.test(line)).join("\n");
  for (const r of required) {
    const text = r.label === "an Avoid line" ? prompt : r.scope === "affirmative" ? affirmativeText(prompt) : promptRequirements;
    if (!r.re.test(text)) errors.push(`${at} ${kind} omits ${JSON.stringify(r.label)}`);
  }
  const avoid = avoidText(prompt);
  for (const r of avoided) if (!r.re.test(avoid)) errors.push(`${at} ${kind}'s Avoid line does not reject ${JSON.stringify(r.label)}`);
  const affirmative = affirmativeText(prompt);
  for (const r of forbidden) {
    const text = r.scope === "prompt" ? prompt : affirmative;
    if (r.re.test(text)) errors.push(`${at} ${kind} contradicts the ambient closed-cube contract: ${JSON.stringify(r.label)}`);
  }
}

export function checkAmbient(fixture, io) {
  const errors = [];
  const info = [];
  const readJson = (path) => {
    const text = io.readText(path);
    if (text === null) {
      errors.push(`${path}: missing`);
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      errors.push(`${path}: ${error.message}`);
      return null;
    }
  };
  const rejectExtractionPermission = (at, text) => {
    const raw = String(text ?? "");
    const permits = CONTRAST_EXTRACTION_PERMISSION.test(raw) || raw
      .split(/[.;\n]|\b(?:but|however|yet|although|nevertheless)\b/i)
      .some((clause) => EXTRACTION_PERMISSION.test(affirmativeText(clause)));
    if (permits) errors.push(`${at}: contradicts the mark boundary by permitting extraction, cropping, tracing or standalone reuse`);
  };

  const names = Object.keys(fixture.files);
  const families = [...new Set(names.map((name) => name.replace(/-(light|dark)\.png$/, "")))];
  const geometryRequired = (fixture.geometry.promptRequirements ?? []).map(rule);
  const geometryAvoided = (fixture.geometry.avoidRequirements ?? []).map(rule);
  const closedCubeForbidden = (fixture.geometry.promptNegations ?? []).map(rule);
  const ambientRequired = (fixture.ambient.promptRequirements ?? []).map(rule);
  const ambientAvoided = (fixture.ambient.avoidRequirements ?? []).map(rule);
  const ambientForbidden = (fixture.ambient.promptNegations ?? []).map(rule);
  const allRuleLists = [geometryRequired, geometryAvoided, closedCubeForbidden, ambientRequired, ambientAvoided, ambientForbidden];

  // The fixture is executable policy. Duplicate rules, unknown scopes or a malformed selection fail
  // rather than quietly reducing what a same-length list protects.
  for (const list of allRuleLists) {
    const labels = new Set();
    const patterns = new Set();
    for (const r of list) {
      if (labels.has(r.label)) errors.push(`${fixture.fixturePath}: rule ${JSON.stringify(r.label)} is listed twice`);
      if (patterns.has(r.pattern)) errors.push(`${fixture.fixturePath}: rule ${JSON.stringify(r.label)} repeats another rule's pattern`);
      labels.add(r.label);
      patterns.add(r.pattern);
    }
  }
  for (const r of [...geometryRequired, ...ambientRequired, ...closedCubeForbidden, ...ambientForbidden]) if (!SCOPES.has(r.scope)) errors.push(`${fixture.fixturePath}: rule ${JSON.stringify(r.label)} has unknown scope ${JSON.stringify(r.scope)}; use prompt or affirmative`);
  if (names.length !== fixture.contract.fileCount) errors.push(`${fixture.fixturePath}: pins ${names.length} files, contract requires ${fixture.contract.fileCount}`);
  if (families.length !== fixture.contract.pairCount) errors.push(`${fixture.fixturePath}: pins ${families.length} families, contract requires ${fixture.contract.pairCount}`);

  const derivedSetVisualReview = {
    cubeCountTotal: Object.values(fixture.files).reduce((sum, entry) => sum + entry.cubeCount, 0),
    maxAggregateCubeAreaFraction: Math.max(...Object.values(fixture.files).map((entry) => entry.ambientComposition.aggregateCubeAreaFractionAtMost)),
    maxDecorativeAreaFraction: Math.max(...Object.values(fixture.files).map((entry) => entry.ambientComposition.decorativeAreaFractionAtMost)),
    minVisuallyQuietAreaFraction: Math.min(...Object.values(fixture.files).map((entry) => entry.ambientComposition.visuallyQuietAreaFractionAtLeast)),
  };
  if (!jsonEqual(fixture.setVisualReview, derivedSetVisualReview)) errors.push(`${fixture.fixturePath}: setVisualReview ${JSON.stringify(fixture.setVisualReview)} differs from the values derived from files ${JSON.stringify(derivedSetVisualReview)}`);

  const safeRectangle = (zone) => zone && [zone.x, zone.y, zone.width, zone.height].every(Number.isFinite) && zone.x >= 0 && zone.y >= 0 && zone.width > 0 && zone.height > 0 && zone.x + zone.width <= 1.000001 && zone.y + zone.height <= 1.000001;
  const rectanglesOverlap = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  const rectangleSeparation = (a, b) => {
    const dx = Math.max(a.x - (b.x + b.width), b.x - (a.x + a.width), 0);
    const dy = Math.max(a.y - (b.y + b.height), b.y - (a.y + a.height), 0);
    return Math.hypot(dx, dy);
  };
  const largeEnough = (zone) => {
    const minimumSides = zone.width >= fixture.contract.minSafeZoneWidth && zone.height >= fixture.contract.minSafeZoneHeight;
    const centredArea = zone.width * zone.height >= fixture.contract.minCentralSafeZoneArea
      && Math.abs(zone.x + zone.width / 2 - 0.5) <= 0.01
      && Math.abs(zone.y + zone.height / 2 - 0.5) <= 0.01;
    return minimumSides || centredArea;
  };
  for (const name of names) {
    const pin = fixture.files[name];
    const at = `${fixture.fixturePath}: ${name}`;
    if (pin.dimensions !== fixture.contract.dimensions) errors.push(`${at} dimensions ${pin.dimensions} differ from ${fixture.contract.dimensions}`);
    if (!Number.isInteger(pin.cubeCount) || pin.cubeCount < 1 || pin.cubeCount > fixture.contract.maxCubeCount) errors.push(`${at} cube count ${pin.cubeCount} is outside 1..${fixture.contract.maxCubeCount}`);
    if (!safeRectangle(pin.safeZone)) errors.push(`${at} safe zone is not a fractional rectangle inside the canvas`);
    else {
      if (!largeEnough(pin.safeZone)) errors.push(`${at} safe zone is too small or, for the area alternative, not central enough for the ambient copy-area contract`);
      const light = name.endsWith("-light.png");
      if (light && pin.safeZone.meanLuminance < fixture.contract.lightMinSafeZoneLuminance) errors.push(`${at} light safe-zone luminance ${pin.safeZone.meanLuminance} is below ${fixture.contract.lightMinSafeZoneLuminance}`);
      if (!light && pin.safeZone.meanLuminance > fixture.contract.darkMaxSafeZoneLuminance) errors.push(`${at} dark safe-zone luminance ${pin.safeZone.meanLuminance} exceeds ${fixture.contract.darkMaxSafeZoneLuminance}`);
      if (pin.safeZone.deviation > fixture.contract.maxSafeZoneDeviation) errors.push(`${at} safe-zone deviation ${pin.safeZone.deviation} exceeds ${fixture.contract.maxSafeZoneDeviation}`);
    }
    const composition = pin.ambientComposition ?? {};
    const compositionKeys = Object.keys(composition).sort();
    if (!jsonEqual(compositionKeys, [...AMBIENT_COMPOSITION_FIELDS].sort())) errors.push(`${at} ambientComposition fields ${JSON.stringify(compositionKeys)} differ from the exact contract`);
    for (const field of ["visuallyQuietAreaFractionAtLeast", "aggregateCubeAreaFractionAtMost", "decorativeAreaFractionAtMost", "minSubjectSeparationFraction"]) {
      if (!Number.isFinite(composition[field])) errors.push(`${at} ${field} must be a finite number`);
      else if (composition[field] < 0 || composition[field] > 1) errors.push(`${at} ${field} must be between 0 and 1`);
    }
    if (Number.isFinite(composition.visuallyQuietAreaFractionAtLeast) && composition.visuallyQuietAreaFractionAtLeast < fixture.contract.minVisuallyQuietAreaFraction) errors.push(`${at} visually quiet area ${composition.visuallyQuietAreaFractionAtLeast} is below ${fixture.contract.minVisuallyQuietAreaFraction}`);
    if (Number.isFinite(composition.aggregateCubeAreaFractionAtMost) && composition.aggregateCubeAreaFractionAtMost > fixture.contract.maxAggregateCubeAreaFraction) errors.push(`${at} aggregate cube area ${composition.aggregateCubeAreaFractionAtMost} exceeds ${fixture.contract.maxAggregateCubeAreaFraction}`);
    if (Number.isFinite(composition.decorativeAreaFractionAtMost) && composition.decorativeAreaFractionAtMost > fixture.contract.maxDecorativeAreaFraction) errors.push(`${at} decorative area ${composition.decorativeAreaFractionAtMost} exceeds ${fixture.contract.maxDecorativeAreaFraction}`);
    if (composition.edgeBiased !== true) errors.push(`${at} ambient composition must remain edge-biased`);
    if (composition.centred !== false) errors.push(`${at} ambient composition must record that the cubes are not centred`);
    if (Number.isFinite(composition.minSubjectSeparationFraction) && composition.minSubjectSeparationFraction < fixture.contract.minSubjectSeparationFraction) errors.push(`${at} subject separation ${composition.minSubjectSeparationFraction} is below ${fixture.contract.minSubjectSeparationFraction}`);
    if (!/full-resolution visual review/i.test(composition.review ?? "") || !/not automated segmentation/i.test(composition.review ?? "")) errors.push(`${at} ambient composition review must state full-resolution visual review, not automated segmentation`);
    if (!Array.isArray(composition.subjectBounds) || composition.subjectBounds.length !== pin.cubeCount) errors.push(`${at} must pin one subject bound per cube (${pin.cubeCount})`);
    else for (const [index, bounds] of composition.subjectBounds.entries()) {
      if (!safeRectangle(bounds)) errors.push(`${at} subject bound ${index + 1} is not a fractional rectangle inside the canvas`);
      else if (safeRectangle(pin.safeZone) && rectanglesOverlap(bounds, pin.safeZone)) errors.push(`${at} subject bound ${index + 1} enters the safe zone`);
      else if (safeRectangle(pin.safeZone) && rectangleSeparation(bounds, pin.safeZone) + 1e-9 < composition.minSubjectSeparationFraction) errors.push(`${at} subject bound ${index + 1} is separated from the safe zone by ${rectangleSeparation(bounds, pin.safeZone).toFixed(3)}, below ${composition.minSubjectSeparationFraction}`);
    }
    for (const ref of pin.references ?? []) if (!fixture.references.files[pin.referenceResolution?.[ref] ?? ref]) errors.push(`${at} cites unpinned reference ${ref}`);
  }
  for (const family of families) {
    const light = fixture.files[`${family}-light.png`];
    const dark = fixture.files[`${family}-dark.png`];
    if (!light || !dark) {
      errors.push(`${fixture.fixturePath}: family ${family} does not have exactly one light and one dark pin`);
      continue;
    }
    for (const key of ["x", "y", "width", "height"]) if (light.safeZone[key] !== dark.safeZone[key]) errors.push(`${fixture.fixturePath}: ${family} light and dark safe zones differ at ${key}`);
    if (!jsonEqual(light.ambientComposition, dark.ambientComposition)) errors.push(`${fixture.fixturePath}: ${family} light and dark ambient composition pins differ`);
  }

  // Exact on-disk selection. PROMPTS.source.json is the sole allowed sidecar in the family directory.
  const actualDirectory = [...io.listDir(fixture.directory)].sort();
  const expectedDirectory = [...fixture.directoryFiles].sort();
  for (const name of expectedDirectory) if (!actualDirectory.includes(name)) errors.push(`${fixture.directory}: missing pinned directory file ${name}`);
  for (const name of actualDirectory) if (!expectedDirectory.includes(name)) errors.push(`${fixture.directory}: unpinned file ${name}`);

  const refMeta = (pin, label) => fixture.references.files[pin.referenceResolution?.[label] ?? label];
  const checkReference = (at, got, want, { requireLabel = false, allowedExtraKeys = [] } = {}) => {
    if (!got || typeof got !== "object") {
      errors.push(`${at}: reference is not recorded`);
      return;
    }
    for (const key of ["sha256", "source", "status", "published"]) if (got[key] !== want[key]) errors.push(`${at}: reference ${key} is ${JSON.stringify(got[key])}, expected ${JSON.stringify(want[key])}`);
    const hashOnly = want.status === "superseded" || /\(hash only\)$/.test(String(want.label ?? ""));
    if (hashOnly && want.published !== false) {
      errors.push(`${at}: hash-only reference must remain published: false`);
    } else if (typeof want.published !== "boolean") {
      errors.push(`${at}: pinned reference published must be boolean, got ${JSON.stringify(want.published)}`);
    } else if (!hashOnly && want.published === true) {
      if (got.path !== want.path) errors.push(`${at}: reference path is ${JSON.stringify(got.path)}, expected ${JSON.stringify(want.path)}`);
    } else {
      const allowed = new Set(["sha256", "source", "status", "published", ...allowedExtraKeys, ...(requireLabel ? ["label"] : [])]);
      const extras = Object.keys(got).filter((key) => !allowed.has(key));
      if (extras.length) errors.push(`${at}: unpublished superseded reference must be hash-only; unexpected field(s): ${extras.join(", ")}`);
      if (got.note !== undefined && typeof got.note !== "string") errors.push(`${at}: unpublished superseded reference note must be plain text`);
    }
    if (requireLabel && got.label !== want.label) errors.push(`${at}: reference label is ${JSON.stringify(got.label)}, expected ${JSON.stringify(want.label)}`);
  };

  // Every published reference is itself pinned to the live repository bytes. The one superseded draft
  // is deliberately hash-only and must not acquire a path.
  for (const [key, ref] of Object.entries(fixture.references.files)) {
    const hashOnly = ref.status === "superseded" || /\(hash only\)$/.test(key);
    if (hashOnly && ref.published !== false) {
      errors.push(`${fixture.fixturePath}: hash-only reference ${key} must remain published: false`);
    } else if (typeof ref.published !== "boolean") {
      errors.push(`${fixture.fixturePath}: reference ${key} published must be boolean, got ${JSON.stringify(ref.published)}`);
    } else if (!hashOnly && ref.published === true) {
      const actual = io.sha256(ref.path);
      if (actual === null) errors.push(`${ref.path}: missing ambient generation reference ${key}`);
      else if (actual !== ref.sha256) errors.push(`${ref.path}: reference hash ${actual.slice(0, 12)}... differs from ${ref.sha256.slice(0, 12)}...`);
    } else {
      const allowed = new Set(["sha256", "source", "status", "published"]);
      const extras = Object.keys(ref).filter((field) => !allowed.has(field));
      if (extras.length) errors.push(`${fixture.fixturePath}: superseded reference ${key} must remain hash-only; unexpected field(s): ${extras.join(", ")}`);
    }
  }

  const checkPrompt = (at, prompt) => {
    checkPromptRules(errors, at, prompt, geometryRequired, geometryAvoided, closedCubeForbidden, "prompt");
    checkPromptRules(errors, at, prompt, ambientRequired, ambientAvoided, ambientForbidden, "prompt");
    const affirmative = affirmativeText(prompt ?? "");
    if (fixture.ambient.moreThanTwoCubes && new RegExp(fixture.ambient.moreThanTwoCubes.pattern, fixture.ambient.moreThanTwoCubes.flags ?? "").test(affirmative)) errors.push(`${at} prompt requests more than two UP! cubes`);
  };

  // Generated-image record: set-level contract and review, then every per-file fact and live file.
  const prov = readJson(fixture.record);
  if (prov) {
    const set = prov.sets?.[fixture.set];
    if (!set) errors.push(`${fixture.record}: no set ${fixture.set}`);
    else {
      const at = `${fixture.record}: set ${fixture.set}`;
      if (set.brief !== fixture.brief) errors.push(`${at} brief is ${JSON.stringify(set.brief)}, expected ${fixture.brief}`);
      if (set.status !== fixture.status) errors.push(`${at} status is ${JSON.stringify(set.status)}, expected ${fixture.status}`);
      if (set.count !== names.length) errors.push(`${at} declares ${set.count} files, fixture pins ${names.length}`);
      if (!jsonEqual(set.families, fixture.familyOrder)) errors.push(`${at} family order differs from the pinned six-family order`);
      if (set.decision !== fixture.decision.path) errors.push(`${at} must cite ${fixture.decision.path}`);
      const c = set.contract ?? {};
      const contractPins = [
        ["dimensions", c.dimensions, fixture.contract.dimensions], ["bitDepth", c.bitDepth, fixture.contract.bitDepth], ["colourType", c.colourType, fixture.contract.colourType], ["alphaChannel", c.alphaChannel, fixture.contract.alphaChannel], ["pairs", c.pairs, fixture.contract.pairCount],
        ["lightMinSafeZoneLuminance", c.lightMinSafeZoneLuminance, fixture.contract.lightMinSafeZoneLuminance], ["darkMaxSafeZoneLuminance", c.darkMaxSafeZoneLuminance, fixture.contract.darkMaxSafeZoneLuminance], ["maxSafeZoneDeviation", c.maxSafeZoneDeviation, fixture.contract.maxSafeZoneDeviation], ["maxCubes", c.maxCubes, fixture.contract.maxCubeCount],
        ["maxAggregateCubeAreaFraction", c.maxAggregateCubeAreaFraction, fixture.contract.maxAggregateCubeAreaFraction], ["maxDecorativeAreaFraction", c.maxDecorativeAreaFraction, fixture.contract.maxDecorativeAreaFraction], ["minVisuallyQuietAreaFraction", c.minVisuallyQuietAreaFraction, fixture.contract.minVisuallyQuietAreaFraction], ["minSubjectSeparationFraction", c.minSubjectSeparationFraction, fixture.contract.minSubjectSeparationFraction],
      ];
      for (const [key, got, want] of contractPins) if (got !== want) errors.push(`${at} contract ${key} is ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
      const vr = set.visualReview ?? {};
      for (const [key, want] of Object.entries(fixture.setVisualReview)) if (vr[key] !== want) errors.push(`${at} visualReview.${key} is ${JSON.stringify(vr[key])}, expected ${JSON.stringify(want)}`);
      if (!/human|manual/i.test(vr.method ?? "") || !/not claims? of automated|not pixel|not automated/i.test(vr.method ?? "")) errors.push(`${at} visual review must distinguish human review from automated pixel recognition`);
      const referenceEntries = set.references ?? [];
      const refs = new Map(referenceEntries.map((entry) => [entry.label, entry]));
      if (referenceEntries.length !== Object.keys(fixture.references.files).length || refs.size !== referenceEntries.length) errors.push(`${at} must list exactly ${Object.keys(fixture.references.files).length} uniquely labelled references`);
      for (const [key, want] of Object.entries(fixture.references.files)) {
        const got = refs.get(key);
        if (!got) errors.push(`${at} does not list reference ${key}`);
        else checkReference(`${at} ${key}`, got, { label: key, ...want }, { requireLabel: true, allowedExtraKeys: ["note"] });
      }
      for (const key of refs.keys()) if (!fixture.references.files[key]) errors.push(`${at} lists unpinned reference ${key}`);
      rejectExtractionPermission(`${at} embeddedMarks`, set.embeddedMarks);
    }

    const selectedAssets = (prov.assets ?? []).filter((asset) => asset.set === fixture.set);
    const selected = new Map(selectedAssets.map((asset) => [String(asset.path).split("/").pop(), asset]));
    if (selectedAssets.length !== names.length || selected.size !== selectedAssets.length) errors.push(`${fixture.record}: set ${fixture.set} must contain exactly ${names.length} uniquely named assets`);
    for (const name of names) {
      const pin = fixture.files[name];
      const asset = selected.get(name);
      if (!asset) {
        errors.push(`${fixture.record}: no ${fixture.set} entry for ${name}`);
        continue;
      }
      const at = `${fixture.record}: ${name}`;
      const family = name.replace(/-(light|dark)\.png$/, "");
      const register = name.match(/-(light|dark)\.png$/)?.[1];
      for (const [key, want] of [["path", `${fixture.recordDirectory}/${name}`], ["set", fixture.set], ["family", family], ["register", register], ["status", fixture.status], ["sha256", pin.sha256], ["dimensions", pin.dimensions]]) if (asset[key] !== want) errors.push(`${at} ${key} is ${JSON.stringify(asset[key])}, expected ${JSON.stringify(want)}`);
      if (!String(asset.brief ?? "").startsWith(fixture.brief)) errors.push(`${at} brief ${JSON.stringify(asset.brief)} does not cite ${fixture.brief}`);
      if (asset.generation?.id !== pin.generationId) errors.push(`${at} generation id ${asset.generation?.id} differs from ${pin.generationId}`);
      if (typeof asset.prompt !== "string" || sha256Text(asset.prompt) !== pin.promptSha256) errors.push(`${at} prompt differs from the pinned verbatim prompt`);
      checkPrompt(at, asset.prompt);
      if (asset.edit !== undefined) errors.push(`${at} records an unpinned edit; every ambient file is used as delivered`);
      if (asset.contentCredentials?.timestamp !== pin.contentCredentialsTimestamp) errors.push(`${at} C2PA timestamp ${asset.contentCredentials?.timestamp} differs from ${pin.contentCredentialsTimestamp}`);
      if (asset.embeddedMarks?.mark !== fixture.mark || asset.embeddedMarks?.count !== pin.cubeCount) errors.push(`${at} embedded mark/count must be ${fixture.mark}/${pin.cubeCount}`);
      if (!/not licensed|not extraction|may not|never/i.test(asset.embeddedMarks?.rights ?? "")) errors.push(`${at} embeddedMarks.rights must carry the extraction restriction`);
      rejectExtractionPermission(`${at} embeddedMarks.rights`, asset.embeddedMarks?.rights);
      const zone = asset.safeZone ?? {};
      for (const key of ["x", "y", "width", "height"]) if (zone[key] !== pin.safeZone[key]) errors.push(`${at} safeZone.${key} is ${zone[key]}, expected ${pin.safeZone[key]}`);
      if (zone.measured?.meanLuminance !== pin.safeZone.meanLuminance || zone.measured?.deviation !== pin.safeZone.deviation) errors.push(`${at} recorded safe-zone measurement ${zone.measured?.meanLuminance}/${zone.measured?.deviation} differs from ${pin.safeZone.meanLuminance}/${pin.safeZone.deviation}`);
      const composition = asset.ambientComposition ?? {};
      if (!jsonEqual(Object.keys(composition).sort(), [...AMBIENT_COMPOSITION_FIELDS].sort())) errors.push(`${at} ambientComposition fields differ from the exact contract`);
      for (const key of AMBIENT_COMPOSITION_FIELDS) if (!jsonEqual(composition[key], pin.ambientComposition[key])) errors.push(`${at} ambientComposition.${key} is ${JSON.stringify(composition[key])}, expected ${JSON.stringify(pin.ambientComposition[key])}`);
      const inputs = Array.isArray(asset.generation?.inputs) ? asset.generation.inputs : [];
      if (inputs.length !== pin.references.length) errors.push(`${at} has ${inputs.length} generation inputs, expected ${pin.references.length}`);
      pin.references.forEach((label, index) => checkReference(`${at} generation input ${index + 1}`, inputs[index], { label, ...refMeta(pin, label) }, { requireLabel: true, allowedExtraKeys: ["role", "note"] }));

      const filePath = `${fixture.directory}/${name}`;
      const actual = io.sha256(filePath);
      if (actual === null) errors.push(`${filePath}: missing`);
      else if (actual !== pin.sha256) errors.push(`${filePath}: hash ${actual.slice(0, 12)}... differs from pinned ${pin.sha256.slice(0, 12)}...`);
      else {
        const inspected = io.inspect(filePath);
        if (!inspected) errors.push(`${filePath}: cannot be inspected as a PNG`);
        else {
          if (inspected.dimensions !== pin.dimensions) errors.push(`${filePath}: dimensions ${inspected.dimensions} differ from ${pin.dimensions}`);
          if (inspected.bitDepth !== fixture.contract.bitDepth || inspected.colourType !== fixture.contract.colourType || inspected.canBeTransparent !== fixture.contract.alphaChannel) errors.push(`${filePath}: PNG header is ${inspected.bitDepth}-bit ${inspected.colourType}, transparency ${inspected.canBeTransparent}; expected opaque ${fixture.contract.bitDepth}-bit ${fixture.contract.colourType}`);
          const cc = inspected.contentCredentials ?? {};
          if (cc.c2pa !== true) errors.push(`${filePath}: C2PA caBX manifest is missing or unrecognized`);
          for (const key of ["specVersion", "softwareAgent", "claimGenerator", "signer"]) if (cc[key] !== fixture.contract.contentCredentials[key]) errors.push(`${filePath}: C2PA ${key} is ${JSON.stringify(cc[key])}, expected ${JSON.stringify(fixture.contract.contentCredentials[key])}`);
          if (!jsonEqual(cc.actions, fixture.contract.contentCredentials.actions)) errors.push(`${filePath}: C2PA actions ${JSON.stringify(cc.actions)} differ from the pinned actions`);
          if (cc.timestamp !== pin.contentCredentialsTimestamp) errors.push(`${filePath}: live C2PA timestamp ${cc.timestamp} differs from ${pin.contentCredentialsTimestamp}`);
        }
        const measured = io.measureZone(filePath, { x: pin.safeZone.x, y: pin.safeZone.y, width: pin.safeZone.width, height: pin.safeZone.height });
        if (!near(measured.mean, pin.safeZone.meanLuminance, fixture.contract.measurementTolerance) || !near(measured.deviation, pin.safeZone.deviation, fixture.contract.measurementTolerance)) errors.push(`${filePath}: safe zone measures ${Number(measured.mean).toFixed(1)}/${Number(measured.deviation).toFixed(1)}, expected ${pin.safeZone.meanLuminance}/${pin.safeZone.deviation}`);
      }
    }
    for (const name of selected.keys()) if (!fixture.files[name]) errors.push(`${fixture.record}: unpinned file ${name} is in set ${fixture.set}`);
  }

  // Verbatim staged prompts and the reference-resolution exception for the left-dark companion.
  const staged = readJson(fixture.promptFile);
  if (staged) {
    if (staged.status !== fixture.status) errors.push(`${fixture.promptFile}: status is ${JSON.stringify(staged.status)}, expected ${fixture.status}`);
    const stagedAssets = staged.assets ?? [];
    const entries = new Map(stagedAssets.map((entry) => [entry.name, entry]));
    if (stagedAssets.length !== names.length || entries.size !== stagedAssets.length) errors.push(`${fixture.promptFile}: must contain exactly ${names.length} uniquely named prompt entries`);
    for (const name of names) {
      const pin = fixture.files[name];
      const entry = entries.get(name);
      if (!entry) {
        errors.push(`${fixture.promptFile}: no entry for ${name}`);
        continue;
      }
      const at = `${fixture.promptFile}: ${name}`;
      if (entry.generationId !== pin.generationId) errors.push(`${at} generation id ${entry.generationId} differs from ${pin.generationId}`);
      if (!jsonEqual(entry.references, pin.references)) errors.push(`${at} references ${JSON.stringify(entry.references)} differ from ${JSON.stringify(pin.references)}`);
      if (!jsonEqual(entry.referenceResolution, pin.referenceResolutionText)) errors.push(`${at} historical reference resolution differs from the pinned resolution`);
      if (typeof entry.prompt !== "string" || sha256Text(entry.prompt) !== pin.promptSha256) errors.push(`${at} prompt differs from the pinned verbatim prompt`);
      checkPrompt(at, entry.prompt);
      if (entry.edit !== undefined) errors.push(`${at} records an unpinned edit`);
    }
    for (const name of entries.keys()) if (!fixture.files[name]) errors.push(`${fixture.promptFile}: unpinned prompt entry ${name}`);
    const refs = staged.generation?.references ?? {};
    for (const [key, want] of Object.entries(fixture.references.files)) {
      if (!refs[key]) errors.push(`${fixture.promptFile}: generation.references lacks ${key}`);
      else checkReference(`${fixture.promptFile}: generation.references.${key}`, refs[key], want, { allowedExtraKeys: ["note"] });
    }
    for (const key of Object.keys(refs)) if (!fixture.references.files[key]) errors.push(`${fixture.promptFile}: generation.references has unpinned key ${key}`);
    for (const phrase of fixture.references.lineagePhrases) if (!String(staged.generation?.referenceLineage ?? "").includes(phrase)) errors.push(`${fixture.promptFile}: generation.referenceLineage must state ${JSON.stringify(phrase)}`);
    for (const phrase of fixture.authorizationPhrases) if (!String(staged.generation?.authorization ?? "").includes(phrase)) errors.push(`${fixture.promptFile}: generation.authorization must state ${JSON.stringify(phrase)}`);
  }

  // Deterministic overview sheets: pinned record, grid, bytes and recomposed RGB pixels.
  const previews = readJson(fixture.previews.record);
  if (previews) {
    if (previews.status !== fixture.status) errors.push(`${fixture.previews.record}: status is ${JSON.stringify(previews.status)}, expected ${fixture.status}`);
    rejectExtractionPermission(`${fixture.previews.record}: license`, previews.license);
    const byPath = new Map((previews.assets ?? []).map((asset) => [asset.path, asset]));
    const ambientPreviewEntries = (previews.assets ?? []).filter((asset) => asset.path?.startsWith("ambient-backgrounds-") || (asset.composition?.placements ?? []).some((placement) => String(placement.path).includes("/slides-v3-ambient/")));
    if (ambientPreviewEntries.length !== Object.keys(fixture.previews.sheets).length || new Set(ambientPreviewEntries.map((asset) => asset.path)).size !== ambientPreviewEntries.length) errors.push(`${fixture.previews.record}: must contain exactly ${Object.keys(fixture.previews.sheets).length} uniquely named ambient preview entries`);
    const expectedPreviewFiles = Object.keys(fixture.previews.sheets).sort();
    const actualPreviewFiles = io.listDir(fixture.previews.directory).filter((name) => /^ambient-backgrounds-.*\.png$/.test(name)).sort();
    for (const name of expectedPreviewFiles) if (!actualPreviewFiles.includes(name)) errors.push(`${fixture.previews.directory}: missing pinned ambient preview ${name}`);
    for (const name of actualPreviewFiles) if (!expectedPreviewFiles.includes(name)) errors.push(`${fixture.previews.directory}: unpinned ambient preview file ${name}`);
    for (const [sheet, pin] of Object.entries(fixture.previews.sheets)) {
      const asset = byPath.get(sheet);
      if (!asset) {
        errors.push(`${fixture.previews.record}: no entry for ${sheet}`);
        continue;
      }
      const at = `${fixture.previews.record}: ${sheet}`;
      if (asset.sha256 !== pin.sha256 || asset.dimensions !== pin.dimensions) errors.push(`${at} hash/dimensions differ from the pinned ${pin.sha256}/${pin.dimensions}`);
      if (asset.status !== fixture.status) errors.push(`${at} status is ${JSON.stringify(asset.status)}, expected ${fixture.status}`);
      if (asset.composition?.canvas !== fixture.previews.canvas) errors.push(`${at} canvas ${asset.composition?.canvas} differs from ${fixture.previews.canvas}`);
      if (asset.composition?.pixelSha256 !== pin.pixelSha256) errors.push(`${at} composition.pixelSha256 differs from the pinned RGB pixels`);
      if (!/not licensed|may not|never/i.test(asset.embeddedMarks ?? "")) errors.push(`${at} embeddedMarks must carry the extraction restriction`);
      rejectExtractionPermission(`${at} embeddedMarks`, asset.embeddedMarks);
      const expected = fixture.previews.order.map((family, index) => ({ path: `../../generated/backgrounds/slides-v3-ambient/${family}-${pin.register}.png`, x: fixture.previews.positions[index][0], y: fixture.previews.positions[index][1], width: fixture.previews.thumbnail.width, height: fixture.previews.thumbnail.height }));
      const got = asset.composition?.placements ?? [];
      if (!jsonEqual(got, expected)) errors.push(`${at} placements differ from the pinned ambient order/grid`);
      const actual = io.sha256(`${fixture.previews.directory}/${sheet}`);
      if (actual === null) errors.push(`${fixture.previews.directory}/${sheet}: missing`);
      else if (actual !== pin.sha256) errors.push(`${fixture.previews.directory}/${sheet}: hash ${actual.slice(0, 12)}... differs from ${pin.sha256.slice(0, 12)}...`);
    }
    for (const asset of previews.assets ?? []) {
      const usesAmbient = asset.path?.startsWith("ambient-backgrounds-") || (asset.composition?.placements ?? []).some((placement) => String(placement.path).includes("/slides-v3-ambient/"));
      if (usesAmbient && !fixture.previews.sheets[asset.path]) errors.push(`${fixture.previews.record}: unpinned ambient preview ${asset.path}`);
    }
    const expectedPaths = Object.keys(fixture.previews.sheets);
    const results = io.recompose(expectedPaths);
    for (const sheet of expectedPaths) {
      const result = results.find((entry) => entry.path === sheet);
      if (!result) errors.push(`${fixture.previews.directory}/${sheet}: no recomposition result`);
      else {
        if (result.problem) errors.push(`${fixture.previews.directory}/${sheet}: ${result.problem}`);
        if (result.pixelSha256 !== fixture.previews.sheets[sheet].pixelSha256) errors.push(`${fixture.previews.directory}/${sheet}: recomposed RGB pixel hash ${result.pixelSha256} differs from the pin`);
      }
    }
  }

  // Galleries, safe-zone table, decision, source register and public-language pins.
  for (const [file, images] of Object.entries(fixture.galleries)) {
    const text = io.readText(file);
    if (text === null) {
      errors.push(`${file}: missing`);
      continue;
    }
    for (const image of images) if (!text.includes(image)) errors.push(`${file}: gallery does not show ${image}`);
  }
  const table = io.readText(fixture.readmeTable);
  if (table === null) errors.push(`${fixture.readmeTable}: missing`);
  else for (const family of families) {
    const row = table.split("\n").find((line) => line.includes(`slides-v3-ambient/${family}-*.png`));
    if (!row) {
      errors.push(`${fixture.readmeTable}: no ambient safe-zone row for ${family}`);
      continue;
    }
    const light = fixture.files[`${family}-light.png`].safeZone;
    const dark = fixture.files[`${family}-dark.png`].safeZone;
    for (const phrase of [`${light.x}, ${light.y}, ${light.width}, ${light.height}`, `${light.meanLuminance.toFixed(1)}, deviation ${light.deviation.toFixed(1)}`, `${dark.meanLuminance.toFixed(1)}, deviation ${dark.deviation.toFixed(1)}`]) if (!row.includes(phrase)) errors.push(`${fixture.readmeTable}: ${family} row must contain ${JSON.stringify(phrase)}`);
  }

  const decisionText = io.readText(fixture.decision.path);
  if (decisionText === null) errors.push(`${fixture.decision.path}: missing`);
  else {
    if (!new RegExp(`^Status:\\s*${fixture.decision.status}\\b`, "m").test(decisionText)) errors.push(`${fixture.decision.path}: Status line must read ${fixture.decision.status}`);
    for (const phrase of fixture.decision.phrases) if (!decisionText.includes(phrase)) errors.push(`${fixture.decision.path}: must state ${JSON.stringify(phrase)}`);
    if (new RegExp(fixture.decision.privateIdentifierPattern, fixture.decision.privateIdentifierFlags ?? "").test(decisionText)) errors.push(`${fixture.decision.path}: exposes a private conversation or message identifier; cite the owner authorization by date only`);
    rejectExtractionPermission(fixture.decision.path, decisionText);
  }
  const index = io.readText(fixture.decision.index);
  if (index === null) errors.push(`${fixture.decision.index}: missing`);
  else {
    const row = index.split("\n").find((line) => line.includes(fixture.decision.path.split("/").pop()));
    if (!row || !row.includes(fixture.decision.status)) errors.push(`${fixture.decision.index}: decision ${fixture.decision.id} must be listed as ${fixture.decision.status}`);
  }
  const sources = readJson(fixture.sources.register);
  if (sources) {
    const source = sources.sources?.[fixture.sources.generatedKey];
    if (!source) errors.push(`${fixture.sources.register}: no ${fixture.sources.generatedKey}`);
    else for (const phrase of fixture.sources.phrases) if (!String(source.notes ?? "").includes(phrase)) errors.push(`${fixture.sources.register}: ${fixture.sources.generatedKey} notes must state ${JSON.stringify(phrase)}`);
  }
  for (const [file, phrases] of Object.entries(fixture.wording)) {
    const text = io.readText(file);
    if (text === null) {
      errors.push(`${file}: missing`);
      continue;
    }
    for (const phrase of phrases) if (!text.includes(phrase)) errors.push(`${file}: must contain ${JSON.stringify(phrase)}`);
    rejectExtractionPermission(file, text);
  }

  info.push(`${names.length} ambient backgrounds pinned in ${families.length} light/dark pairs; exact files, prompts, ids, references, cube counts, C2PA and safe zones; ${Object.keys(fixture.previews.sheets).length} overview sheets pinned and recomposed; decision ${fixture.decision.id} ${fixture.decision.status}`);
  return { errors, info: info.join("; ") };
}
