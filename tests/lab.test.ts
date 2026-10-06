import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, parseJudge, wordCount } from "../lib/assert.ts";
import { renderPrompt, runMatrix } from "../lib/runner.ts";
import { diffRuns, summarize } from "../lib/history.ts";
import { SAMPLE_CASES, SAMPLE_VARIANTS, demoModel } from "../lib/demo.ts";
import type { Run } from "../lib/types.ts";

test("assertions evaluate deterministically", () => {
  assert.equal(evaluate({ id: "x", type: "contains", value: "Refund" }, "we process a refund").pass, true);
  assert.equal(evaluate({ id: "x", type: "not_contains", value: "sorry" }, "so sorry").pass, false);
  assert.equal(evaluate({ id: "x", type: "regex", value: "^hi\\b" }, "Hi there").pass, true);
  assert.equal(evaluate({ id: "x", type: "regex", value: "(" }, "x").detail.startsWith("invalid"), true);
  assert.equal(evaluate({ id: "x", type: "json", value: "" }, '```json\n{"a":1}\n```').pass, true);
  assert.equal(evaluate({ id: "x", type: "json", value: "" }, "nope").pass, false);
  assert.equal(evaluate({ id: "x", type: "max_words", value: "3" }, "one two three four").pass, false);
  assert.equal(wordCount("  a  b "), 2);
  assert.equal(parseJudge(" yes."), true);
  assert.equal(parseJudge("No"), false);
});

test("renderPrompt substitutes or appends the input", () => {
  assert.equal(renderPrompt("Say: {{input}}!", "hi"), "Say: hi!");
  assert.equal(renderPrompt("Say it", "hi"), "Say it\n\nhi");
});

test("runMatrix runs every cell, reports progress and applies judge assertions", async () => {
  let seen = 0;
  const cells = await runMatrix({ variants: SAMPLE_VARIANTS, cases: SAMPLE_CASES, model: demoModel, concurrency: 4, onCell: () => seen++ });
  assert.equal(cells.length, 12);
  assert.equal(seen, 12);
  const summary = summarize(cells, SAMPLE_VARIANTS.map((v) => v.id));
  assert.equal(summary[0].passed, 0);
  assert.equal(summary[1].passed, 4);
  assert.ok(summary[2].passed < summary[1].passed);
});

test("a failing model call becomes an errored cell, not a crash", async () => {
  const cells = await runMatrix({
    variants: [SAMPLE_VARIANTS[0]],
    cases: [SAMPLE_CASES[0]],
    model: async () => {
      throw new Error("429");
    },
  });
  assert.equal(cells[0].pass, false);
  assert.equal(cells[0].error, "429");
});

test("diffRuns flags regressions and fixes by variant name and input", () => {
  const mk = (id: string, passes: boolean[]): Run => ({
    id,
    createdAt: "",
    model: "m",
    variants: [{ id: `${id}v`, name: "A", prompt: "" }],
    cases: passes.map((_, i) => ({ id: `${id}c${i}`, input: `in${i}`, assertions: [] })),
    cells: passes.map((p, i) => ({ variantId: `${id}v`, caseId: `${id}c${i}`, output: "", results: [], pass: p, ms: 1 })),
  });
  const d = diffRuns(mk("p", [true, false, true]), mk("n", [false, true, true]));
  assert.equal(d.regressions.length, 1);
  assert.equal(d.fixes.length, 1);
});
