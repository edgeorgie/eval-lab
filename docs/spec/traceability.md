# Traceability: eval-lab

Every requirement maps to implementation files and to tests or manual evidence. `npm run spec:check` enforces that each requirement has an implementation, that files exist, and that there is a test or a manual note.

| Requirement | Implementation | Tests | Evidence | Status |
|---|---|---|---|---|
| FR-1 | `lib/assert.ts` | `tests/lab.test.ts` | PR 1: assertion tests. | Verified |
| FR-2 | `lib/runner.ts` | `tests/lab.test.ts` | PR 1: runner and error tests. | Verified |
| FR-3 | `lib/assert.ts`, `lib/runner.ts` | `tests/lab.test.ts` | PR 1: judge parsing and demo-model run. | Verified |
| FR-4 | `lib/history.ts`, `app/page.tsx`, `components/Matrix.tsx` | `tests/lab.test.ts` | PR 2: diff tests; failed runs are excluded from history, BEST and cost (QA BUG-008). | Verified |
| FR-5 | `lib/diff.ts`, `components/Drawer.tsx` | `tests/diffcost.test.ts` | PR 2: diff tests; verified in Chrome. | Verified |
| FR-6 | `lib/cost.ts`, `app/page.tsx` | `tests/diffcost.test.ts` | PR 2: estimate tests. Prices are rough and must be rechecked. | Verified |
| FR-7 | `lib/demo.ts` | `tests/lab.test.ts` | PR 1: sample run scored 0, 100 and 50 percent in Chrome. | Verified |
| FR-8 | `lib/keystore.ts`, `lib/state.ts`, `components/KeyNotes.tsx`, `app/page.tsx` | `tests/keystore.test.ts`, `tests/state.test.ts` | In Chrome with an invalid test key the key stayed in sessionStorage and was absent from eval-lab.state.v1 (SEC-002, SEC-009). | Verified |
| FR-9 | `lib/assert.ts` | `tests/state.test.ts` | A catastrophic pattern returns in under 500 ms instead of 71 s (SEC-009). | Verified |
| FR-10 | `scripts/csp.mjs`, `scripts/deploy-pages.mjs` | `tests/csp.test.ts` | Hash and policy tests; published site checked in Chrome after deploy (SEC-001). | Verified |

"Verified" means the behavior was exercised. "Implemented, not verified end to end" means the code exists and its parts are tested, but a real external service or credential was not available.
