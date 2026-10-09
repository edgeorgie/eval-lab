import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../src/lib/assert.mjs";
import { runMatrix } from "../src/lib/runner.mjs";
import { diffRuns, summarize } from "../src/lib/history.mjs";
import { demoModel } from "../src/lib/demo.mjs";

test("evaluate: contains / not_contains / max_words / regex / json", () => {
  assert.equal(evaluate({ id: "a", type: "contains", value: "refund" }, "we issue a refund").pass, true);
  assert.equal(evaluate({ id: "a", type: "not_contains", value: "refund" }, "we issue a refund").pass, false);
  assert.equal(evaluate({ id: "a", type: "max_words", value: "3" }, "one two three four").pass, false);
  assert.equal(evaluate({ id: "a", type: "regex", value: "^hi" }, "hi there").pass, true);
  assert.equal(evaluate({ id: "a", type: "json", value: "" }, '{"ok":true}').pass, true);
  assert.equal(evaluate({ id: "a", type: "json", value: "" }, "not json").pass, false);
});

test("demoModel needs no API key and responds deterministically-ish", async () => {
  const out = await demoModel(undefined, "You are a friendly support agent.\nReply to this customer message:\nCancel my subscription now.");
  assert.match(out, /cancel/i);
});

test("runMatrix runs every variant x case and reports pass/fail", async () => {
  const variants = [{ id: "v1", name: "V1", prompt: "You are a friendly support agent.\nReply to this customer message:\n{{input}}" }];
  const cases = [{ id: "c1", input: "Cancel my subscription now.", assertions: [{ id: "a1", type: "contains", value: "cancel" }] }];
  const cells = await runMatrix({ variants, cases, model: demoModel });
  assert.equal(cells.length, 1);
  assert.equal(cells[0].pass, true);
});

test("diffRuns flags a pass-to-fail cell as a regression", () => {
  const variants = [{ id: "v1", name: "V1", prompt: "{{input}}" }];
  const cases = [{ id: "c1", input: "same input", assertions: [] }];
  const prev = { id: "r1", createdAt: "t", model: "demo", variants, cases, cells: [{ variantId: "v1", caseId: "c1", output: "", results: [], pass: true, ms: 1 }] };
  const next = { id: "r2", createdAt: "t", model: "demo", variants, cases, cells: [{ variantId: "v1", caseId: "c1", output: "", results: [], pass: false, ms: 1 }] };
  const diff = diffRuns(prev, next);
  assert.equal(diff.regressions.length, 1);
  assert.equal(diff.fixes.length, 0);
});

test("summarize computes pass rate per variant", () => {
  const cells = [
    { variantId: "v1", caseId: "c1", output: "", results: [], pass: true, ms: 10 },
    { variantId: "v1", caseId: "c2", output: "", results: [], pass: false, ms: 20 },
  ];
  const [s] = summarize(cells, ["v1"]);
  assert.equal(s.passed, 1);
  assert.equal(s.total, 2);
  assert.equal(s.rate, 0.5);
});
