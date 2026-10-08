export type AssertionType = "contains" | "not_contains" | "regex" | "json" | "max_words" | "judge";

export interface Assertion {
  id: string;
  type: AssertionType;
  value: string;
}

export interface TestCase {
  id: string;
  input: string;
  assertions: Assertion[];
}

export interface Variant {
  id: string;
  name: string;
  prompt: string;
}

export interface AssertionResult {
  assertionId: string;
  pass: boolean;
  detail: string;
}

export interface Cell {
  variantId: string;
  caseId: string;
  output: string;
  results: AssertionResult[];
  pass: boolean;
  ms: number;
  error?: string;
}

export interface Run {
  id: string;
  createdAt: string;
  model: string;
  variants: Variant[];
  cases: TestCase[];
  cells: Cell[];
}

export const ASSERTION_LABEL: Record<AssertionType, string> = {
  contains: "contains",
  not_contains: "does not contain",
  regex: "matches regex",
  json: "is valid JSON",
  max_words: "max words",
  judge: "judge says yes to",
};
