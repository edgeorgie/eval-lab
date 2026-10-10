// Ported from ../../../lib/llm.ts for Node — same providers, key read from env vars
// instead of the browser keystore. Only used when --model is not "demo".

export const PROVIDERS = {
  anthropic: { label: "Anthropic", model: "claude-haiku-4-5-20251001", envVar: "ANTHROPIC_API_KEY" },
  openai: { label: "OpenAI", model: "gpt-4o-mini", envVar: "OPENAI_API_KEY" },
};

export async function complete(provider, apiKey, system, prompt, maxTokens = 900) {
  const model = PROVIDERS[provider].model;
  if (provider === "anthropic") {
    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        // Org-scoped keys (not scoped to a workspace) need this header or
        // Anthropic returns a 400. Harmless to omit for workspace-scoped keys.
        ...(workspaceId ? { "anthropic-workspace-id": workspaceId } : {}),
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) throw providerError("Anthropic", res.status);
    const j = await res.json();
    return j.content.map((c) => c.text ?? "").join("");
  }
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw providerError("OpenAI", res.status);
  const j = await res.json();
  return j.choices[0]?.message.content ?? "";
}

export function providerError(label, status) {
  const hint =
    status === 401 || status === 403
      ? "Check your API key."
      : status === 429
        ? "Rate limit reached. Wait a moment and retry."
        : status >= 500
          ? "The provider is having problems. Try again later."
          : "The provider rejected the request.";
  return new Error(`${label} error ${status}. ${hint}`);
}
