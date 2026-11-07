import { useState, type FormEvent } from "react";
import { askAgent } from "@/lib/agents.functions";
import type { AgentDef, AgentReply } from "@/lib/agents";

export function AgentTalk({ agent }: { agent: AgentDef }) {
  const [brief, setBrief] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reply, setReply] = useState<AgentReply | null>(null);
  const [kept, setKept] = useState<Record<string, "kept" | "out">>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = brief.trim();
    if (text.length < 2 || pending) return;
    setPending(true);
    setError("");
    try {
      const next = await askAgent({ data: { agentId: agent.id, brief: text } });
      setReply(next);
      setKept({});
    } catch {
      setError("La meute n’a pas répondu. Réessaie.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <p className="text-[11px] font-medium tracking-[0.14em] text-amber uppercase">{agent.name}</p>
      <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-2">
        <label className="sr-only" htmlFor={`brief-${agent.id}`}>
          Brief pour {agent.name}
        </label>
        <textarea
          id={`brief-${agent.id}`}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder={agent.hint}
          rows={2}
          maxLength={400}
          className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:border-amber"
        />
        <button
          type="submit"
          disabled={pending || brief.trim().length < 2}
          className="min-h-11 rounded-xl bg-amber px-4 text-sm font-semibold text-bg disabled:opacity-40"
        >
          {pending ? "Elle cherche…" : agent.verb}
        </button>
      </form>
      {error ? <p className="mt-2 text-xs text-amber">{error}</p> : null}
      {reply ? (
        <div className="mt-3">
          <p className="text-[11px] tracking-[0.12em] text-muted uppercase">
            {reply.source === "interne" ? "File interne" : reply.source === "xai" ? "xAI" : "Anthropic"}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{reply.plan}</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-muted">
            {reply.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <ul className="mt-3 flex flex-col gap-2">
            {reply.cards.map((card) => {
              const state = kept[card.id];
              if (state === "out") return null;
              return (
                <li key={card.id} className="rounded-xl border border-line bg-surface px-3 py-3">
                  <p className="text-[11px] font-medium tracking-[0.14em] text-amber uppercase">{card.tag}</p>
                  <p className="mt-1 text-sm font-medium">{card.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{card.detail}</p>
                  {state === "kept" ? (
                    <p className="mt-2 text-xs text-amber">Gardée</p>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setKept((s) => ({ ...s, [card.id]: "kept" }))}
                        className="min-h-11 rounded-lg bg-amber px-3 text-xs font-semibold text-bg"
                      >
                        Garder
                      </button>
                      <button
                        type="button"
                        onClick={() => setKept((s) => ({ ...s, [card.id]: "out" }))}
                        className="min-h-11 rounded-lg px-3 text-xs text-muted"
                      >
                        Écarter
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted">Sans clé, elle prépare. Elle n’invente pas de liens.</p>
      )}
    </div>
  );
}
