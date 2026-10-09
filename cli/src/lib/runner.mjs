// Ported from ../../../lib/runner.ts — the variant/case matrix runner.
import { JUDGE_SYSTEM, evaluate, judgePrompt, parseJudge } from "./assert.mjs";

export function renderPrompt(template, input) {
  return template.includes("{{input}}") ? template.split("{{input}}").join(input) : `${template}\n\n${input}`;
}

async function runCell(v, c, model) {
  const start = Date.now();
  let output = "";
  try {
    output = await model(undefined, renderPrompt(v.prompt, c.input));
  } catch (e) {
    return {
      variantId: v.id,
      caseId: c.id,
      output: "",
      results: [],
      pass: false,
      ms: Date.now() - start,
      error: e instanceof Error ? e.message : "Model call failed",
    };
  }
  const ms = Date.now() - start;
  const results = [];
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
export async function runMatrix({ variants, cases, model, concurrency = 3, onCell, signal }) {
  const jobs = cases.flatMap((c) => variants.map((v) => ({ v, c })));
  const cells = new Array(jobs.length);
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
