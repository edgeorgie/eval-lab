import type { Cell, Run } from "./types.ts";

export interface VariantSummary {
  variantId: string;
  passed: number;
  total: number;
  rate: number;
  avgMs: number;
}

export function summarize(cells: Cell[], variantIds: string[]): VariantSummary[] {
  return variantIds.map((id) => {
    const mine = cells.filter((c) => c.variantId === id);
    const passed = mine.filter((c) => c.pass).length;
    return {
      variantId: id,
      passed,
      total: mine.length,
      rate: mine.length ? passed / mine.length : 0,
      avgMs: mine.length ? Math.round(mine.reduce((s, c) => s + c.ms, 0) / mine.length) : 0,
    };
  });
}

export interface Delta {
  variantId: string;
  caseId: string;
}

export interface RunDiff {
  regressions: Delta[];
  fixes: Delta[];
}

/** Compares cells that exist in both runs (matched by variant name and case input) to flag what broke or got fixed. */
export function diffRuns(prev: Run, next: Run): RunDiff {
  const key = (r: Run, c: Cell) => {
    const v = r.variants.find((x) => x.id === c.variantId);
    const t = r.cases.find((x) => x.id === c.caseId);
    return v && t ? `${v.name}\u0000${t.input}` : "";
  };
  const before = new Map(prev.cells.map((c) => [key(prev, c), c.pass]));
  const diff: RunDiff = { regressions: [], fixes: [] };
  for (const c of next.cells) {
    const was = before.get(key(next, c));
    if (was === undefined) continue;
    if (was && !c.pass) diff.regressions.push({ variantId: c.variantId, caseId: c.caseId });
    if (!was && c.pass) diff.fixes.push({ variantId: c.variantId, caseId: c.caseId });
  }
  return diff;
}

export function exportRun(run: Run): string {
  return JSON.stringify(run, null, 2);
}
