# BENCHMARKS.md — eval-lab offline demo-model benchmark

Real, locally-measured numbers for the CLI's offline `demo` model (zero API key, zero
cost — no network call is made). This is NOT a benchmark of any real LLM's accuracy;
it measures the eval engine's own correctness and latency stability. See the full
report (with triage-desk comparison) at
https://github.com/edgeorgie/eval-lab (this file) and the sprint-level
RELIABILITY-REPORT.md in the candidate's working notes for cross-artifact context.

## Suite

12 cases × 2 prompt variants = 24 cells, covering refund, password reset, double
charge, cancellation, a neutral question, a bug report, positive feedback, and
reworded duplicates of several of those, against `cli/examples/benchmark.config.json`.

## Results — 3 runs, 24 cells each

| Run | Pass rate | Avg latency/cell (ms) | Min / Max (ms) | Wall-clock (ms) | Cost |
|---|---|---|---|---|---|
| 1 | 100.0% (24/24) | 20.21 | 10 / 35 | 255 | $0 |
| 2 | 100.0% (24/24) | 20.21 | 10 / 35 | 259 | $0 |
| 3 | 100.0% (24/24) | 20.21 | 11 / 36 | 255 | $0 |

Per-variant (identical across all 3 runs): Friendly concise 12/12 (avg 20ms),
Formal 12/12 (avg 20ms).

**Cost field:** the CLI does not currently compute/print a cost estimate. A
cost-estimation module exists (`lib/cost.ts`, token-based USD pricing for Claude
Haiku 4.5 / GPT-4o mini) but is wired into the Next.js web app only, not into
`cli/bin/eval-lab.mjs` or `action.yml`. For this demo-model run the real cost is $0
regardless (no tokens, no API call) — this file does not claim a cost number the CLI
doesn't actually produce.

## Reproduce

```bash
cd cli
node bin/eval-lab.mjs run --config examples/benchmark.config.json --out /tmp/run.json
# cells[].ms = per-cell latency, cells[].pass = pass/fail, run 3x to confirm stability
```

## Limitations

- Offline `demo` model only — no real LLM calls, so this is not evidence about any
  production model's reliability, only about the eval engine's own matrix-running
  correctness and timing stability across repeated runs.
- 12 cases / 2 variants is a modest sample; it stresses assertion-type breadth
  (contains/not_contains/max_words/judge) but isn't a statistically powered benchmark.
