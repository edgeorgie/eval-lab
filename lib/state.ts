import type { Run, TestCase, Variant } from "./types.ts";

export interface StoredState {
  variants: Variant[];
  cases: TestCase[];
  mode: string;
  runs: Run[];
}

const isText = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;

function validVariant(v: unknown): v is Variant {
  const o = v as Variant;
  return !!o && isText(o.id, 100) && isText(o.name, 200) && isText(o.prompt, 20_000);
}

function validCase(c: unknown): c is TestCase {
  const o = c as TestCase;
  return !!o && isText(o.id, 100) && isText(o.input, 20_000) && Array.isArray(o.assertions) && o.assertions.every((a) => !!a && isText(a.id, 100) && isText(a.type, 20) && isText(a.value, 2_000));
}

/** Restores saved state only when its shape is sound; anything else is dropped so a bad value cannot reach the UI. */
export function parseStoredState(raw: string): StoredState | null {
  try {
    const s = JSON.parse(raw) as StoredState;
    if (!s || !Array.isArray(s.variants) || !Array.isArray(s.cases) || !s.variants.every(validVariant) || !s.cases.every(validCase)) return null;
    if (s.variants.length === 0 || s.variants.length > 4) return null;
    const runs = Array.isArray(s.runs) ? s.runs.filter((r) => !!r && Array.isArray(r.cells) && Array.isArray(r.variants) && Array.isArray(r.cases)) : [];
    return { variants: s.variants, cases: s.cases, mode: isText(s.mode, 20) ? s.mode : "demo", runs };
  } catch {
    return null;
  }
}
