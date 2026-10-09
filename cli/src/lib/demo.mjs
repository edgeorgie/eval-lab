// Ported from ../../../lib/demo.ts — the offline, deterministic stand-in model.
// Needs no API key, so the CLI and GitHub Action can run for free in CI.
import { JUDGE_SYSTEM } from "./assert.mjs";

export const demoModel = async (system, prompt) => {
  await new Promise((r) => setTimeout(r, 10 + (prompt.length % 7) * 5));
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
  const filler = concise
    ? ""
    : " Please be assured that our team follows a thorough internal process for every case and will keep you informed at each stage until the matter is fully resolved to your complete satisfaction.";
  return `${greeting}${core}${filler}`;
};
