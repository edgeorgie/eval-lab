import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluate } from "../lib/assert.ts";
import { parseStoredState } from "../lib/state.ts";

const good = { variants: [{ id: "v", name: "A", prompt: "{{input}}" }], cases: [{ id: "c", input: "x", assertions: [{ id: "a", type: "contains", value: "y" }] }], mode: "demo", runs: [] };

test("a well formed saved state is restored", () => {
  assert.deepEqual(parseStoredState(JSON.stringify(good))?.variants, good.variants);
});

test("malformed or oversized state is rejected", () => {
  assert.equal(parseStoredState("not json"), null);
  assert.equal(parseStoredState(JSON.stringify({ ...good, variants: [{ id: 1 }] })), null);
  assert.equal(parseStoredState(JSON.stringify({ ...good, cases: [{ id: "c", input: "x".repeat(30_000), assertions: [] }] })), null);
});

test("a regex with nested quantifiers is refused instead of freezing the tab", () => {
  const start = Date.now();
  const r = evaluate({ id: "1", type: "regex", value: "(a+)+$" }, "a".repeat(40) + "b");
  assert.equal(r.pass, false);
  assert.match(r.detail, /too costly/);
  assert.ok(Date.now() - start < 500);
});

test("ordinary regexes still work", () => {
  assert.equal(evaluate({ id: "1", type: "regex", value: String.raw`^\d{3}-\w+$` }, "123-abc").pass, true);
});
