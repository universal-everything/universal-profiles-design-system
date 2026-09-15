# Governance

## Roles

| Role | Responsibility |
|---|---|
| Brand owner | Decides open items on marks, accent, narrative and imagery rights; signs off promotions from proposed to observed for brand values |
| Product owners (mobile, web) | Decide open items on product behaviour (glass on the web, badge size, action size); confirm adoption |
| Maintainers | Review changes, keep the gate green, keep provenance and registers current, cut releases |
| Contributors | Propose changes through pull requests that pass the gate |

Maintainers are the design-system working group of the Universal Profiles product teams; the current list is kept in the repository's contributor settings.

## Decision process

1. Anything the evidence cannot settle is an open item in `provenance/open-items.md` with an owner role and a closing condition.
2. The owner records the decision as a numbered file in `decisions/` (context, decision, consequences, evidence).
3. The same change updates the tokens or documents that cited the item and passes `npm test`.
4. Superseding a decision adds a new record; old records are never edited.

## Versioning

Semantic versioning for the repository and each package.

- **Major**: a token removed or renamed, a semantic role's meaning changed, a generated output format changed incompatibly, an algorithm in the address-signature package changed in a way that alters output.
- **Minor**: new tokens, roles, components, patterns, icons or briefs; status promotions; new outputs.
- **Patch**: value corrections within a status, documentation fixes, validator improvements that do not change outputs.

Deprecations keep the old token for one minor release with `deprecated: true` and a note pointing to the replacement.

## Releases

A release tags the repository, updates `CHANGELOG.md`, and publishes the packages once OPEN-09 (scope and names) is closed. Until then, consumers reference the repository by tag.

## Evidence and provenance

Every value traces to a source in `provenance/sources.json`; conflicts are logged in `provenance/reconciliation.md`; assets carry provenance records validated by hash. The publication boundary in `provenance/README.md` is a hard rule.
