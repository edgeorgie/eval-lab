import type { Assertion, AssertionResult } from "./types.ts";

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** Evaluates one deterministic assertion. Judge assertions are resolved by the runner through a model call. */
export function evaluate(a: Assertion, output: string): AssertionResult {
  const done = (pass: boolean, detail: string): AssertionResult => ({ assertionId: a.id, pass, detail });
  const text = output.toLowerCase();
  switch (a.type) {
    case "contains":
      return done(text.includes(a.value.toLowerCase()), `contains "${a.value}"`);
    case "not_contains":
      return done(!text.includes(a.value.toLowerCase()), `does not contain "${a.value}"`);
    case "regex":
      try {
        return done(new RegExp(a.value, "i").test(output), `matches /${a.value}/`);
      } catch {
        return done(false, `invalid regex /${a.value}/`);
      }
    case "json":
      try {
        JSON.parse(output.trim().replace(/^```(?:json)?\s*|\s*```$/g, ""));
        return done(true, "valid JSON");
      } catch {
        return done(false, "not valid JSON");
      }
    case "max_words": {
      const limit = Number(a.value);
      const n = wordCount(output);
      return done(Number.isFinite(limit) && n <= limit, `${n} words (max ${a.value})`);
    }
    case "judge":
      return done(false, "judge not run");
  }
}

export const JUDGE_SYSTEM = `You are a strict evaluator. Given a model output and a criterion, answer with exactly one word: YES if the output satisfies the criterion, otherwise NO.`;

export function judgePrompt(output: string, criterion: string): string {
  return `Criterion: ${criterion}\n\nOutput to evaluate:\n"""\n${output}\n"""`;
}

export function parseJudge(reply: string): boolean {
  return /^\s*yes\b/i.test(reply);
}
