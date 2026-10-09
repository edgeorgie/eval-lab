#!/usr/bin/env node
// eval-lab CLI — runs a prompt-variant eval suite from a JSON config and
// exits non-zero on failed cells or detected regressions, so CI can gate on it.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { runMatrix } from "../src/lib/runner.mjs";
import { summarize, diffRuns } from "../src/lib/history.mjs";
import { demoModel } from "../src/lib/demo.mjs";
import { complete, PROVIDERS } from "../src/lib/llm.mjs";

/** Runs an arbitrary local command as the "model": the eval case's rendered prompt is written
 * to the child's stdin as JSON `{ system, prompt }`, and the child's trimmed stdout is used as
 * the model output. Lets eval-lab exercise a repo's OWN deterministic/heuristic logic (e.g. a
 * classifier script) as a real eval subject, with zero API key and zero network calls. */
export function execModel(command) {
  return (system, prompt) =>
    new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true });
      let out = "";
      let err = "";
      child.stdout.on("data", (d) => (out += d));
      child.stderr.on("data", (d) => (err += d));
      child.on("error", reject);
      child.on("close", (code) => {
        if (code !== 0) return reject(new Error(`exec model command exited ${code}: ${err.trim() || "(no stderr)"}`));
        resolve(out.trim());
      });
      child.stdin.write(JSON.stringify({ system: system ?? null, prompt }));
      child.stdin.end();
    });
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function resolveModel(name, execCmd) {
  if (!name || name === "demo") return { fn: demoModel, label: "Demo model (offline, no API key)" };
  if (name === "exec") {
    if (!execCmd) throw new Error('--model exec requires --exec-cmd "<command>" (reads {"system","prompt"} JSON on stdin, writes output to stdout).');
    return { fn: execModel(execCmd), label: `exec: ${execCmd}` };
  }
  if (name === "anthropic" || name === "openai") {
    const envVar = PROVIDERS[name].envVar;
    const key = process.env[envVar];
    if (!key) {
      throw new Error(`--model ${name} requires the ${envVar} environment variable to be set.`);
    }
    return {
      fn: (system, prompt) => complete(name, key, system ?? "", prompt, 600),
      label: PROVIDERS[name].model,
    };
  }
  throw new Error(`Unknown model "${name}". Use "demo", "anthropic" or "openai".`);
}

async function loadConfig(configPath) {
  const raw = await readFile(configPath, "utf8");
  const config = JSON.parse(raw);
  if (!Array.isArray(config.variants) || config.variants.length === 0) {
    throw new Error("config.variants must be a non-empty array");
  }
  if (!Array.isArray(config.cases) || config.cases.length === 0) {
    throw new Error("config.cases must be a non-empty array");
  }
  return config;
}

function printMatrix(variants, cases, cells, summary) {
  console.log("");
  console.log("Results:");
  for (const v of variants) {
    const s = summary.find((x) => x.variantId === v.id);
    const rate = s ? `${s.passed}/${s.total}` : "0/0";
    console.log(`  ${v.name.padEnd(28)} ${rate} passed  (avg ${s?.avgMs ?? 0}ms)`);
  }
  console.log("");
  for (const cell of cells) {
    if (cell.pass) continue;
    const v = variants.find((x) => x.id === cell.variantId);
    const c = cases.find((x) => x.id === cell.caseId);
    const failedChecks = cell.results.filter((r) => !r.pass).map((r) => r.detail).join("; ");
    console.log(`  FAIL  ${v?.name ?? cell.variantId} × ${c?.id ?? cell.caseId}: ${cell.error ?? failedChecks}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (command !== "run" || args.help) {
    console.log(`eval-lab — prompt variant evals with deterministic checks + an LLM judge.

Usage:
  eval-lab run --config eval.config.json [options]

Options:
  --config <path>     Path to the eval config JSON (required)
  --model <name>      "demo" (default, no API key), "anthropic", "openai", or "exec"
  --exec-cmd <cmd>    Shell command to run as the model when --model exec (receives
                      {"system","prompt"} JSON on stdin, must print output to stdout)
  --baseline <path>   Path to a previous run's JSON output; fails on regression
  --out <path>        Write the run result JSON to this path
  --fail-on-regression  Exit non-zero if any case regressed vs --baseline (default: true)
  --help              Show this help
`);
    process.exit(command === "run" ? 0 : 1);
  }

  const configPath = args.config;
  if (!configPath) {
    console.error("Error: --config <path> is required.");
    process.exit(2);
  }

  const config = await loadConfig(configPath);
  const modelName = typeof args.model === "string" ? args.model : config.model ?? "demo";
  const execCmd = typeof args["exec-cmd"] === "string" ? args["exec-cmd"] : config.execCmd;
  const { fn: model, label } = resolveModel(modelName, execCmd);

  console.log(`eval-lab: running ${config.variants.length} variant(s) × ${config.cases.length} case(s) with ${label}`);

  const cells = await runMatrix({ variants: config.variants, cases: config.cases, model });
  const summary = summarize(cells, config.variants.map((v) => v.id));
  printMatrix(config.variants, config.cases, cells, summary);

  const run = {
    id: `run-${Date.now()}`,
    createdAt: new Date().toISOString(),
    model: label,
    variants: config.variants,
    cases: config.cases,
    cells,
  };

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, JSON.stringify(run, null, 2));
    console.log(`\nWrote run output to ${args.out}`);
  }

  let regressions = [];
  if (args.baseline && existsSync(args.baseline)) {
    const baseline = JSON.parse(await readFile(args.baseline, "utf8"));
    const diff = diffRuns(baseline, run);
    regressions = diff.regressions;
    console.log(`\nCompared with baseline ${args.baseline}:`);
    console.log(`  ${diff.regressions.length} regression(s), ${diff.fixes.length} fix(es).`);
  } else if (args.baseline) {
    console.log(`\nNo baseline found at ${args.baseline} (first run) — skipping regression check.`);
  }

  const failedCells = cells.filter((c) => !c.pass);
  const failOnRegression = args["fail-on-regression"] !== "false" && args["fail-on-regression"] !== false;

  console.log("");
  if (failedCells.length > 0) {
    console.log(`eval-lab: ${failedCells.length} of ${cells.length} cells failed.`);
  } else {
    console.log(`eval-lab: all ${cells.length} cells passed.`);
  }

  if (failedCells.length > 0 || (failOnRegression && regressions.length > 0)) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`eval-lab: ${err.message}`);
    process.exitCode = 1;
  });
}
