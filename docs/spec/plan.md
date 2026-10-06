# Plan: eval-lab

## Overview

The page calls the runner with the suite and a model function. Cells stream into the matrix. A finished run is compared with the previous one and saved in localStorage.

## Modules

| Path | Responsibility |
|---|---|
| `lib/assert.ts` | Checks and judge helpers |
| `lib/runner.ts` | Matrix execution |
| `lib/history.ts` | Summaries and run diffs |
| `lib/diff.ts` | Word diff |
| `lib/cost.ts` | Estimates |
| `lib/demo.ts` | Offline model and sample suite |
| `components/` | Matrix, ring, drawer, editors |

## Decisions

- [ADR 0001: Model function injected into the runner](../adr/0001-model-function-injected-into-the-runner.md)

## Quality gates

`npm run verify`: typecheck, lint, spec check, tests and production build.
