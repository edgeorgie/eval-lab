# Traceability: eval-lab

Every requirement maps to implementation files and to tests or manual evidence. `npm run spec:check` enforces that each requirement has an implementation, that files exist, and that there is a test or a manual note.

| Requirement | Implementation | Tests | Evidence | Status |
|---|---|---|---|---|
| FR-1 | `lib/assert.ts` | `tests/lab.test.ts` | PR 1: assertion tests. | Verified |
| FR-2 | `lib/runner.ts` | `tests/lab.test.ts` | PR 1: runner and error tests. | Verified |
| FR-3 | `lib/assert.ts`, `lib/runner.ts` | `tests/lab.test.ts` | PR 1: judge parsing and demo-model run. | Verified |
| FR-4 | `lib/history.ts`, `app/page.tsx` | `tests/lab.test.ts` | PR 1: diff test; in Chrome, breaking the winning variant flagged four regressions. | Verified |
| FR-5 | `lib/diff.ts`, `components/Drawer.tsx` | `tests/diffcost.test.ts` | PR 2: diff tests; verified in Chrome. | Verified |
| FR-6 | `lib/cost.ts`, `app/page.tsx` | `tests/diffcost.test.ts` | PR 2: estimate tests. Prices are rough and must be rechecked. | Verified |
| FR-7 | `lib/demo.ts` | `tests/lab.test.ts` | PR 1: sample run scored 0, 100 and 50 percent in Chrome. | Verified |

"Verified" means the behavior was exercised. "Implemented, not verified end to end" means the code exists and its parts are tested, but a real external service or credential was not available.
