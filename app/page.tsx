"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Drawer from "@/components/Drawer";
import { CaseRow, VariantCard } from "@/components/Editors";
import Matrix from "@/components/Matrix";
import { SAMPLE_CASES, SAMPLE_VARIANTS, demoModel } from "@/lib/demo";
import { diffRuns, exportRun, summarize } from "@/lib/history";
import { PROVIDERS, complete } from "@/lib/llm";
import type { Provider } from "@/lib/llm";
import { runMatrix } from "@/lib/runner";
import type { ModelFn } from "@/lib/runner";
import type { Cell, Run, TestCase, Variant } from "@/lib/types";

type Mode = "demo" | Provider;
const STORE = "eval-lab.state.v1";

interface Saved {
  variants: Variant[];
  cases: TestCase[];
  mode: Mode;
  keys: Partial<Record<Provider, string>>;
  runs: Run[];
}

const uid = () => crypto.randomUUID();

export default function Home() {
  const [variants, setVariants] = useState<Variant[]>(SAMPLE_VARIANTS);
  const [cases, setCases] = useState<TestCase[]>(SAMPLE_CASES);
  const [mode, setMode] = useState<Mode>("demo");
  const [keys, setKeys] = useState<Partial<Record<Provider, string>>>({});
  const [runs, setRuns] = useState<Run[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState<Cell | null>(null);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem(STORE);
        if (raw) {
          const s = JSON.parse(raw) as Saved;
          setVariants(s.variants);
          setCases(s.cases);
          setMode(s.mode);
          setKeys(s.keys ?? {});
          setRuns(s.runs ?? []);
          if (s.runs?.length) setCells(s.runs[0].cells);
        }
      } catch {}
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ variants, cases, mode, keys, runs: runs.slice(0, 5) } satisfies Saved));
    } catch {}
  }, [variants, cases, mode, keys, runs, hydrated]);

  const summary = useMemo(() => summarize(cells, variants.map((v) => v.id)), [cells, variants]);
  const diff = useMemo(() => (runs.length >= 2 && cells === runs[0].cells ? diffRuns(runs[1], runs[0]) : null), [runs, cells]);
  const total = variants.length * cases.length;
  const modelLabel = mode === "demo" ? "Demo model" : PROVIDERS[mode].model;

  const model = (): ModelFn | null => {
    if (mode === "demo") return demoModel;
    const key = keys[mode];
    if (!key) return null;
    return (system, prompt) => complete(mode, key, system ?? "", prompt, 600);
  };

  const run = async () => {
    const fn = model();
    if (!fn) {
      setError(`Add your ${PROVIDERS[mode as Provider].label} key below, or switch to the demo model.`);
      return;
    }
    setError("");
    setCells([]);
    setProgress(0);
    setRunning(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const result = await runMatrix({
        variants,
        cases,
        model: fn,
        signal: controller.signal,
        onCell: (cell, done) => {
          setCells((prev) => [...prev, cell]);
          setProgress(done);
        },
      });
      if (!controller.signal.aborted) {
        const newRun: Run = { id: uid(), createdAt: new Date().toISOString(), model: modelLabel, variants, cases, cells: result };
        setRuns((r) => [newRun, ...r]);
        setCells(newRun.cells);
      }
    } finally {
      setRunning(false);
    }
  };

  const download = () => {
    if (!runs[0]) return;
    const url = URL.createObjectURL(new Blob([exportRun(runs[0])], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "eval-run.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openCell = open ? { v: variants.find((x) => x.id === open.variantId), c: cases.find((x) => x.id === open.caseId) } : null;

  return (
    <div className="relative overflow-hidden">
      <div className="blob -left-24 -top-24 h-96 w-96 bg-[#c9d1ff]" />
      <div className="blob right-0 top-40 h-80 w-80 bg-[#ffd9c9]" style={{ animationDelay: "-6s" }} />
      <div className="blob left-1/3 top-[28rem] h-72 w-72 bg-[#c9f2e1]" style={{ animationDelay: "-11s" }} />

      <main className="relative mx-auto max-w-6xl px-6 pb-28 pt-12 sm:px-10">
        <header className="rise flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand">Prompt experiments</p>
            <h1 className="display mt-3 text-6xl font-extrabold leading-[0.95] sm:text-8xl">
              Eval <span className="text-brand">Lab</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-ink-soft">Pit prompt variants against real test cases. See which one wins, and catch what breaks before you ship.</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={running ? () => abort.current?.abort() : run}
              className="group relative overflow-hidden rounded-full bg-ink px-8 py-4 text-base font-semibold text-white shadow-xl shadow-ink/20 transition hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
            >
              {running && <span className="absolute inset-y-0 left-0 bg-brand transition-all duration-300" style={{ width: `${(progress / Math.max(1, total)) * 100}%` }} />}
              <span className="relative">{running ? `Running ${progress}/${total}  ·  Stop` : `Run ${total} checks`}</span>
            </button>
            <p className="font-mono text-xs text-ink-soft">{modelLabel}</p>
          </div>
        </header>
        {error && <p className="mt-4 rounded-2xl bg-fail-soft px-4 py-3 text-sm text-fail">{error}</p>}

        <section className="mt-14">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="display text-3xl font-bold">Results</h2>
            <div className="flex items-center gap-3 text-sm">
              {runs.length > 0 && <span className="font-mono text-xs text-ink-soft">{runs.length} saved run{runs.length > 1 ? "s" : ""}</span>}
              {runs[0] && (
                <button onClick={download} className="rounded-full border border-line bg-surface px-4 py-1.5 transition hover:border-brand hover:text-brand">
                  Export JSON
                </button>
              )}
            </div>
          </div>
          {cells.length === 0 && !running ? (
            <div className="rise grid place-items-center rounded-[2rem] border border-dashed border-ink-soft/30 bg-surface/60 px-6 py-16 text-center">
              <p className="display text-2xl font-bold">Nothing run yet</p>
              <p className="mt-2 max-w-sm text-ink-soft">Press Run to test every prompt variant against every case. The demo model works offline, no key needed.</p>
            </div>
          ) : (
            <Matrix variants={variants} cases={cases} cells={cells} summary={summary} diff={diff} running={running} onOpen={setOpen} />
          )}
          {diff && (
            <p className="rise mt-4 text-sm text-ink-soft">
              Compared with your previous run:{" "}
              <b className={diff.regressions.length ? "text-fail" : "text-ink"}>{diff.regressions.length} regression{diff.regressions.length === 1 ? "" : "s"}</b>,{" "}
              <b className={diff.fixes.length ? "text-pass" : "text-ink"}>{diff.fixes.length} fixed</b>.
            </p>
          )}
        </section>

        <section className="mt-16">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="display text-3xl font-bold">Prompt variants</h2>
            {variants.length < 4 && (
              <button onClick={() => setVariants((v) => [...v, { id: uid(), name: `Variant ${v.length + 1}`, prompt: "{{input}}" }])} className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm transition hover:border-brand hover:text-brand">
                + Add variant
              </button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {variants.map((v, i) => (
              <VariantCard key={v.id} v={v} index={i} canRemove={variants.length > 1} onChange={(nv) => setVariants((all) => all.map((x) => (x.id === v.id ? nv : x)))} onRemove={() => setVariants((all) => all.filter((x) => x.id !== v.id))} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="display text-3xl font-bold">Test cases</h2>
            <button onClick={() => setCases((c) => [...c, { id: uid(), input: "", assertions: [{ id: uid(), type: "contains", value: "" }] }])} className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm transition hover:border-brand hover:text-brand">
              + Add case
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {cases.map((c, i) => (
              <CaseRow key={c.id} c={c} index={i} onChange={(nc) => setCases((all) => all.map((x) => (x.id === c.id ? nc : x)))} onRemove={() => setCases((all) => all.filter((x) => x.id !== c.id))} />
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-line bg-surface p-6">
          <h2 className="display text-2xl font-bold">Model</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["demo", "anthropic", "openai"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === m ? "bg-brand text-white shadow-lg shadow-brand/30" : "bg-canvas text-ink-soft hover:bg-brand-soft hover:text-brand"}`}
              >
                {m === "demo" ? "Demo (offline)" : PROVIDERS[m].label}
              </button>
            ))}
          </div>
          {mode !== "demo" && (
            <div className="mt-4 max-w-md">
              <input
                type="password"
                value={keys[mode] ?? ""}
                onChange={(e) => setKeys((k) => ({ ...k, [mode]: e.target.value }))}
                placeholder={`${PROVIDERS[mode].label} API key`}
                className="w-full rounded-xl border border-line bg-canvas/60 px-3 py-2 text-sm outline-none focus:border-brand focus:shadow-[0_0_0_4px_var(--brand-soft)]"
              />
              <p className="mt-2 text-xs text-ink-soft">Stays in this browser. Requests go straight to the provider. A run of {total} checks uses about {total} model calls, plus one per judge check.</p>
            </div>
          )}
        </section>
      </main>

      {open && openCell?.v && openCell.c && <Drawer cell={open} variant={openCell.v} testCase={openCell.c} onClose={() => setOpen(null)} />}
    </div>
  );
}
