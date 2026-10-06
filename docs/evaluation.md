# Evaluation

A self-assessment against a reviewer's rubric. It states gaps plainly so a reviewer, a person or an agent, can verify or challenge each line.

| Criterion | Status | Notes |
|---|---|---|
| Onboarding | Pass | README has a one-command run, usage steps and configuration. |
| Reproducible build | Pass | Lockfile, Node 22 engine field, and one gate: `npm run verify`. |
| Automated tests | Partial | Unit tests cover the pure logic (7 of 7 requirements have tests). No browser end-to-end tests; UI behavior was verified manually and recorded in the traceability matrix. |
| Continuous integration | Gap | A workflow runs `npm run verify` but is not active until the repository token has the workflow permission. The gate runs locally. |
| Specification and traceability | Pass | Spec, plan, tasks, ADRs and a matrix enforced by `npm run spec:check`. |
| Documentation structure | Pass | Index, architecture with diagrams, glossary and design system. |
| Agent readiness | Pass | AGENTS.md, llms.txt, machine-readable requirements and a deterministic gate. There is no MCP server or OpenAPI document because the app is client-side. |
| LLM integration safety | Partial | The judge model reads outputs it is grading, so an output can try to influence its own grade. The judge answers one word, which limits the surface, and deterministic checks run first. |
| Privacy and data flow | Pass | Every data path and its storage is tabulated in the README. |
| Accessibility | Partial | Result cells have text labels and aria labels; the drawer closes with Escape. Not audited with automated tooling. |
| Performance | Partial | Concurrency is bounded to three calls. Not measured with Lighthouse. |
| Security | Partial | The key lives in sessionStorage by default and in localStorage only if the user opts in. Baseline security headers are set on a Node host. The Pages export carries a CSP meta tag (headers and frame-ancestors are not possible on Pages). |
| Deployment | Pass | Live on Vercel at https://eval-lab-wheat.vercel.app, with security headers served by the host. The main flow was exercised on the deployed site. |
| Licensing | Pass | MIT. |

## Verify it yourself

```bash
npm install
npm run verify
```

Requirements marked "Implemented, not verified end to end" in [spec.md](spec/spec.md) depend on a real external service or credential that was not exercised.
