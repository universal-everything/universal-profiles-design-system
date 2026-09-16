/**
 * The branded-backgrounds lock: every fact about the twelve branded slides-v2 backgrounds that must not
 * drift is pinned in branded-backgrounds.json and compared here with the provenance records, the staged
 * prompt file, the files on disk (hash, header facts, safe-zone luminance), the public onboarding
 * illustrations the generator received as references, the contact sheets, the decision record and its
 * predecessor, the source register, the galleries and the public wording. Since decision 0013 the lock
 * also carries the closed-cube geometry contract, a keyword and pattern gate over the prompt text checked
 * polarity-aware: every pinned prompt must state the closed geometry in the positive whatever its hash, its
 * Avoid line must reject the openings, the inserts and the protrusions, and no prompt may state the closed
 * geometry in the negative or ask, in its affirmative text, for a listed opening, insert, object entering or
 * emerging, or flat form (an Avoid clause, the negated part of a clause or a removal clause is not a request
 * for it). It matches words and phrases; it cannot read the pixels and it is not a proof of what a file
 * shows. A file may be a pinned precise-object edit of its own generation output, directly or through a
 * chain of edits: then the final edit's generation id, its kind, its verbatim prompt (held to the edit-prompt
 * contract: a precise-object edit, the closed geometry and the closed or sealed cube tops as invariants, the
 * UP! cubes named and their lettering preserved, only the named region edited, no new text, no watermark, an
 * Avoid line rejecting openings and inserts on or from a cube, plus the rules of its kind) and its target by
 * hash must agree between the record, the staged file and the pin; every earlier edit of the chain is pinned
 * as superseded lineage (id, prompt hash, output and target by hash and time stamp) and must terminate at the
 * entry's own generation output; an unpinned edit or lineage entry is rejected, and the decision record
 * must name every pinned edit. The requirements stay distinct (the tests pin them literally), the listed
 * documents must state the contract, the superseded board exports may be named only as superseded, and no
 * document may describe the depicted object in the flat-badge or the open-receptacle form. Pure:
 * `checkBranded(fixture, io)` reads everything through `io`, so the tests can feed it mutated copies
 * without touching the repository.
 *
 * io.readText(path)          text of a repository file, or null when it does not exist
 * io.sha256(path)            hex SHA-256 of a repository file, or null
 * io.inspect(path)           { dimensions, bitDepth, colourType, canBeTransparent } from the PNG header, or null
 * io.measureZone(path, zone) { mean, deviation } of the luminance inside a fractional zone of a PNG
 * io.listDir(path)           file names in a directory (empty when it does not exist)
 * io.recompose()             [{ path, problem }] from recomposing the contact sheets; problem null when identical
 */
import { createHash } from "node:crypto";

const sha256Text = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const near = (a, b, tolerance) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tolerance;
/**
 * The words that turn the rest of a clause from a request into its opposite: negations, and the removal
 * verbs of an edit prompt (what an edit removes, deletes, erases or eliminates is taken away, not asked for).
 */
const NEGATION = /\b(no|not|never|nor|none|nothing|neither|without|avoid|free of|instead of|remov(e|es|ed|ing)|delet(e|es|ed|ing)|eras(e|es|ed|ing)|eliminat(e|es|ed|ing))\b/i;
const SCOPES = new Set(["prompt", "affirmative"]);

/** The Avoid lines of a prompt, joined. */
export const avoidText = (prompt) => prompt.split("\n").filter((l) => /^Avoid:/.test(l)).join("\n");

/**
 * The affirmative text of a prompt: the Avoid lines removed, then, in every clause (split at full stops and
 * semicolons), the text from the first negation or removal word to the end of the clause removed, so that
 * only what the prompt asks for remains. A clause that starts with a request and ends with a negation ("a
 * top opening and no other detail") keeps the request; a clause that starts with the negation ("no lid, no
 * slot") or with a removal ("Remove any inset, recess or slot-like highlight") is dropped whole. A negated
 * request that a later "but" or "so" re-opens ("not a badge but a cube with a lid", "remove the cap so the
 * cube opens") stays dropped: this is a keyword gate, not a parser.
 */
export const affirmativeText = (prompt) => prompt
  .split("\n")
  .filter((l) => !/^Avoid:/.test(l))
  .map((l) => l.split(/[.;]/).map((c) => {
    const m = NEGATION.exec(c);
    return m ? c.slice(0, m.index) : c;
  }).join(". "))
  .join("\n");

