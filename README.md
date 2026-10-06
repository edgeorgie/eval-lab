# eval-lab

Pit prompt variants against test cases, see which one wins, and catch what breaks before you ship. Everything runs in your browser.

## What it does

- Define up to 4 prompt variants with `{{input}}` placeholders and any number of test cases.
- Attach checks to each case: contains, does not contain, regex, valid JSON, max words, or an LLM judge criterion.
- Run the full matrix: every variant against every case, with bounded concurrency and live progress.
- Read the results as a grid with animated pass rates, latency, and a best-variant badge. Click any cell for the raw output and per-check detail.
- Runs are saved locally. Each new run is compared with the previous one (matched by variant name and case input) and flags regressions and fixes.
- Compare any two variants on the same case side by side, with a word-level diff of their outputs.
- See an estimated cost before you run and after (rough list prices, so treat it as an estimate).
- Export a run as JSON.

## Models

- **Demo (offline)**: a deterministic stand-in so you can try the lab without a key.
- **Anthropic or OpenAI**: bring your own key. It stays in this browser and requests go straight to the provider. A run uses about one model call per cell, plus one per judge check.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm test` runs the assertion, runner and diff tests
- `npm run build` creates a production build

## License

MIT

## How this was built

Spec-driven development with AI assistance. Requirements, plan, tasks, decisions and a requirement-to-code traceability matrix live in [`docs`](docs/spec/spec.md), and [`AGENTS.md`](AGENTS.md) defines the workflow and quality gates. `npm run verify` runs typecheck, lint, the traceability check, tests and the build. The specification is the source of truth for the 0.1.0 baseline; changes start there.
