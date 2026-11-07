import { createServerFn } from "@tanstack/react-start";
import { planLocal, type AgentId, type AgentReply } from "@/lib/agents";

const IDS = ["truffe", "regie", "closer", "terrain"] as const;

const SYSTEM = `Tu es un agent du studio Flow (Paul et Benjamin).
Règles: pas de lien inventé, pas de prix inventé, pas d'annonce inventée. Pas de lien, pas de trouvaille.
Deux questions maximum. Trois cartes maximum, chacune à garder ou à écarter.
Réponds uniquement avec un JSON compact: {"questions":["",""],"plan":"","cards":[{"tag":"","title":"","detail":""}]}`;

function asAgent(value: unknown): AgentId | null {
  return IDS.includes(value as AgentId) ? (value as AgentId) : null;
}

function parseModel(agentId: AgentId, raw: string): Omit<AgentReply, "source"> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const json = JSON.parse(raw.slice(start, end + 1)) as {
      questions?: unknown;
      plan?: unknown;
      cards?: unknown;
    };
    const base = planLocal(agentId, "");
    const questions = Array.isArray(json.questions)
      ? json.questions.filter((q): q is string => typeof q === "string").slice(0, 2)
      : base.questions;
    const cards = Array.isArray(json.cards)
      ? json.cards
          .slice(0, 3)
          .map((card, i) => {
            const c = card as { tag?: unknown; title?: unknown; detail?: unknown };
            return {
              id: `${agentId}-live-${i}`,
              tag: typeof c.tag === "string" ? c.tag.slice(0, 24) : "Carte",
              title: typeof c.title === "string" ? c.title.slice(0, 80) : "À trancher",
              detail: typeof c.detail === "string" ? c.detail.slice(0, 180) : "",
            };
          })
          .filter((c) => c.detail.length > 0)
      : base.cards;
    return {
      name: base.name,
      questions: questions.length > 0 ? questions : base.questions,
      plan: typeof json.plan === "string" ? json.plan.slice(0, 280) : base.plan,
      cards: cards.length > 0 ? cards : base.cards,
    };
  } catch {
    return null;
  }
}

async function callXai(key: string, model: string, agentId: AgentId, brief: string) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Agent: ${agentId}\nBrief: ${brief}` },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("xai");
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(key: string, model: string, agentId: AgentId, brief: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system: SYSTEM,
      messages: [{ role: "user", content: `Agent: ${agentId}\nBrief: ${brief}` }],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("anthropic");
  const json = (await res.json()) as { content?: { text?: string }[] };
  return json.content?.map((c) => c.text ?? "").join("") ?? "";
}

export const askAgent = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const payload = input as { agentId?: unknown; brief?: unknown };
    const agentId = asAgent(payload?.agentId);
    const brief = typeof payload?.brief === "string" ? payload.brief.trim() : "";
    if (!agentId || brief.length < 2 || brief.length > 400) {
      throw new Error("Brief trop court, ou agent inconnu.");
    }
    return { agentId, brief };
  })
  .handler(async ({ data }): Promise<AgentReply> => {
    const local = planLocal(data.agentId, data.brief);
    const { env } = await import("@/lib/env.server");
    const xai = env("XAI_API_KEY");
    const anthropic = env("ANTHROPIC_API_KEY");
    if (!xai && !anthropic) return { ...local, source: "interne" };
    try {
      const raw = xai
        ? await callXai(xai, env("XAI_MODEL") ?? "grok-4", data.agentId, data.brief)
        : await callAnthropic(
            anthropic!,
            env("ANTHROPIC_MODEL") ?? "claude-sonnet-4-5",
            data.agentId,
            data.brief,
          );
      const parsed = parseModel(data.agentId, raw);
      if (!parsed) return { ...local, source: "interne" };
      return { ...parsed, source: xai ? "xai" : "anthropic" };
    } catch {
      return { ...local, source: "interne" };
    }
  });
