import { JUDGE_SYSTEM } from "./assert.ts";
import type { ModelFn } from "./runner.ts";
import type { TestCase, Variant } from "./types.ts";

/** An offline, deterministic stand-in for a model so the lab can be tried without an API key. */
export const demoModel: ModelFn = async (system, prompt) => {
  await new Promise((r) => setTimeout(r, 120 + (prompt.length % 7) * 60));
  if (system === JUDGE_SYSTEM) {
    const criterion = (prompt.match(/Criterion: (.*)/)?.[1] ?? "").toLowerCase();
    const output = (prompt.split('"""')[1] ?? "").toLowerCase();
    const words = criterion.split(/\W+/).filter((w) => w.length > 4);
    return /sorry|understand|apolog/.test(output) && words.length > 0 ? "YES" : "NO";
  }
  const lower = prompt.toLowerCase();
  const input = prompt.trim().split("\n").pop() ?? "";
  const friendly = lower.includes("friendly");
  const formal = lower.includes("formal");
  const concise = lower.includes("concise");
  if (!friendly && !formal) return "Thank you for contacting us. We will look into your request.";
  const greeting = friendly ? "Hi there! " : "Dear customer, we sincerely thank you for your correspondence. ";
  let core = "Thanks for the details, we are on it.";
  const text = input.toLowerCase();
  if (/broken|refund/.test(text)) core = "I'm sorry about that, we will process a refund right away.";
  else if (/password/.test(text)) core = "You can reset your password from the login page in a minute.";
  else if (/charged|twice/.test(text)) core = "Sorry about the double charge, I understand how frustrating that is. We are fixing it now.";
  else if (/cancel/.test(text)) core = "Understood, you can cancel anytime from your account settings.";
  const filler = concise ? "" : " Please be assured that our team follows a thorough internal process for every case and will keep you informed at each stage until the matter is fully resolved to your complete satisfaction.";
  return `${greeting}${core}${filler}`;
};

export const SAMPLE_VARIANTS: Variant[] = [
  { id: "v1", name: "Baseline", prompt: "Reply to this customer message:\n{{input}}" },
  { id: "v2", name: "Friendly and concise", prompt: "You are a friendly support agent. Be concise.\nReply to this customer message:\n{{input}}" },
  { id: "v3", name: "Formal", prompt: "You are a formal support agent.\nReply to this customer message:\n{{input}}" },
];

export const SAMPLE_CASES: TestCase[] = [
  {
    id: "c1",
    input: "My order arrived broken and I want a refund.",
    assertions: [
      { id: "a1", type: "contains", value: "refund" },
      { id: "a2", type: "max_words", value: "40" },
    ],
  },
  {
    id: "c2",
    input: "How do I reset my password?",
    assertions: [
      { id: "a3", type: "contains", value: "reset" },
      { id: "a4", type: "max_words", value: "40" },
    ],
  },
  {
    id: "c3",
    input: "You charged me twice!!",
    assertions: [
      { id: "a5", type: "judge", value: "acknowledges the customer's frustration" },
      { id: "a6", type: "not_contains", value: "we will look into your request" },
    ],
  },
  {
    id: "c4",
    input: "Cancel my subscription now.",
    assertions: [{ id: "a7", type: "contains", value: "cancel" }],
  },
];