/** Requirement text excludes Avoid lines even for negative/meta requirements. */
const promptRequirementText = (prompt) => prompt.split("\n").filter((line) => !/^Avoid:/.test(line)).join("\n");

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
  const families = [...new Set(names.map((n) => n.replace(/-(light|dark)\.png$/, "")))];
  const R = fixture.references;
  const S = fixture.supersededReferences ?? { nodes: [], files: [], word: "superseded" };
  const supersededWord = new RegExp(S.word, "i");
  const G = fixture.geometry ?? {};
  const rule = (r) => ({ ...r, re: new RegExp(r.pattern, r.flags ?? "") });
  const requirements = (G.promptRequirements ?? []).map(rule);
  const avoidRequirements = (G.avoidRequirements ?? []).map(rule);
  const negations = (G.promptNegations ?? []).map(rule);
  const editRequirements = (G.editPromptRequirements ?? []).map(rule);
  const editAvoidRequirements = (G.editAvoidRequirements ?? []).map(rule);
  // The kinds of precise-object edit: each adds its own requirements to the core edit contract, and a pinned edit names its kind.
  const editKinds = Object.fromEntries(Object.entries(G.editKinds ?? {}).filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, { promptRequirements: (v.promptRequirements ?? []).map(rule), avoidRequirements: (v.avoidRequirements ?? []).map(rule) }]));
  // The contract is only as strong as its list: a requirement swapped for a copy of another would keep the count and drop a rule.
  const lists = [requirements, avoidRequirements, negations, editRequirements, editAvoidRequirements, ...Object.values(editKinds).flatMap((k) => [k.promptRequirements, k.avoidRequirements])];
  for (const list of lists) {
    const labels = new Set();
    const patterns = new Set();
    for (const r of list) {
      if (labels.has(r.label)) errors.push(`scripts/validate/branded-backgrounds.json: geometry rule ${JSON.stringify(r.label)} is listed twice`);
      if (patterns.has(r.pattern)) errors.push(`scripts/validate/branded-backgrounds.json: geometry rule ${JSON.stringify(r.label)} repeats the pattern of another rule`);
      labels.add(r.label);
      patterns.add(r.pattern);
    }
  }
  for (const r of [...requirements, ...editRequirements, ...Object.values(editKinds).flatMap((k) => k.promptRequirements), ...negations]) if (!SCOPES.has(r.scope)) errors.push(`scripts/validate/branded-backgrounds.json: geometry rule ${JSON.stringify(r.label)} has the unknown scope ${JSON.stringify(r.scope)}; use prompt or affirmative`);
  for (const [kind, k] of Object.entries(editKinds)) if (!k.promptRequirements.length && !k.avoidRequirements.length) errors.push(`scripts/validate/branded-backgrounds.json: edit kind ${JSON.stringify(kind)} adds no requirement; a kind without rules is a label, not a contract`);
  // A pinned edit chain must be sound in the pin itself: the final edit names its kind, its target is the output of the
  // previous edit (or the entry's own generation), every earlier edit's output is the next edit's target, and the chain
  // ends at the generation that produced the scene, so no superseded output can be pinned as something it is not.
  for (const name of names) {
    const pin = fixture.files[name];
    if (!pin.edit) continue;
    const at = `scripts/validate/branded-backgrounds.json: ${name}`;
    const lineage = Array.isArray(pin.edit.lineage) ? pin.edit.lineage : [];
    if (!editKinds[pin.edit.kind]) errors.push(`${at}: the pinned edit names the unknown kind ${JSON.stringify(pin.edit.kind)}; the kinds are ${Object.keys(editKinds).join(", ") || "none"}`);
    const chain = [pin.edit, ...lineage];
    chain.forEach((e, i) => {
      const previous = chain[i + 1];
      const wantTargetId = previous ? previous.generationId : pin.generationId;
      const label = i === 0 ? "the pinned edit" : `lineage edit ${i}`;
      if (e.targetGenerationId !== wantTargetId) errors.push(`${at}: ${label} targets generation ${e.targetGenerationId}, but the previous step of the chain is ${wantTargetId} (${previous ? "the earlier edit" : "the entry's own generation"})`);
      if (previous && previous.outputSha256 !== e.targetSha256) errors.push(`${at}: ${label} targets ${String(e.targetSha256).slice(0, 12)}..., but the earlier edit's output is ${String(previous.outputSha256).slice(0, 12)}...`);
      if (previous && previous.contentCredentialsTimestamp !== e.targetContentCredentialsTimestamp) errors.push(`${at}: ${label} targets a file countersigned ${e.targetContentCredentialsTimestamp}, but the earlier edit's output was countersigned ${previous.contentCredentialsTimestamp}`);
      for (const key of ["generationId", "promptSha256", "targetSha256", "targetGenerationId", "targetContentCredentialsTimestamp"]) if (typeof e[key] !== "string" || !e[key]) errors.push(`${at}: ${label} has no ${key}`);
      if (i > 0 && (typeof e.outputSha256 !== "string" || typeof e.contentCredentialsTimestamp !== "string")) errors.push(`${at}: ${label} must pin its output by hash and time stamp`);
      if (e.method !== "precise-object-edit") errors.push(`${at}: ${label} method ${JSON.stringify(e.method)} is not precise-object-edit`);
    });
    if (lineage.some((l) => l.outputSha256 === pin.sha256)) errors.push(`${at}: a lineage edit's output is the pinned file itself; lineage is superseded history, the pinned edit is the one whose output is on disk`);
  }
  // The pinned zones must themselves meet the slide contract and be one rectangle per family, since the README table states one zone per family.
  for (const name of names) {
    const z = fixture.files[name].safeZone;
    const light = name.endsWith("-light.png");
    const meets = (light ? z.meanLuminance >= fixture.contract.lightMinSafeZoneLuminance : z.meanLuminance <= fixture.contract.darkMaxSafeZoneLuminance) && z.deviation <= fixture.contract.maxSafeZoneDeviation;
    if (!meets) errors.push(`scripts/validate/branded-backgrounds.json: ${name}: the pinned safe zone (${z.meanLuminance}/${z.deviation}) does not meet the slide contract for a ${light ? "light" : "dark"} register`);
  }
  for (const family of families) {
    const a = fixture.files[`${family}-light.png`]?.safeZone;
    const b = fixture.files[`${family}-dark.png`]?.safeZone;
    if (a && b && ["x", "y", "width", "height"].some((k) => a[k] !== b[k])) errors.push(`scripts/validate/branded-backgrounds.json: ${family}: the light and dark zones differ; a family shares one rectangle so a deck keeps its layout when the theme switches`);
  }
  const citesSuperseded = (text) => S.nodes.find((s) => String(text).includes(s.node) || String(text).includes(s.inputSha256));
  /** The geometry a prompt omits, negates or asks for, and whether it cites a superseded export. */
  const checkPromptWith = (at, prompt, required, avoided, kind) => {
    if (typeof prompt !== "string") return;
    for (const r of required) {
      const text = r.label === "an Avoid line" ? prompt : r.scope === "affirmative" ? affirmativeText(prompt) : promptRequirementText(prompt);
      if (!r.re.test(text)) errors.push(`${at} ${kind} omits the geometry requirement ${JSON.stringify(r.label)}`);
    }
    const avoid = avoidText(prompt);
    for (const r of avoided) if (!r.re.test(avoid)) errors.push(`${at} ${kind}'s Avoid line does not reject ${JSON.stringify(r.label.replace(/ rejected$/, ""))}`);
    const affirmative = affirmativeText(prompt);
    for (const r of negations) if (r.re.test(r.scope === "affirmative" ? affirmative : prompt)) errors.push(`${at} ${kind} contradicts the closed-cube contract: ${JSON.stringify(r.label)}`);
    const sup = citesSuperseded(prompt);
    if (sup) errors.push(`${at} ${kind} cites the superseded reference node ${sup.node}; the references are the onboarding illustrations ${Object.keys(R.files).join(", ")}`);
  };
  const checkPrompt = (at, prompt) => checkPromptWith(at, prompt, requirements, avoidRequirements, "prompt");
  /** An edit prompt: the core edit contract, then the rules of its kind (a lineage prompt has no kind: it is superseded history, held to the core only). */
  const checkEditPrompt = (at, prompt, kind) => {
    checkPromptWith(at, prompt, editRequirements, editAvoidRequirements, "edit prompt");
    const k = kind === undefined ? null : editKinds[kind];
    if (kind !== undefined && !k) errors.push(`${at} edit prompt is held to the unknown edit kind ${JSON.stringify(kind)}`);
    if (k) checkPromptWith(at, prompt, k.promptRequirements, k.avoidRequirements, `${kind} edit prompt`);
  };
  const pinnedHashes = new Set([...names.map((n) => fixture.files[n].sha256), ...Object.values(R.files)]);
  let edits = 0;
  let lineageEdits = 0;
  /** A superseded output or target in an edit block: recorded by hash, never a repository file, unpublished and called superseded. */
  const checkSupersededFile = (at, what, f, wantSha, wantGenerationId, wantTimestamp) => {
    if (!f || typeof f !== "object") {
      errors.push(`${at} ${what} is not recorded`);
      return;
    }
    if (f.sha256 !== wantSha) errors.push(`${at} ${what} sha256 ${String(f.sha256).slice(0, 12)}... differs from the pinned ${String(wantSha).slice(0, 12)}...`);
    if (f.generationId !== wantGenerationId) errors.push(`${at} ${what} generation id ${f.generationId} differs from the pinned ${wantGenerationId}`);
    if (f.contentCredentialsTimestamp !== wantTimestamp) errors.push(`${at} ${what} time stamp ${f.contentCredentialsTimestamp} differs from the pinned ${wantTimestamp}`);
    if (f.published !== false || !supersededWord.test(`${f.status ?? ""}`)) errors.push(`${at} ${what} must be recorded as ${S.word} and published: false (it is not in the repository)`);
    if (pinnedHashes.has(wantSha)) errors.push(`${at} ${what} ${String(wantSha).slice(0, 12)}... is a pinned file or reference; a superseded output is not a repository file`);
  };
  /** A reference entry (set block, generation input or staged file) against the pinned onboarding file. */
  const checkReference = (at, name, entry) => {
    const want = { path: `${R.directory}/${name}`, sha256: R.files[name], source: R.source, status: R.status, published: R.published };
    for (const [k, v] of Object.entries(want)) if (entry[k] !== v) errors.push(`${at} reference ${name} ${k} is ${JSON.stringify(entry[k])}, the pinned value is ${JSON.stringify(v)}`);
  };
  const referenceName = (entry) => String(entry?.path ?? entry?.name ?? "").split("/").pop();

  // ---- the reference illustrations: on disk and in their own record, byte for byte
  for (const [name, sha] of Object.entries(R.files)) {
    const actual = io.sha256(`${R.directory}/${name}`);
    if (actual === null) errors.push(`${R.directory}/${name}: missing`);
    else if (actual !== sha) errors.push(`${R.directory}/${name}: sha256 ${actual.slice(0, 12)}... is not the pinned reference ${sha.slice(0, 12)}...`);
  }
  const referenceRecord = readJson(R.record);
  if (referenceRecord) {
    for (const [name, sha] of Object.entries(R.files)) {
      const entry = (referenceRecord.assets ?? []).find((a) => a.path === name);
      if (!entry) errors.push(`${R.record}: no entry for the reference ${name}`);
      else if (entry.sha256 !== sha) errors.push(`${R.record}: ${name} sha256 ${String(entry.sha256).slice(0, 12)}... differs from the pinned reference ${sha.slice(0, 12)}...`);
    }
  }

  // ---- the generated-image record
  const prov = readJson(fixture.record);
  if (prov) {
    const label = fixture.record;
    const set = prov.sets?.[fixture.set];
    if (!set) errors.push(`${label}: no set ${fixture.set}`);
    else {
      const at = `${label}: set ${fixture.set}`;
      if (set.decision !== fixture.decision.path) errors.push(`${at} must cite ${fixture.decision.path} as its decision`);
      const refs = Array.isArray(set.references) ? set.references : [];
      for (const name of Object.keys(R.files)) {
        const entry = refs.find((r) => referenceName(r) === name);
        if (!entry) errors.push(`${at} must list the reference ${name}`);
        else checkReference(at, name, entry);
      }
      for (const r of refs) if (!R.files[referenceName(r)]) errors.push(`${at} lists a reference that is not pinned: ${r.path ?? r.name ?? JSON.stringify(r)}`);
      const sups = Array.isArray(set.supersededReferences) ? set.supersededReferences : [];
      for (const s of S.nodes) {
        const entry = sups.find((x) => x.node === s.node);
        if (!entry || entry.inputSha256 !== s.inputSha256 || !supersededWord.test(`${entry.status ?? ""} ${entry.note ?? ""}`)) errors.push(`${at} must record the superseded reference node ${s.node} (hash ${s.inputSha256.slice(0, 12)}...) as ${S.word}`);
      }
      if (set.count !== names.length) errors.push(`${at} declares ${set.count} files, the pinned selection has ${names.length}`);
      for (const name of Object.keys(set.edits?.files ?? {})) if (!fixture.files[name]?.edit) errors.push(`${at} edits block lists ${name}, which has no pinned edit`);
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
      checkPrompt(at, a.prompt);
      const inputs = Array.isArray(a.generation?.inputs) ? a.generation.inputs : [];
      for (const name of pin.references) {
        const entry = inputs.find((i) => referenceName(i) === name);
        if (!entry) errors.push(`${at} must record the reference ${name} among its generation inputs`);
        else checkReference(at, name, entry);
      }
      for (const i of inputs) {
        const sup = citesSuperseded(JSON.stringify(i));
        if (sup) errors.push(`${at} generation input cites the superseded reference node ${sup.node}; the references are public onboarding illustrations`);
        else if (!pin.references.includes(referenceName(i))) errors.push(`${at} records an input that is not a pinned reference: ${i.path ?? i.name ?? i.role ?? JSON.stringify(i)}`);
      }
      if (pin.edit) {
        // A pinned precise-object edit: the file on disk is the final edit's output; the entry keeps the generation that
        // produced the scene, records the final edit, and lists every earlier edit of the chain as superseded lineage.
        edits++;
        const lineage = Array.isArray(pin.edit.lineage) ? pin.edit.lineage : [];
        lineageEdits += lineage.length;
        const e = a.edit;
        if (!e || typeof e !== "object") errors.push(`${at} must record the pinned precise-object edit ${pin.edit.generationId} in an edit block`);
        else {
          if (e.id !== pin.edit.generationId) errors.push(`${at} edit generation id ${e.id} differs from the pinned ${pin.edit.generationId}`);
          if (e.method !== pin.edit.method) errors.push(`${at} edit method ${JSON.stringify(e.method)} differs from the pinned ${JSON.stringify(pin.edit.method)}`);
          if (e.kind !== pin.edit.kind) errors.push(`${at} edit kind ${JSON.stringify(e.kind)} differs from the pinned ${JSON.stringify(pin.edit.kind)}`);
          if (typeof e.prompt !== "string" || sha256Text(e.prompt) !== pin.edit.promptSha256) errors.push(`${at} edit prompt differs from the pinned edit (sha256 ${typeof e.prompt === "string" ? sha256Text(e.prompt).slice(0, 12) : "none"}..., pinned ${pin.edit.promptSha256.slice(0, 12)}...)`);
          if (typeof e.prompt === "string" && !e.prompt.includes(fixture.mark)) errors.push(`${at} edit prompt does not name the ${fixture.mark} mark`);
          checkEditPrompt(at, e.prompt, pin.edit.kind);
          checkSupersededFile(at, "edit target", e.target, pin.edit.targetSha256, pin.edit.targetGenerationId, pin.edit.targetContentCredentialsTimestamp);
          const got = Array.isArray(e.lineage) ? e.lineage : [];
          if (got.length !== lineage.length) errors.push(`${at} edit lineage records ${got.length} earlier edit(s), the pin has ${lineage.length}`);
          lineage.forEach((w, i) => {
            const g = got[i];
            const lat = `${at} lineage edit ${i + 1}`;
            if (!g || typeof g !== "object") return;
            if (g.id !== w.generationId) errors.push(`${lat} generation id ${g.id} differs from the pinned ${w.generationId}`);
            if (g.method !== w.method) errors.push(`${lat} method ${JSON.stringify(g.method)} differs from the pinned ${JSON.stringify(w.method)}`);
            if (typeof g.prompt !== "string" || sha256Text(g.prompt) !== w.promptSha256) errors.push(`${lat} prompt differs from the pinned lineage (sha256 ${typeof g.prompt === "string" ? sha256Text(g.prompt).slice(0, 12) : "none"}..., pinned ${w.promptSha256.slice(0, 12)}...)`);
            checkEditPrompt(lat, g.prompt);
            checkSupersededFile(lat, "output", g.output, w.outputSha256, w.generationId, w.contentCredentialsTimestamp);
            checkSupersededFile(lat, "target", g.target, w.targetSha256, w.targetGenerationId, w.targetContentCredentialsTimestamp);
            if (!supersededWord.test(`${g.status ?? ""}`)) errors.push(`${lat} must carry status ${S.word}; its output was replaced by the next edit`);
          });
          const sup = citesSuperseded(JSON.stringify(e));
          if (sup) errors.push(`${at} edit block cites the superseded reference node ${sup.node}`);
        }
        const listed = prov.sets?.[fixture.set]?.edits?.files?.[name];
        const listedLineage = JSON.stringify((Array.isArray(listed?.lineage) ? listed.lineage : []).map((l) => [l.editGenerationId, l.editTargetSha256, l.outputSha256]));
        const wantLineage = JSON.stringify(lineage.map((l) => [l.generationId, l.targetSha256, l.outputSha256]));
        if (!listed || listed.editGenerationId !== pin.edit.generationId || listed.editTargetSha256 !== pin.edit.targetSha256 || listed.targetGenerationId !== pin.edit.targetGenerationId || listedLineage !== wantLineage) errors.push(`${label}: set ${fixture.set} edits block must list ${name} with edit ${pin.edit.generationId}, target ${pin.edit.targetSha256.slice(0, 12)}... of ${pin.edit.targetGenerationId}${lineage.length ? ` and the ${lineage.length} earlier edit(s) of its lineage by id, target and output` : ""}`);
      } else if (a.edit !== undefined) errors.push(`${at} records an edit that is not pinned; a precise-object edit of a branded file is a reviewed change of scripts/validate/branded-backgrounds.json`);
      if (a.embeddedMarks?.mark !== fixture.mark) errors.push(`${at} must declare the embedded ${fixture.mark} mark`);
      if (a.embeddedMarks?.count !== pin.upBoxes) errors.push(`${at} declares ${a.embeddedMarks?.count} UP! cubes, the pinned count is ${pin.upBoxes}`);
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
        const header = io.inspect(filePath);
        if (!header) errors.push(`${filePath}: cannot be read as a PNG`);
        else {
          if (header.dimensions !== pin.dimensions) errors.push(`${filePath}: is ${header.dimensions}, the pinned dimensions are ${pin.dimensions}`);
          if (header.canBeTransparent) errors.push(`${filePath}: carries transparency; every branded background is opaque (the contract says alphaChannel ${fixture.contract.alphaChannel})`);
          if (header.bitDepth !== fixture.contract.bitDepth) errors.push(`${filePath}: is ${header.bitDepth}-bit, the contract requires ${fixture.contract.bitDepth}-bit`);
          if (header.colourType !== fixture.contract.colourType) errors.push(`${filePath}: is ${header.colourType}, the contract requires ${fixture.contract.colourType}`);
        }
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
      if (JSON.stringify(e.references) !== JSON.stringify(pin.references)) errors.push(`${label}: ${name} references ${JSON.stringify(e.references)} differ from the pinned ${JSON.stringify(pin.references)}`);
      if (typeof e.prompt !== "string" || sha256Text(e.prompt) !== pin.promptSha256) errors.push(`${label}: ${name} prompt differs from the pinned selection`);
      checkPrompt(`${label}: ${name}`, e.prompt);
      if (pin.edit) {
        const d = e.edit;
        const lineage = Array.isArray(pin.edit.lineage) ? pin.edit.lineage : [];
        if (!d || typeof d !== "object") errors.push(`${label}: ${name} must carry the pinned edit ${pin.edit.generationId} (edit: generationId, kind, targetSha256, targetGenerationId, prompt${lineage.length ? ", lineage" : ""})`);
        else {
          if (d.generationId !== pin.edit.generationId) errors.push(`${label}: ${name} edit generation id ${d.generationId} differs from the pinned ${pin.edit.generationId}`);
          if (d.kind !== pin.edit.kind) errors.push(`${label}: ${name} edit kind ${JSON.stringify(d.kind)} differs from the pinned ${JSON.stringify(pin.edit.kind)}`);
          if (d.targetSha256 !== pin.edit.targetSha256) errors.push(`${label}: ${name} edit target ${String(d.targetSha256).slice(0, 12)}... differs from the pinned ${pin.edit.targetSha256.slice(0, 12)}...`);
          if (d.targetGenerationId !== pin.edit.targetGenerationId) errors.push(`${label}: ${name} edit target generation id ${d.targetGenerationId} must be ${pin.edit.targetGenerationId} (${lineage.length ? "the earlier edit of the chain" : "the entry's own generation"})`);
          if (typeof d.prompt !== "string" || sha256Text(d.prompt) !== pin.edit.promptSha256) errors.push(`${label}: ${name} edit prompt differs from the pinned edit`);
          checkEditPrompt(`${label}: ${name}`, d.prompt, pin.edit.kind);
          const got = Array.isArray(d.lineage) ? d.lineage : [];
          if (got.length !== lineage.length) errors.push(`${label}: ${name} edit lineage records ${got.length} earlier edit(s), the pin has ${lineage.length}`);
          lineage.forEach((w, i) => {
            const g = got[i];
            const lat = `${label}: ${name} lineage edit ${i + 1}`;
            if (!g || typeof g !== "object") return;
            if (g.generationId !== w.generationId) errors.push(`${lat} generation id ${g.generationId} differs from the pinned ${w.generationId}`);
            if (g.outputSha256 !== w.outputSha256) errors.push(`${lat} output ${String(g.outputSha256).slice(0, 12)}... differs from the pinned ${w.outputSha256.slice(0, 12)}...`);
            if (g.targetSha256 !== w.targetSha256) errors.push(`${lat} target ${String(g.targetSha256).slice(0, 12)}... differs from the pinned ${w.targetSha256.slice(0, 12)}...`);
            if (g.targetGenerationId !== w.targetGenerationId) errors.push(`${lat} target generation id ${g.targetGenerationId} differs from the pinned ${w.targetGenerationId}`);
            if (typeof g.prompt !== "string" || sha256Text(g.prompt) !== w.promptSha256) errors.push(`${lat} prompt differs from the pinned lineage`);
            checkEditPrompt(lat, g.prompt);
          });
        }
      } else if (e.edit !== undefined) errors.push(`${label}: ${name} records an edit that is not pinned`);
    }
    for (const name of entries.keys()) if (!fixture.files[name]) errors.push(`${label}: ${name} has a prompt entry but is not in the pinned selection`);
    const gen = prompts.generation ?? {};
    for (const name of Object.keys(R.files)) {
      const entry = gen.references?.[name];
      if (!entry) errors.push(`${label}: generation.references must list ${name}`);
      else if (entry.sha256 !== R.files[name]) errors.push(`${label}: generation.references.${name} sha256 ${String(entry.sha256).slice(0, 12)}... differs from the pinned ${R.files[name].slice(0, 12)}...`);
      else checkReference(`${label}: generation.references`, name, entry);
    }
    for (const key of ["mode", "referenceNote", "geometry", "authorization"]) {
      const sup = citesSuperseded(gen[key] ?? "");
      if (sup) errors.push(`${label}: generation.${key} must not cite the superseded node ${sup.node}; it belongs in generation.supersededReferences`);
    }
    const sup = String(gen.supersededReferences ?? "");
    for (const s of S.nodes) if (!sup.includes(s.node) || !supersededWord.test(sup)) errors.push(`${label}: generation.supersededReferences must name node ${s.node} as ${S.word}`);
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

  // ---- the galleries show every pinned file and both sheets
  let galleryImages = 0;
  for (const [file, images] of Object.entries(fixture.galleries ?? {})) {
    if (file.startsWith("$")) continue;
    const text = io.readText(file);
    if (text === null) {
      errors.push(`${file}: missing`);
      continue;
    }
    for (const image of images) {
      galleryImages++;
      if (!text.includes(image)) errors.push(`${file}: the gallery no longer shows ${image}`);
    }
  }

  // ---- the decision record, its predecessor and the index
  const decision = io.readText(fixture.decision.path);
  if (decision === null) errors.push(`${fixture.decision.path}: missing`);
  else {
    for (const want of [...Object.keys(R.files), ...Object.values(R.files), ...names, ...(fixture.decisionWording ?? [])]) if (!decision.includes(want)) errors.push(`${fixture.decision.path}: must state ${JSON.stringify(want)}`);
    // Every pinned edit is part of the decision: the record names the final edit, the file it produced and every earlier edit of the chain.
    for (const name of names) {
      const pin = fixture.files[name];
      if (!pin.edit) continue;
      for (const [what, want] of [["the pinned edit", pin.edit.generationId], ["the edited file's hash", pin.sha256], ...(pin.edit.lineage ?? []).map((l, i) => [`lineage edit ${i + 1}`, l.generationId])]) if (!decision.includes(want)) errors.push(`${fixture.decision.path}: must name ${what} of ${name} (${want})`);
    }
    if (!new RegExp(`^Status:\\s*${fixture.decision.status}\\b`, "m").test(decision)) errors.push(`${fixture.decision.path}: Status line must read ${fixture.decision.status}`);
  }
  const index = io.readText(fixture.decision.index);
  if (index === null) errors.push(`${fixture.decision.index}: missing`);
  else {
    const row = index.split("\n").find((l) => l.includes(fixture.decision.path.split("/").pop()));
    if (!row) errors.push(`${fixture.decision.index}: does not list ${fixture.decision.path}`);
    else if (!row.includes(fixture.decision.status)) errors.push(`${fixture.decision.index}: the row for decision ${fixture.decision.id} must say ${fixture.decision.status}`);
  }
  const pred = fixture.decision.predecessor;
  if (pred) {
    // The superseded record stays as history; only its Status line and its index row point at the correction.
    const text = io.readText(pred.path);
    if (text === null) errors.push(`${pred.path}: missing`);
    else {
      const status = text.match(/^Status:\s*(.+)$/m)?.[1] ?? "";
      if (!status.includes(fixture.decision.id) || !/superseded/i.test(status)) errors.push(`${pred.path}: Status line must say that the reference and the geometry are superseded by ${fixture.decision.id}`);
    }
    if (index !== null) {
      const row = index.split("\n").find((l) => l.includes(pred.path.split("/").pop()));
      if (!row) errors.push(`${fixture.decision.index}: does not list ${pred.path}`);
      else if (!row.includes(fixture.decision.id)) errors.push(`${fixture.decision.index}: the row for decision ${pred.id} must point to ${fixture.decision.id}`);
    }
  }

  // ---- the source register
  const sources = readJson(fixture.sources.register);
  if (sources) {
    const cites = (key, what) => {
      const s = sources.sources?.[key];
      if (!s) errors.push(`${fixture.sources.register}: no ${key}`);
      else if (!String(s.notes ?? "").includes(fixture.decision.id)) errors.push(`${fixture.sources.register}: ${key} notes must cite decision ${fixture.decision.id}${what ? ` (${what})` : ""}`);
      return s;
    };
    const board = cites(fixture.sources.boardKey, "the superseded exports");
    if (board) {
      const notes = String(board.notes ?? "");
      for (const s of S.nodes) if (!notes.includes(s.node) || !supersededWord.test(notes)) errors.push(`${fixture.sources.register}: ${fixture.sources.boardKey} notes must name node ${s.node} as ${S.word}`);
    }
    cites(fixture.sources.generatedKey, "the generated set");
    cites(fixture.sources.referenceKey, "the reference illustrations");
  }

  // ---- no mark file anywhere under the logos directory
  const logos = io.listDir(fixture.logosDirectory).filter((n) => n !== "README.md");
  if (logos.length) errors.push(`${fixture.logosDirectory}: contains ${logos.join(", ")}; the repository ships no mark file (the UP! container cube is depicted only inside the branded backgrounds)`);

  // ---- the safe-zone table in the backgrounds README follows the record
  const readme = io.readText(fixture.readmeTable);
  if (readme === null) errors.push(`${fixture.readmeTable}: missing`);
  else {
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

  // ---- the closed-cube contract in the documents, and the superseded forms
  let geometryPhrases = 0;
  for (const [file, required] of Object.entries(G.documentPhrases ?? {})) {
    const text = io.readText(file);
    if (text === null) {
      errors.push(`${file}: missing`);
      continue;
    }
    for (const phrase of required) {
      geometryPhrases++;
      if (!text.includes(phrase)) errors.push(`${file}: must state the closed-cube contract: ${JSON.stringify(phrase)}`);
    }
  }
  for (const gc of G.contradictions ?? []) {
    const form = new RegExp(gc.pattern, gc.flags ?? "");
    for (const file of gc.files ?? []) {
      const text = io.readText(file);
      if (text === null) continue;
      text.split("\n").forEach((line, i) => {
        if (form.test(line)) errors.push(`${file}:${i + 1}: describes the depicted UP! object as ${gc.label}; it is a solid, closed, sealed container cube (decision ${fixture.decision.id})`);
      });
    }
  }
  for (const file of S.files ?? []) {
    const text = io.readText(file);
    if (text === null) continue;
    text.split("\n").forEach((line, i) => {
      for (const s of S.nodes) if (line.includes(s.node) && !supersededWord.test(line)) errors.push(`${file}:${i + 1}: names the superseded reference node ${s.node} without calling it ${S.word}; the references are the onboarding illustrations ${Object.keys(R.files).join(", ")}`);
    });
  }
  info.push(`${names.length} branded backgrounds pinned (files, header facts, prompts, generation ids, safe zones), ${Object.keys(R.files).length} reference illustrations pinned by hash, ${requirements.length} geometry requirements, ${avoidRequirements.length} avoid requirements and ${negations.length} negation guards on every prompt, ${edits} precise-object edits pinned (${editRequirements.length} edit requirements, ${editAvoidRequirements.length} edit avoid requirements, ${Object.keys(editKinds).length} edit kinds, ${lineageEdits} superseded earlier edits in lineage), ${Object.keys(fixture.previews.sheets).length} contact sheets recomposed, ${galleryImages} gallery references, ${phrases} wording phrases in ${Object.keys(fixture.wording).length} documents, ${geometryPhrases} contract phrases in ${Object.keys(G.documentPhrases ?? {}).length} documents, decision ${fixture.decision.id} ${fixture.decision.status}`);
  return { errors, info: info.join("; ") };
}
