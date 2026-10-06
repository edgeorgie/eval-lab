# Specification: eval-lab

Compare prompt variants against test cases and catch regressions between runs.

## Provenance

This project was built with AI assistance. The behavior was implemented and verified first, in the pull requests listed in `tasks.md`. This specification was written afterwards from the verified behavior (reverse specification, 2026-10-06). From this point every change follows the workflow in `AGENTS.md`: specification first, then plan, tasks, implementation and verification.

## Users

Developers tuning prompts who want evidence instead of impressions.

## Goals

- Run every variant against every case with checks and an optional judge.
- Detect regressions between runs.
- Make the cost of a run visible.

## Non-goals

- Hosted result sharing.
- Fine-tuning.

## Requirements

### FR-1 Deterministic checks

Status: Verified.

- Given an output, then contains, not contains, regex, valid JSON and max words evaluate to pass or fail with a detail.

### FR-2 Matrix runner

Status: Verified.

- Given variants and cases, then every cell runs with bounded concurrency, progress is reported, and a failing model call becomes an errored cell.

### FR-3 LLM judge checks

Status: Verified.

- Given a judge criterion, then a model call answers yes or no and the result is recorded as a check.

### FR-4 Run history and regressions

Status: Verified.

- Given two runs, then cells matched by variant name and case input are flagged as regressions or fixes.

### FR-5 Side by side output diff

Status: Verified.

- Given two variants on one case, then a word-level diff and similarity percentage are shown.

### FR-6 Cost estimate

Status: Verified.

- Given a suite and a model, then the number of calls and an estimated cost are shown before and after a run, using rough list prices.

### FR-7 Offline demo model

Status: Verified.

- Given the demo mode, then the sample suite runs with no key and produces differing pass rates across variants.

## Open risks

- Judge checks add model calls and cost.
- List prices change; estimates carry a disclaimer.
