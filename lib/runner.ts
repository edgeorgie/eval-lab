import { JUDGE_SYSTEM, evaluate, judgePrompt, parseJudge } from "./assert.ts";
import type { AssertionResult, Cell, TestCase, Variant } from "./types.ts";

export type ModelFn = (system: string | undefined, prompt: string) => Promise<string>;

export function renderPrompt(template: string, input: string): string {
  return template.includes("{{input}}") ? template.split("{{input}}").join(input) : `${template}\n\n${input}`;
}

export interface RunOptions {
  variants: Variant[];
  cases: TestCase[];
  model: ModelFn;
  concurrency?: number;
  onCell?: (cell: Cell, done: number, total: number) => void;
  signal?: AbortSignal;
}

async function runCell(v: Variant, c: TestCase, model: ModelFn): Promise<Cell> {
  const start = Date.now();
  let output = "";
  try {
    output = await model(undefined, renderPrompt(v.prompt, c.input));
  } catch (e) {
    return { variantId: v.id, caseId: c.id, output: "", results: [], pass: false, ms: Date.now() - start, error: e instanceof Error ? e.message : "Model call failed" };
  }
  const ms = Date.now() - start;
  const results: AssertionResult[] = [];
  for (const a of c.assertions) {
    if (a.type !== "judge") {
      results.push(evaluate(a, output));
      continue;
    }
    try {
      const reply = await model(JUDGE_SYSTEM, judgePrompt(output, a.value));
      results.push({ assertionId: a.id, pass: parseJudge(reply), detail: `judge: ${a.value}` });
    } catch {
      results.push({ assertionId: a.id, pass: false, detail: "judge call failed" });
    }
  }
  return { variantId: v.id, caseId: c.id, output, results, pass: results.every((r) => r.pass), ms };
}

/** Runs every variant against every case with bounded concurrency and reports each cell as it finishes. */
export async function runMatrix({ variants, cases, model, concurrency = 3, onCell, signal }: RunOptions): Promise<Cell[]> {
  const jobs = cases.flatMap((c) => variants.map((v) => ({ v, c })));
  const cells: Cell[] = new Array(jobs.length);
  let next = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
      while (next < jobs.length) {
        if (signal?.aborted) return;
        const i = next++;
        const cell = await runCell(jobs[i].v, jobs[i].c, model);
        cells[i] = cell;
        onCell?.(cell, ++done, jobs.length);
      }
    }),
  );
  return cells.filter(Boolean);
}
