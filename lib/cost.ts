import { renderPrompt } from "./runner.ts";
import type { Cell, TestCase, Variant } from "./types.ts";

// Rough list prices in USD per million tokens. They change often, so treat results as estimates.
export const PRICES: Record<string, { in: number; out: number; label: string }> = {
  "claude-haiku-4-5-20251001": { in: 1, out: 5, label: "Claude Haiku 4.5" },
  "gpt-4o-mini": { in: 0.15, out: 0.6, label: "GPT-4o mini" },
};

/** About four characters per token for English text. */
export function tokensOf(text: string): number {
  return Math.ceil(text.length / 4);
}

export function priceFor(model: string) {
  return PRICES[model] ?? null;
}

export interface Estimate {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  usd: number;
}

/** Estimates the cost of a full matrix run before spending anything. Outputs are assumed to be `expectedOut` tokens. */
export function estimateRun(variants: Variant[], cases: TestCase[], model: string, expectedOut = 150): Estimate {
  const price = priceFor(model);
  let inputTokens = 0;
  let calls = 0;
  for (const c of cases) {
    for (const v of variants) {
      inputTokens += tokensOf(renderPrompt(v.prompt, c.input)) + 20;
      calls++;
      for (const a of c.assertions) {
        if (a.type === "judge") {
          inputTokens += tokensOf(a.value) + expectedOut + 80;
          calls++;
        }
      }
    }
  }
  const outputTokens = calls * (expectedOut / 4 + 4);
  const usd = price ? (inputTokens * price.in + outputTokens * price.out) / 1_000_000 : 0;
  return { calls, inputTokens, outputTokens: Math.round(outputTokens), usd };
}

/** Cost of a finished run from the real outputs. Inputs are re-estimated from the templates. */
export function actualCost(variants: Variant[], cases: TestCase[], cells: Cell[], model: string): number {
  const price = priceFor(model);
  if (!price) return 0;
  let inT = 0;
  let outT = 0;
  for (const cell of cells) {
    const v = variants.find((x) => x.id === cell.variantId);
    const c = cases.find((x) => x.id === cell.caseId);
    if (!v || !c) continue;
    inT += tokensOf(renderPrompt(v.prompt, c.input)) + 20;
    outT += tokensOf(cell.output);
  }
  return (inT * price.in + outT * price.out) / 1_000_000;
}

export function formatUsd(usd: number): string {
  if (usd === 0) return "$0";
  return usd < 0.01 ? "<$0.01" : `$${usd.toFixed(2)}`;
}
