/**
 * The branded-backgrounds lock: every fact about the twelve branded slides-v2 backgrounds that must not
 * drift is pinned in branded-backgrounds.json and compared here with the provenance records, the staged
 * prompt file, the files on disk, the contact sheets, the decision record, the source register and the
 * public wording. Pure: `checkBranded(fixture, io)` reads everything through `io`, so the tests can feed
 * it mutated copies without touching the repository.
 *
 * io.readText(path)          text of a repository file, or null when it does not exist
 * io.sha256(path)            hex SHA-256 of a repository file, or null
 * io.measureZone(path, zone) { mean, deviation } of the luminance inside a fractional zone of a PNG
 * io.listDir(path)           file names in a directory (empty when it does not exist)
 * io.recompose()             [{ path, problem }] from recomposing the contact sheets; problem null when identical
 */
import { createHash } from "node:crypto";

const sha256Text = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const near = (a, b, tolerance) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tolerance;

export function checkBranded(fixture, io) {
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
    } catch (e) {
      errors.push(`${path}: ${e.message}`);
      return null;
    }
  };
  const names = Object.keys(fixture.files);
  const F = fixture.reference;

  // ---- the generated-image record
  const prov = readJson(fixture.record);
  if (prov) {
    const label = fixture.record;
    const set = prov.sets?.[fixture.set];
    if (!set) errors.push(`${label}: no set ${fixture.set}`);
    else {
      if (set.decision !== fixture.decision.path) errors.push(`${label}: set ${fixture.set} must cite ${fixture.decision.path} as its decision`);
      const ref = (set.references ?? [])[0];
      if (!ref) errors.push(`${label}: set ${fixture.set} records no reference input`);
      else {
        for (const [k, want] of [["source", F.locator], ["fileKey", F.fileKey], ["node", F.node], ["status", F.status], ["inputSha256", F.inputSha256], ["published", F.published]]) {
          if (ref[k] !== want) errors.push(`${label}: reference ${k} is ${JSON.stringify(ref[k])}, the pinned value is ${JSON.stringify(want)}`);
        }
      }
      if (set.count !== names.length) errors.push(`${label}: set ${fixture.set} declares ${set.count} files, the pinned selection has ${names.length}`);
    }
    const c = prov.contract ?? {};
    const pins = [
      ["aspectRatio", c.aspectRatio, fixture.contract.aspectRatio],
      ["minWidth", c.minWidth, fixture.contract.minWidth],
      ["minHeight", c.minHeight, fixture.contract.minHeight],
      ["bitDepth", c.bitDepth, fixture.contract.bitDepth],
      ["colourType", c.colourType, fixture.contract.colourType],
      ["alphaChannel", c.alphaChannel, fixture.contract.alphaChannel],
      ["lightRegister.minSafeZoneLuminance", c.lightRegister?.minSafeZoneLuminance, fixture.contract.lightMinSafeZoneLuminance],
      ["darkRegister.maxSafeZoneLuminance", c.darkRegister?.maxSafeZoneLuminance, fixture.contract.darkMaxSafeZoneLuminance],
      ["maxSafeZoneDeviation", c.maxSafeZoneDeviation, fixture.contract.maxSafeZoneDeviation],
    ];
    for (const [k, got, want] of pins) if (got !== want) errors.push(`${label}: contract ${k} is ${JSON.stringify(got)}, the pinned slide contract says ${JSON.stringify(want)}`);
    if (!/not licensed/.test(prov.license ?? "") || !/trademark/.test(prov.license ?? "")) errors.push(`${label}: the licence must state that the embedded UP! mark stays a trademark and is not licensed for extraction`);
    const byName = new Map((prov.assets ?? []).filter((a) => a.set === fixture.set).map((a) => [String(a.path).split("/").pop(), a]));
    for (const name of names) {
      const pin = fixture.files[name];
      const a = byName.get(name);
      if (!a) {
        errors.push(`${label}: no entry for ${name}`);
        continue;
      }
      const at = `${label}: ${name}`;
      if (a.status !== fixture.status) errors.push(`${at} status ${a.status}, expected ${fixture.status}`);
      if (a.sha256 !== pin.sha256) errors.push(`${at} sha256 ${String(a.sha256).slice(0, 12)}... differs from the pinned ${pin.sha256.slice(0, 12)}...`);
      if (a.dimensions !== pin.dimensions) errors.push(`${at} dimensions ${a.dimensions} differ from the pinned ${pin.dimensions}`);
      if (a.contentCredentials?.timestamp !== pin.contentCredentialsTimestamp) errors.push(`${at} content-credentials time stamp ${a.contentCredentials?.timestamp} differs from the pinned ${pin.contentCredentialsTimestamp}`);
      if (a.generation?.id !== pin.generationId) errors.push(`${at} generation id ${a.generation?.id} differs from the pinned ${pin.generationId}`);
      if (typeof a.prompt !== "string" || sha256Text(a.prompt) !== pin.promptSha256) errors.push(`${at} prompt differs from the pinned selection (sha256 ${typeof a.prompt === "string" ? sha256Text(a.prompt).slice(0, 12) : "none"}..., pinned ${pin.promptSha256.slice(0, 12)}...)`);
      if (typeof a.prompt === "string" && !a.prompt.includes(fixture.mark)) errors.push(`${at} prompt does not name the ${fixture.mark} mark`);
      const inputs = a.generation?.inputs ?? [];
      const target = inputs.find((i) => /Image 1/.test(i.role ?? ""));
      const reference = inputs.find((i) => /Image 2/.test(i.role ?? ""));
      if (!target || target.sha256 !== pin.editTargetSha256) errors.push(`${at} must record the former generic file (Image 1) with sha256 ${pin.editTargetSha256.slice(0, 12)}...`);
      if (!reference) errors.push(`${at} must record the UP! box reference (Image 2)`);
      else {
        for (const [k, want] of [["source", F.locator], ["node", F.node], ["inputSha256", F.inputSha256], ["status", F.status], ["published", F.published]]) {
          if (reference[k] !== want) errors.push(`${at} reference ${k} is ${JSON.stringify(reference[k])}, the pinned value is ${JSON.stringify(want)}`);
        }
      }
      if (a.embeddedMarks?.mark !== fixture.mark) errors.push(`${at} must declare the embedded ${fixture.mark} mark`);
      if (a.embeddedMarks?.count !== pin.upBoxes) errors.push(`${at} declares ${a.embeddedMarks?.count} UP! boxes, the pinned count is ${pin.upBoxes}`);
      if (!/not|never/.test(a.embeddedMarks?.rights ?? "")) errors.push(`${at} embeddedMarks.rights must state the extraction restriction`);
      const z = a.safeZone ?? {};
      for (const k of ["x", "y", "width", "height"]) if (z[k] !== pin.safeZone[k]) errors.push(`${at} safe zone ${k} is ${z[k]}, the pinned zone has ${pin.safeZone[k]}`);
      const m = z.measured ?? {};
      if (m.meanLuminance !== pin.safeZone.meanLuminance || m.deviation !== pin.safeZone.deviation) errors.push(`${at} recorded safe-zone measurement ${m.meanLuminance}/${m.deviation} differs from the pinned ${pin.safeZone.meanLuminance}/${pin.safeZone.deviation}`);
      const filePath = `${fixture.directory}/${name}`;
      const actual = io.sha256(filePath);
      if (actual === null) errors.push(`${filePath}: missing`);
      else if (actual !== pin.sha256) errors.push(`${filePath}: sha256 ${actual.slice(0, 12)}... is not the pinned file ${pin.sha256.slice(0, 12)}...`);
      else {
        const live = io.measureZone(filePath, { x: pin.safeZone.x, y: pin.safeZone.y, width: pin.safeZone.width, height: pin.safeZone.height });
        const tol = fixture.contract.measurementTolerance;
        if (!near(live.mean, pin.safeZone.meanLuminance, tol) || !near(live.deviation, pin.safeZone.deviation, tol)) errors.push(`${filePath}: safe zone measures ${live.mean.toFixed(1)}/${live.deviation.toFixed(1)}, the recorded measurement is ${pin.safeZone.meanLuminance}/${pin.safeZone.deviation}`);
      }
    }
    for (const name of byName.keys()) if (!fixture.files[name]) errors.push(`${label}: ${name} is in set ${fixture.set} but not in the pinned selection`);
  }

  // ---- the staged prompt file
  const prompts = readJson(fixture.promptFile);
  if (prompts) {
    const label = fixture.promptFile;
    const entries = new Map((prompts.assets ?? []).map((e) => [e.name, e]));
    for (const name of names) {
      const pin = fixture.files[name];
      const e = entries.get(name);
      if (!e) {
        errors.push(`${label}: no entry for ${name}`);
        continue;
      }
      if (e.generationId !== pin.generationId) errors.push(`${label}: ${name} generation id ${e.generationId} differs from the pinned ${pin.generationId}`);
      if (e.editTargetSha256 !== pin.editTargetSha256) errors.push(`${label}: ${name} edit target ${String(e.editTargetSha256).slice(0, 12)}... differs from the pinned ${pin.editTargetSha256.slice(0, 12)}...`);
      if (typeof e.prompt !== "string" || sha256Text(e.prompt) !== pin.promptSha256) errors.push(`${label}: ${name} prompt differs from the pinned selection`);
    }
    for (const name of entries.keys()) if (!fixture.files[name]) errors.push(`${label}: ${name} has a prompt entry but is not in the pinned selection`);
    const image2 = String(prompts.generation?.image2 ?? "");
    for (const want of [F.fileKey, F.node, F.inputSha256]) if (!image2.includes(want)) errors.push(`${label}: generation.image2 must cite ${want}`);
  }

  // ---- the contact sheets
  const previews = readJson(fixture.previews.record);
  if (previews) {
    const P = fixture.previews;
    const label = P.record;
    if (!/not|never/.test(previews.license ?? "") || !/trademark/.test(previews.license ?? "")) errors.push(`${label}: the licence must carry the embedded-mark restriction of the contact sheets`);
    const byPath = new Map((previews.assets ?? []).map((a) => [a.path, a]));
    for (const [sheet, pin] of Object.entries(P.sheets)) {
      const a = byPath.get(sheet);
      if (!a) {
        errors.push(`${label}: no entry for ${sheet}`);
        continue;
      }
      const at = `${label}: ${sheet}`;
      if (a.sha256 !== pin.sha256) errors.push(`${at} sha256 ${String(a.sha256).slice(0, 12)}... differs from the pinned ${pin.sha256.slice(0, 12)}...`);
      if (a.dimensions !== pin.dimensions) errors.push(`${at} dimensions ${a.dimensions} differ from the pinned ${pin.dimensions}`);
      if (a.composition?.canvas !== P.canvas) errors.push(`${at} canvas ${a.composition?.canvas} is not the pinned ${P.canvas}`);
      if (a.composition?.base) errors.push(`${at} must not declare a base; a contact sheet is composed on the flat canvas`);
      if (!/not|never/.test(a.embeddedMarks ?? "")) errors.push(`${at} must carry an embeddedMarks note with the extraction restriction`);
      const placements = a.composition?.placements ?? [];
      const expected = P.order.map((family, i) => ({ path: `../../generated/backgrounds/slides-v2/${family}-${pin.register}.png`, x: P.positions[i][0], y: P.positions[i][1], width: P.thumbnail.width, height: P.thumbnail.height }));
      if (placements.length !== expected.length) errors.push(`${at} has ${placements.length} placements, the pinned grid has ${expected.length}`);
      expected.forEach((want, i) => {
        const got = placements[i];
        if (!got) return;
        for (const k of ["path", "x", "y", "width", "height"]) if (got[k] !== want[k]) errors.push(`${at} placement ${i + 1} ${k} is ${JSON.stringify(got[k])}, the pinned grid has ${JSON.stringify(want[k])}`);
      });
      const actual = io.sha256(`${P.directory}/${sheet}`);
      if (actual === null) errors.push(`${P.directory}/${sheet}: missing`);
      else if (actual !== pin.sha256) errors.push(`${P.directory}/${sheet}: sha256 ${actual.slice(0, 12)}... is not the pinned file ${pin.sha256.slice(0, 12)}...`);
    }
    for (const [file, sha] of Object.entries(P.untouched ?? {})) {
      const a = byPath.get(file);
      if (!a) errors.push(`${label}: no entry for ${file}`);
      else if (a.sha256 !== sha) errors.push(`${label}: ${file} changed (${String(a.sha256).slice(0, 12)}...); the app showcases are pinned to ${sha.slice(0, 12)}... because their inputs did not change`);
      const actual = io.sha256(`${P.directory}/${file}`);
      if (actual !== null && actual !== sha) errors.push(`${P.directory}/${file}: sha256 ${actual.slice(0, 12)}... is not the pinned ${sha.slice(0, 12)}...`);
    }
    for (const { path, problem } of io.recompose()) if (problem) errors.push(`${P.directory}/${path}: ${problem}`);
  }

  // ---- the decision record and its index
  const decision = io.readText(fixture.decision.path);
  if (decision === null) errors.push(`${fixture.decision.path}: missing`);
  else {
    for (const want of [F.fileKey, F.node, F.inputSha256, ...names, ...(fixture.decisionWording ?? [])]) if (!decision.includes(want)) errors.push(`${fixture.decision.path}: must state ${JSON.stringify(want)}`);
    if (!new RegExp(`^Status:\\s*${fixture.decision.status}\\b`, "m").test(decision)) errors.push(`${fixture.decision.path}: Status line must read ${fixture.decision.status}`);
  }
  const index = io.readText(fixture.decision.index);
  if (index === null) errors.push(`${fixture.decision.index}: missing`);
  else {
    const row = index.split("\n").find((l) => l.includes(fixture.decision.path.split("/").pop()));
    if (!row) errors.push(`${fixture.decision.index}: does not list ${fixture.decision.path}`);
    else if (!row.includes(fixture.decision.status)) errors.push(`${fixture.decision.index}: the row for decision ${fixture.decision.id} must say ${fixture.decision.status}`);
  }

  // ---- the source register
  const sources = readJson(fixture.sources.register);
  if (sources) {
    const board = sources.sources?.[fixture.sources.boardKey];
    if (!board) errors.push(`${fixture.sources.register}: no ${fixture.sources.boardKey}`);
    else if (!(board.identifiers?.readNodes ?? []).includes(F.node)) errors.push(`${fixture.sources.register}: ${fixture.sources.boardKey} must list node ${F.node} (the UP! box reference) among its readNodes`);
    else if (!String(board.notes ?? "").includes(fixture.decision.id)) errors.push(`${fixture.sources.register}: ${fixture.sources.boardKey} notes must cite decision ${fixture.decision.id}`);
    const generated = sources.sources?.[fixture.sources.generatedKey];
    if (!generated) errors.push(`${fixture.sources.register}: no ${fixture.sources.generatedKey}`);
    else if (!String(generated.notes ?? "").includes(fixture.decision.id)) errors.push(`${fixture.sources.register}: ${fixture.sources.generatedKey} notes must cite decision ${fixture.decision.id}`);
  }

  // ---- no mark file anywhere under the logos directory
  const logos = io.listDir(fixture.logosDirectory).filter((n) => n !== "README.md");
  if (logos.length) errors.push(`${fixture.logosDirectory}: contains ${logos.join(", ")}; the repository ships no mark file (the UP! box is depicted only inside the branded backgrounds)`);

  // ---- the safe-zone table in the backgrounds README follows the record
  const readme = io.readText(fixture.readmeTable);
  if (readme === null) errors.push(`${fixture.readmeTable}: missing`);
  else {
    const families = [...new Set(names.map((n) => n.replace(/-(light|dark)\.png$/, "")))];
    for (const family of families) {
      const row = readme.split("\n").find((l) => l.includes(`slides-v2/${family}-*.png`));
      if (!row) {
        errors.push(`${fixture.readmeTable}: no safe-zone row for ${family}`);
        continue;
      }
      const cells = row.split("|").map((c) => c.trim());
      const light = fixture.files[`${family}-light.png`].safeZone;
      const dark = fixture.files[`${family}-dark.png`].safeZone;
      const zone = `${light.x}, ${light.y}, ${light.width}, ${light.height}`;
      if (!cells[4]?.startsWith(zone)) errors.push(`${fixture.readmeTable}: the ${family} row must state the zone ${zone}`);
      const fmt = (z) => `${Math.round(z.meanLuminance)}, deviation ${Math.round(z.deviation)}`;
      if (cells[6] !== fmt(light)) errors.push(`${fixture.readmeTable}: the ${family} row must state the measured light zone as "${fmt(light)}", not "${cells[6]}"`);
      if (cells[7] !== fmt(dark)) errors.push(`${fixture.readmeTable}: the ${family} row must state the measured dark zone as "${fmt(dark)}", not "${cells[7]}"`);
    }
  }

  // ---- public wording that must be present, and claims that must be absent
  let phrases = 0;
  for (const [file, required] of Object.entries(fixture.wording)) {
    const text = io.readText(file);
    if (text === null) {
      errors.push(`${file}: missing`);
      continue;
    }
    for (const phrase of required) {
      phrases++;
      if (!text.includes(phrase)) errors.push(`${file}: must contain ${JSON.stringify(phrase)}`);
    }
  }
  const contra = fixture.contradictions;
  const re = new RegExp(contra.pattern, contra.flags ?? "");
  const scan = (file, lines, offset) => lines.forEach((line, i) => {
    if (re.test(line)) errors.push(`${file}:${offset + i + 1}: claims the backgrounds carry no words, letters, marks or text; the branded slides-v2 files show the UP! mark, so write "no other words, letters or marks" or describe the heroes and title pair without this form`);
  });
  for (const file of contra.files) {
    const text = io.readText(file);
    if (text === null) continue;
    scan(file, text.split("\n"), 0);
  }
  for (const { file, heading } of contra.sections ?? []) {
    const text = io.readText(file);
    if (text === null) continue;
    const lines = text.split("\n");
    const start = lines.findIndex((l) => l.startsWith(heading));
    if (start === -1) {
      errors.push(`${file}: no section ${heading}`);
      continue;
    }
    let end = lines.findIndex((l, i) => i > start && /^## /.test(l));
    if (end === -1) end = lines.length;
    scan(file, lines.slice(start, end), start);
  }
  info.push(`${names.length} branded backgrounds pinned (files, prompts, generation ids, reference, safe zones), ${Object.keys(fixture.previews.sheets).length} contact sheets recomposed, ${phrases} wording phrases in ${Object.keys(fixture.wording).length} documents, decision ${fixture.decision.id} ${fixture.decision.status}`);
  return { errors, info: info.join("; ") };
}
