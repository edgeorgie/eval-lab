"use client";

import { useEffect, useMemo, useState } from "react";
import { similarity, wordDiff } from "@/lib/diff";
import type { Cell, TestCase, Variant } from "@/lib/types";
import { ASSERTION_LABEL } from "@/lib/types";

interface Props {
  cell: Cell;
  variant: Variant;
  testCase: TestCase;
  others: { variant: Variant; cell: Cell }[];
  onClose: () => void;
}

export default function Drawer({ cell, variant, testCase, others, onClose }: Props) {
  const [compareId, setCompareId] = useState("");
  const other = others.find((o) => o.variant.id === compareId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const diff = useMemo(() => (other ? wordDiff(cell.output, other.cell.output) : null), [cell.output, other]);
  const same = other ? Math.round(similarity(cell.output, other.cell.output) * 100) : 0;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/25 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        className={`slide-in h-full w-full overflow-y-auto bg-surface p-7 shadow-2xl transition-[max-width] duration-500 ${other ? "max-w-3xl" : "max-w-md"}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Result details"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{variant.name}</p>
            <h3 className="display mt-1 text-2xl font-bold leading-tight">{testCase.input}</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-line px-3 py-1 text-sm hover:bg-canvas" aria-label="Close">
            Esc
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${cell.pass ? "bg-pass-soft text-pass" : "bg-fail-soft text-fail"}`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {cell.pass ? "Passed" : cell.error ? "Errored" : "Failed"} <span className="font-mono text-xs font-normal opacity-70">{cell.ms} ms</span>
          </div>
          {others.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              Compare with
              <select value={compareId} onChange={(e) => setCompareId(e.target.value)} className="rounded-full border border-line bg-canvas px-3 py-1 text-sm text-ink outline-none focus:border-brand">
                <option value="">none</option>
                {others.map((o) => (
                  <option key={o.variant.id} value={o.variant.id}>{o.variant.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {other && diff ? (
          <div className="rise mt-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{same}% of the words match</p>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1.5 text-sm font-semibold">{variant.name} <span className={`ml-1 text-xs ${cell.pass ? "text-pass" : "text-fail"}`}>{cell.pass ? "pass" : "fail"}</span></p>
                <p className="whitespace-pre-wrap rounded-2xl bg-canvas p-4 text-[14.5px] leading-relaxed">
                  {diff.filter((s) => s.op !== "add").map((s, i) => (s.op === "del" ? <mark key={i} className="rounded bg-fail-soft px-0.5 text-fail">{s.text}</mark> : <span key={i}>{s.text}</span>))}
                </p>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-semibold">{other.variant.name} <span className={`ml-1 text-xs ${other.cell.pass ? "text-pass" : "text-fail"}`}>{other.cell.pass ? "pass" : "fail"}</span></p>
                <p className="whitespace-pre-wrap rounded-2xl bg-canvas p-4 text-[14.5px] leading-relaxed">
                  {diff.filter((s) => s.op !== "del").map((s, i) => (s.op === "add" ? <mark key={i} className="rounded bg-pass-soft px-0.5 text-pass">{s.text}</mark> : <span key={i}>{s.text}</span>))}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-ink-soft">Model output</p>
            <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-canvas p-4 text-[15px] leading-relaxed">{cell.error ? cell.error : cell.output || "(empty)"}</p>
          </>
        )}

        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-ink-soft">Checks</p>
        <ul className="mt-2 space-y-2">
          {testCase.assertions.map((a) => {
            const r = cell.results.find((x) => x.assertionId === a.id);
            return (
              <li key={a.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2 text-sm">
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white ${r?.pass ? "bg-pass" : "bg-fail"}`}>
                  {r?.pass ? <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 8.5l3.2 3.2L13 5" /></svg> : <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden><path d="M4 4l8 8M12 4l-8 8" /></svg>}
                </span>
                <span>
                  {ASSERTION_LABEL[a.type]} {a.type === "json" ? "" : <b className="font-semibold">{a.value}</b>}
                </span>
                <span className="ml-auto font-mono text-[11px] text-ink-soft">{r?.detail}</span>
              </li>
            );
          })}
          {testCase.assertions.length === 0 && <li className="text-sm text-ink-soft">No checks defined for this case.</li>}
        </ul>
      </aside>
    </div>
  );
}
