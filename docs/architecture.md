# Architecture

## Data flow

```mermaid
flowchart LR
  V[Variants] --> M[Matrix runner]
  C[Test cases] --> M
  M --> F[Model function]
  F --> O[Output]
  O --> K[Checks and judge]
  K --> G[Results matrix]
  G --> H[History]
  H --> D[Regression diff]
```

## Main sequence

```mermaid
sequenceDiagram
  participant P as Page
  participant R as Runner
  participant M as Model fn
  P->>R: variants, cases
  loop each cell, bounded concurrency
    R->>M: rendered prompt
    M-->>R: output
    R->>M: judge prompt (if needed)
    R-->>P: cell result
  end
  P->>P: compare with previous run
```

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

## Principles

- Pure logic lives in `lib/` and is tested without a browser; components stay thin.
- Network, storage and model replies are validated at the boundary.
- Secrets and user content stay in the browser.

## Decisions

- [Model function injected into the runner](adr/0001-model-function-injected-into-the-runner.md)
