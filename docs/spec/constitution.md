# Constitution: eval-lab

Principles that outrank any single requirement.

> **Note on this file's structure:** the constitution/spec/plan/tasks/traceability
> layout under `docs/spec/` is an intentional shared house style used across this
> candidate's repos ([triage-desk](https://github.com/edgeorgie/triage-desk/blob/main/docs/spec/constitution.md)
> uses the same skeleton) — a repeatable spec-driven-development process applied
> per-project, not boilerplate padding copy-pasted without adaptation. Only the
> "Product"/non-goals sections below are project-specific; "Engineering standards"
> and "Definition of done" are the deliberately-reused process contract.

## Product

- Run every variant against every case with checks and an optional judge.
- Detect regressions between runs.
- Make the cost of a run visible.

Non-goals:

- Hosted result sharing.
- Fine-tuning.

## Engineering standards

- TypeScript in strict mode. Types at every boundary: parsed model output, network responses and storage reads are validated, not trusted.
- Pure logic lives in `lib/` and is tested without a browser. UI components stay thin.
- Comments only for non-obvious intent. No emojis, no debug logging, no dead code.
- Dependencies are added only with a reason recorded in an ADR or the plan.
- Privacy by default: secrets and user content stay in the browser unless a requirement says otherwise.
- Accessibility: keyboard reachable controls, visible focus, reduced motion respected.

## Definition of done

1. The requirement exists in `spec.md` with acceptance criteria.
2. `npm run verify` passes.
3. Behavior was exercised, not only compiled. Evidence is recorded in `traceability.md`.
4. Uncertainty and unverified paths are stated in the spec, not hidden.
