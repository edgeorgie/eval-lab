# eval-lab CLI

The standalone CLI and engine behind [eval-lab](https://github.com/edgeorgie/eval-lab): run prompt-variant evals with deterministic checks and an LLM judge, catch regressions between runs, and gate CI on them — no API key required (there's an offline demo model built in).

## Install

```bash
npx eval-lab run --config eval.config.json
```

or add it as a dev dependency:

```bash
npm install --save-dev eval-lab
```

## Usage

```bash
eval-lab run --config eval.config.json \
  --model demo \
  --baseline previous-run.json \
  --out this-run.json
```

- `--config` (required): path to a JSON file with `variants` and `cases` (see `examples/eval.config.json`).
- `--model`: `demo` (default, offline, no key), `anthropic`, or `openai` (reads `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`).
- `--baseline`: path to a previous run's JSON output. If any case that passed there now fails, the CLI exits non-zero.
- `--out`: write this run's JSON to disk, so it can be the next run's `--baseline`.
- `--fail-on-regression false`: don't fail on regressions, only on hard failures.

Exit code is non-zero if any cell fails or (when `--baseline` is given) a regression is detected — so it can gate a CI job.

## Config format

```json
{
  "model": "demo",
  "variants": [{ "id": "v1", "name": "Baseline", "prompt": "Reply to this customer message:\n{{input}}" }],
  "cases": [
    {
      "id": "c1",
      "input": "My order arrived broken and I want a refund.",
      "assertions": [
        { "id": "a1", "type": "contains", "value": "refund" },
        { "id": "a2", "type": "max_words", "value": "40" }
      ]
    }
  ]
}
```

Assertion types: `contains`, `not_contains`, `regex`, `json`, `max_words`, `judge` (an LLM call that answers yes/no to a criterion).

## This is the same engine as the browser app

`src/lib/*.mjs` is a straight port of `../lib/*.ts` (the Next.js app's engine) to plain Node ESM, so behavior matches the hosted demo at https://eval-lab-wheat.vercel.app exactly.

## License

MIT.
