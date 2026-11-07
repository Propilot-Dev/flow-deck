import { createServerFn } from "@tanstack/react-start";
import { collectSourceUrls, offersFromSources, verifiedOffers, type LiveOffer } from "@/lib/hunt-verify";

export type HuntResult =
  | { ok: true; offers: LiveOffer[]; readAt: string }
  | { ok: false; error: string };

function extractJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as { offers?: unknown };
  } catch {
    return null;
  }
}

function outputText(output: unknown): string {
  if (!Array.isArray(output)) return "";
  const bits: string[] = [];
  for (const item of output) {
    const content = (item as { content?: { text?: string }[] }).content;
    if (!Array.isArray(content)) continue;
    for (const block of content) if (typeof block.text === "string") bits.push(block.text);
  }
  return bits.join("\n");
}

export const runHunt = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const payload = input as { query?: unknown; notes?: unknown };
    const query = typeof payload?.query === "string" ? payload.query.trim() : "";
    const notes = Array.isArray(payload?.notes)
      ? payload.notes
          .filter((n): n is string => typeof n === "string")
          .map((n) => n.trim().slice(0, 40))
          .filter(Boolean)
          .slice(0, 6)
      : [];
    if (query.length < 3 || query.length > 180) throw new Error("La recherche est trop courte.");
    return { query, notes };
  })
  .handler(async ({ data }): Promise<HuntResult> => {
    const { env } = await import("@/lib/env.server");
    const key = env("XAI_API_KEY");
    if (!key) return { ok: false, error: "La recherche n'est pas disponible ici." };

    const brief = [
      "Tu es Truffe. Tu fouilles le web et tu ne rapportes que des pages que tu as vraiment lues.",
      `Recherche: ${data.query}`,
      data.notes.length ? `Précisions: ${data.notes.join(" · ")}` : "",
      "Privilégie les annonces et les boutiques, en français ou en Europe si elles existent.",
      "Une seule recherche. Quatre offres maximum. Chaque url doit être exactement une URL renvoyée par cette recherche. N'invente aucun lien, aucun prix, aucun vendeur.",
      'Si le prix n\'est pas écrit, price vaut "Prix sur la page".',
      'Réponds uniquement avec ce JSON: {"offers":[{"title":"","price":"","meta":"","url":""}]}',
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("https://api.x.ai/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env("XAI_MODEL") ?? "grok-4.5",
          input: [{ role: "user", content: brief }],
          tools: [{ type: "web_search" }],
          reasoning: { effort: "low" },
          temperature: 0.2,
          max_output_tokens: 900,
        }),
        signal: AbortSignal.timeout(70000),
      });
      if (!res.ok) return { ok: false, error: "Truffe n'a pas pu lire le web." };
      const body = (await res.json()) as { output?: unknown };
      const sources = collectSourceUrls(body.output);
      const parsed = extractJson(outputText(body.output)) as { offers?: unknown } | null;
      const checked = verifiedOffers(parsed?.offers, sources);
      const offers = checked.length > 0 ? checked : offersFromSources(sources);
      return { ok: true, offers, readAt: new Date().toISOString() };
    } catch {
      return { ok: false, error: "La lecture a été interrompue." };
    }
  });
