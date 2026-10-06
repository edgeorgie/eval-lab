"use client";

import { useEffect } from "react";
import type { Cell, TestCase, Variant } from "@/lib/types";
import { ASSERTION_LABEL } from "@/lib/types";

export default function Drawer({ cell, variant, testCase, onClose }: { cell: Cell; variant: Variant; testCase: TestCase; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/25 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        className="slide-in h-full w-full max-w-md overflow-y-auto bg-surface p-7 shadow-2xl"
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

        <div className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${cell.pass ? "bg-pass-soft text-pass" : "bg-fail-soft text-fail"}`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          {cell.pass ? "Passed" : cell.error ? "Errored" : "Failed"} <span className="font-mono text-xs font-normal opacity-70">{cell.ms} ms</span>
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-ink-soft">Model output</p>
        <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-canvas p-4 text-[15px] leading-relaxed">{cell.error ? cell.error : cell.output || "(empty)"}</p>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-ink-soft">Checks</p>
        <ul className="mt-2 space-y-2">
          {testCase.assertions.map((a) => {
            const r = cell.results.find((x) => x.assertionId === a.id);
            return (
              <li key={a.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2 text-sm">
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white ${r?.pass ? "bg-pass" : "bg-fail"}`}>
                  {r?.pass ? "✓" : "✕"}
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
