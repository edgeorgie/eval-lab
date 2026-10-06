import { test } from "node:test";
import assert from "node:assert/strict";
import { similarity, wordDiff } from "../lib/diff.ts";
import { estimateRun, formatUsd, tokensOf } from "../lib/cost.ts";
import { SAMPLE_CASES, SAMPLE_VARIANTS } from "../lib/demo.ts";

test("wordDiff marks additions and deletions and keeps shared words", () => {
  const d = wordDiff("the quick brown fox", "the slow brown fox jumps");
  assert.ok(d.some((s) => s.op === "del" && s.text.includes("quick")));
  assert.ok(d.some((s) => s.op === "add" && s.text.includes("slow")));
  assert.ok(d.some((s) => s.op === "add" && s.text.includes("jumps")));
  assert.equal(d.filter((s) => s.op !== "add").map((s) => s.text).join(""), "the quick brown fox");
  assert.equal(d.filter((s) => s.op !== "del").map((s) => s.text).join(""), "the slow brown fox jumps");
});

test("wordDiff handles identical and empty inputs", () => {
  assert.deepEqual(wordDiff("same text", "same text"), [{ op: "same", text: "same text" }]);
  assert.deepEqual(wordDiff("", ""), []);
  assert.equal(similarity("a b c", "a b c"), 1);
  assert.equal(similarity("a b", "c d"), 0);
  assert.ok(similarity("a b c d", "a b x d") > 0.5);
});

test("estimateRun counts judge calls and scales with price", () => {
  const e = estimateRun(SAMPLE_VARIANTS, SAMPLE_CASES, "claude-haiku-4-5-20251001");
  assert.equal(e.calls, 12 + 3);
  assert.ok(e.usd > 0 && e.usd < 0.05);
  const cheap = estimateRun(SAMPLE_VARIANTS, SAMPLE_CASES, "gpt-4o-mini");
  assert.ok(cheap.usd < e.usd);
  assert.equal(estimateRun(SAMPLE_VARIANTS, SAMPLE_CASES, "demo").usd, 0);
});

test("token and money formatting", () => {
  assert.equal(tokensOf("12345678"), 2);
  assert.equal(formatUsd(0), "$0");
  assert.equal(formatUsd(0.004), "<$0.01");
  assert.equal(formatUsd(0.123), "$0.12");
});
