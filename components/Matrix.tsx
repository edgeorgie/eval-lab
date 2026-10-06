"use client";

import Ring from "./Ring";
import type { RunDiff, VariantSummary } from "@/lib/history";
import type { Cell, TestCase, Variant } from "@/lib/types";

interface Props {
  variants: Variant[];
  cases: TestCase[];
  cells: Cell[];
  summary: VariantSummary[];
  diff: RunDiff | null;
  running: boolean;
  onOpen: (cell: Cell) => void;
}

export default function Matrix({ variants, cases, cells, summary, diff, running, onOpen }: Props) {
  const find = (v: string, c: string) => cells.find((x) => x.variantId === v && x.caseId === c);
  const flagged = (v: string, c: string) => diff?.regressions.some((d) => d.variantId === v && d.caseId === c);
  const fixed = (v: string, c: string) => diff?.fixes.some((d) => d.variantId === v && d.caseId === c);
  const hasErrors = cells.some((c) => c.error);
  const best = summary.length ? Math.max(...summary.map((s) => s.rate)) : 0;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[560px] gap-3" style={{ gridTemplateColumns: `minmax(180px,1.2fr) repeat(${variants.length}, minmax(120px,1fr))` }}>
        <div />
        {variants.map((v, i) => {
          const s = summary.find((x) => x.variantId === v.id);
          const winner = s && !hasErrors && s.rate > 0 && s.rate === best && summary.filter((x) => x.rate === best).length === 1;
          return (
            <div key={v.id} className="rise flex flex-col items-center gap-2 rounded-3xl border border-line bg-surface px-3 py-4 text-center" style={{ animationDelay: `${i * 70}ms` }}>
              <Ring value={s?.rate ?? 0} label={`${v.name} pass rate`} />
              <p className="display text-base font-bold leading-tight">{v.name}</p>
              <p className="font-mono text-[11px] text-ink-soft">
                {s?.passed ?? 0}/{s?.total ?? 0} &middot; {s?.avgMs ?? 0} ms
              </p>
              {winner && <span className="rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">best</span>}
            </div>
          );
        })}

        {cases.map((c, r) => (
          <div key={c.id} className="contents">
            <div className="flex items-center pr-2 text-[14px] leading-snug text-ink-soft">
              <span className="mr-2 font-mono text-[11px] opacity-50">{String(r + 1).padStart(2, "0")}</span>
              <span className="line-clamp-2">{c.input}</span>
            </div>
            {variants.map((v, i) => {
              const cell = find(v.id, c.id);
              if (!cell) {
                return (
                  <div key={v.id} className={`h-14 rounded-2xl border border-dashed border-line ${running ? "shimmer" : ""}`} />
                );
              }
              return (
                <button
                  key={v.id}
                  onClick={() => onOpen(cell)}
                  className={`pop group relative h-14 rounded-2xl border text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-lg ${
                    cell.pass ? "border-pass/25 bg-pass-soft text-pass" : "border-fail/25 bg-fail-soft text-fail"
                  }`}
                  style={{ animationDelay: `${(r * variants.length + i) * 25}ms` }}
                  aria-label={`${v.name}, case ${r + 1}: ${cell.pass ? "passed" : "failed"}`}
                >
                  {cell.pass ? "Pass" : cell.error ? "Error" : "Fail"}
                  <span className="ml-2 font-mono text-[10px] font-normal opacity-60">{cell.results.filter((x) => x.pass).length}/{cell.results.length}</span>
                  {flagged(v.id, c.id) && <span className="absolute -right-1 -top-2 rounded-full bg-fail px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">regressed</span>}
                  {fixed(v.id, c.id) && <span className="absolute -right-1 -top-2 rounded-full bg-pass px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">fixed</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
