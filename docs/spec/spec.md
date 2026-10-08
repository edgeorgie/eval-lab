# Specification: eval-lab

Compare prompt variants against test cases and catch regressions between runs.

## Baseline

This specification describes the behavior verified for the 0.1.0 baseline (2026-10-06) and is the source of truth from here on. Every change starts in this document and follows the workflow in `AGENTS.md`.

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
- Given a run in which any call failed, then it is shown with the failure message but is not saved, not compared, has no BEST badge and no cost line.

### FR-5 Side by side output diff

Status: Verified.

- Given two variants on one case, then a word-level diff and similarity percentage are shown.

### FR-6 Cost estimate

Status: Verified.

- Given a suite and a model, then the number of calls and an estimated cost are shown before and after a run, using rough list prices.

### FR-7 Offline demo model

Status: Verified.

- Given the demo mode, then the sample suite runs with no key and produces differing pass rates across variants.

### FR-8 Provider keys kept in the session by default

Status: Verified.

- Given a provider key, then it is kept in sessionStorage for the tab by default, kept on the device only when the user ticks "Remember on this device", and removable with "Clear key"; keys are never part of the saved lab state.
- Given saved lab state with an unexpected shape or oversized fields, then it is ignored instead of applied.

### FR-9 Costly regex assertions are refused

Status: Verified.

- Given a regex assertion with nested quantifiers or more than 300 characters, then it fails with a clear message instead of running.

### FR-10 Content Security Policy on the static export

Status: Verified.

- Given the Pages export, then every page carries a Content-Security-Policy meta tag that allows scripts only from the site and from the hashes of its inline scripts, and connections only to the site, api.anthropic.com and api.openai.com.

## Open risks

- Judge checks add model calls and cost.
- List prices change; estimates carry a disclaimer.
