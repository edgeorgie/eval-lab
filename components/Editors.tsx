"use client";

import { ASSERTION_LABEL } from "@/lib/types";
import type { Assertion, AssertionType, TestCase, Variant } from "@/lib/types";

const input =
  "w-full rounded-xl border border-line bg-canvas/60 px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-surface focus:shadow-[0_0_0_4px_var(--brand-soft)]";

export function VariantCard({ v, index, canRemove, onChange, onRemove }: { v: Variant; index: number; canRemove: boolean; onChange: (v: Variant) => void; onRemove: () => void }) {
  return (
    <div className="rise group flex flex-col gap-2 rounded-3xl border border-line bg-surface p-4 transition hover:shadow-xl hover:shadow-brand/5" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-soft font-mono text-xs font-bold text-brand">{String.fromCharCode(65 + index)}</span>
        <input value={v.name} onChange={(e) => onChange({ ...v, name: e.target.value })} className="display min-w-0 flex-1 bg-transparent text-lg font-bold outline-none" aria-label="Variant name" />
        {canRemove && (
          <button onClick={onRemove} className="rounded-full px-2 text-lg leading-none text-ink-soft opacity-0 transition hover:text-fail group-hover:opacity-100" aria-label="Remove variant">
            &times;
          </button>
        )}
      </div>
      <textarea value={v.prompt} onChange={(e) => onChange({ ...v, prompt: e.target.value })} rows={5} className={`${input} font-mono text-[12.5px] leading-relaxed`} aria-label="Prompt template" />
      <p className="text-[11px] text-ink-soft">
        Use <code className="rounded bg-canvas px-1 font-mono">{"{{input}}"}</code> where the test input goes.
      </p>
    </div>
  );
}

const TYPES = Object.keys(ASSERTION_LABEL) as AssertionType[];

export function CaseRow({ c, index, onChange, onRemove }: { c: TestCase; index: number; onChange: (c: TestCase) => void; onRemove: () => void }) {
  const setAssertion = (a: Assertion) => onChange({ ...c, assertions: c.assertions.map((x) => (x.id === a.id ? a : x)) });
  return (
    <div className="rise group rounded-3xl border border-line bg-surface p-4" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-start gap-3">
        <span className="mt-2 font-mono text-xs text-ink-soft">{String(index + 1).padStart(2, "0")}</span>
        <textarea value={c.input} onChange={(e) => onChange({ ...c, input: e.target.value })} rows={2} className={`${input} flex-1`} aria-label="Test input" />
        <button onClick={onRemove} className="mt-1 rounded-full px-2 text-lg leading-none text-ink-soft opacity-0 transition hover:text-fail group-hover:opacity-100" aria-label="Remove case">
          &times;
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
        {c.assertions.map((a) => (
          <span key={a.id} className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas/70 py-1 pl-3 pr-1 text-[12.5px]">
            <select
              value={a.type}
              onChange={(e) => setAssertion({ ...a, type: e.target.value as AssertionType })}
              className="bg-transparent text-ink-soft outline-none"
              aria-label="Check type"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{ASSERTION_LABEL[t]}</option>
              ))}
            </select>
            {a.type !== "json" && (
              <input value={a.value} onChange={(e) => setAssertion({ ...a, value: e.target.value })} className="w-28 bg-transparent font-semibold outline-none" aria-label="Check value" />
            )}
            <button onClick={() => onChange({ ...c, assertions: c.assertions.filter((x) => x.id !== a.id) })} className="grid h-5 w-5 place-items-center rounded-full text-ink-soft hover:bg-fail-soft hover:text-fail" aria-label="Remove check">
              &times;
            </button>
          </span>
        ))}
        <button
          onClick={() => onChange({ ...c, assertions: [...c.assertions, { id: crypto.randomUUID(), type: "contains", value: "" }] })}
          className="rounded-full border border-dashed border-ink-soft/40 px-3 py-1 text-[12.5px] text-ink-soft transition hover:border-brand hover:text-brand"
        >
          + check
        </button>
      </div>
    </div>
  );
}
