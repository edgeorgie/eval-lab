# Constitution: eval-lab

Principles that outrank any single requirement.

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
