import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { AgentTalk } from "@/components/holo/AgentTalk";
import { DECISIONS } from "@/data/decisions";
import { GROUPS, TOOLS, type FlowTool } from "@/data/tools";
import { agentForTool } from "@/lib/agents";
import { openCount, useFlux } from "@/lib/flux-store";
import { useHolo } from "@/lib/holo-store";

function matches(tool: FlowTool, q: string) {
  if (!q) return true;
  const hay = `${tool.name} ${tool.group} ${tool.line} ${tool.key}`.toLowerCase();
  return hay.includes(q);
}

function Brief({ toolId }: { toolId: string }) {
  const verdict = useFlux((s) => s.verdict);
  const setVerdict = useFlux((s) => s.setVerdict);
  const items = DECISIONS.filter((d) => d.toolId === toolId);
  const live = items.filter((d) => verdict[d.id] !== "kept" && verdict[d.id] !== "out");
  const done = items.length - live.length;

  if (live.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        Rien à trancher. {done > 0 ? `${done} déjà décidée${done > 1 ? "s" : ""}.` : "L’agent se tait."}
      </p>
    );
  }

  return (
    <ul className="mt-4 flex max-h-64 flex-col gap-3 overflow-y-auto">
      {live.map((d) => (
        <li key={d.id} className="rounded-xl border border-line bg-surface px-3 py-3">
          <p className="text-xs font-medium tracking-widest text-amber uppercase">{d.tag}</p>
          <p className="mt-1 text-sm font-medium">{d.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{d.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setVerdict(d.id, "kept")} className="min-h-11 rounded-lg bg-amber px-3 text-xs font-semibold text-bg">
              Garder
            </button>
            <button type="button" onClick={() => setVerdict(d.id, "later")} className="min-h-11 rounded-lg border border-line px-3 text-xs text-fg">
              Plus tard
            </button>
            <button type="button" onClick={() => setVerdict(d.id, "out")} className="min-h-11 rounded-lg px-3 text-xs text-muted">
              Écarter
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ModeSwitch(props: { mode: "holo" | "saas"; onMode: (mode: "holo" | "saas") => void }) {
  return (
    <div className="flex rounded-lg border border-line p-1">
      {(["holo", "saas"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={props.mode === item}
          onClick={() => props.onMode(item)}
          className={`min-h-11 rounded-md px-3 text-sm ${props.mode === item ? "bg-amber font-semibold text-bg" : "text-muted"}`}
        >
          {item === "holo" ? "Holo" : "SaaS"}
        </button>
      ))}
    </div>
  );
}

export function Deck() {
  const query = useHolo((s) => s.query);
  const setQuery = useHolo((s) => s.setQuery);
  const selectedId = useHolo((s) => s.selectedId);
  const select = useHolo((s) => s.select);
  const mode = useHolo((s) => s.mode);
  const setMode = useHolo((s) => s.setMode);
  const verdict = useFlux((s) => s.verdict);
  const hydrate = useFlux((s) => s.hydrate);
  const inputRef = useRef<HTMLInputElement>(null);
  const q = query.trim().toLowerCase();
  const waiting = openCount(verdict);
  const selected = TOOLS.find((t) => t.id === selectedId) ?? TOOLS[0];
  const visible = useMemo(() => TOOLS.filter((t) => matches(t, q)), [q]);

  useEffect(() => {
    hydrate();
    try {
      const saved = localStorage.getItem("flow-mode");
      if (saved === "saas" || saved === "holo") setMode(saved);
    } catch {
      /* mémoire indisponible */
    }
  }, [hydrate, setMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Escape") inputRef.current?.blur();
        return;
      }
      if (e.key === "/" || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const index = TOOLS.findIndex((t) => t.id === selectedId);
        const step = e.key === "ArrowRight" ? 1 : -1;
        const next = TOOLS[(index + step + TOOLS.length) % TOOLS.length];
        if (next) select(next.id);
        return;
      }
      const hit = TOOLS.find((t) => t.key.toLowerCase() === e.key.toLowerCase());
      if (hit) select(hit.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [select, selectedId]);

  useEffect(() => {
    if (visible.length === 1 && visible[0] && visible[0].id !== selectedId) {
      select(visible[0].id);
    }
  }, [visible, selectedId, select]);

  if (mode === "saas") {
    return (
      <div className="absolute inset-0 flex flex-col bg-bg">
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber text-sm font-bold text-bg">F</div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-tight">Flow</p>
            <p className="text-xs text-muted">{waiting} à trancher</p>
          </div>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Chercher un outil</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher un outil"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-amber"
            />
          </label>
          <Link to="/chasse" className="hidden min-h-11 items-center text-sm text-amber sm:inline-flex">
            Truffe
          </Link>
          <ModeSwitch mode={mode} onMode={setMode} />
        </header>
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-60 shrink-0 flex-col gap-5 overflow-y-auto border-r border-line p-3 md:flex">
            {GROUPS.map((group) => {
              const tools = TOOLS.filter((t) => t.group === group && matches(t, q));
              if (!tools.length) return null;
              return (
                <section key={group}>
                  <p className="mb-1 px-2 text-xs tracking-widest text-muted uppercase">{group}</p>
                  <ul className="flex flex-col">
                    {tools.map((tool) => {
                      const on = tool.id === selected?.id;
                      const n = openCount(verdict, tool.id);
                      return (
                        <li key={tool.id}>
                          <button
                            type="button"
                            onClick={() => select(tool.id)}
                            aria-current={on ? "page" : undefined}
                            className={`flex min-h-11 w-full items-center justify-between rounded-lg px-2 text-left text-sm ${on ? "bg-surface text-fg" : "text-muted"}`}
                          >
                            {tool.name}
                            <span className={n > 0 ? "text-amber" : "text-muted"}>{n > 0 ? n : tool.key}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </aside>
          <div className="min-w-0 flex-1 overflow-y-auto">
            <div className="flex gap-2 overflow-x-auto border-b border-line px-3 py-2 md:hidden">
              {visible.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => select(tool.id)}
                  className={`min-h-11 shrink-0 rounded-lg px-3 text-sm ${tool.id === selected?.id ? "bg-amber text-bg" : "bg-surface"}`}
                >
                  {tool.name}
                </button>
              ))}
            </div>
            {selected ? (
              <article className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-widest text-amber uppercase">{selected.group}</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">{selected.name}</h1>
                    <p className="mt-2 text-sm text-muted">{selected.line}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={selected.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-amber px-4 text-sm font-semibold text-bg">
                      Ouvrir
                    </a>
                    {selected.id === "truffe" ? (
                      <Link to="/chasse" className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm">
                        L’app
                      </Link>
                    ) : null}
                  </div>
                </div>
                {agentForTool(selected.id) ? <AgentTalk agent={agentForTool(selected.id)!} /> : null}
                <Brief toolId={selected.id} />
              </article>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      <header className="pointer-events-auto flex items-center gap-3 px-4 pt-4 sm:px-6">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber text-sm font-bold text-bg">F</div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold tracking-tight">Flow</p>
          <p className="text-xs text-muted">{waiting} à trancher</p>
        </div>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Chercher un outil</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher, ou touche une lettre"
            className="w-full rounded-xl border border-line bg-elev/80 px-4 py-3 text-sm text-fg outline-none backdrop-blur-md placeholder:text-muted focus:border-amber"
          />
        </label>
        <Link to="/chasse" className="hidden min-h-11 items-center text-sm text-amber sm:inline-flex">
          Truffe
        </Link>
        <ModeSwitch mode={mode} onMode={setMode} />
      </header>
      <div className="flex-1" />
      <div className="pointer-events-auto mx-auto w-full max-w-3xl px-3 pb-3">
        {selected ? (
          <section className="mb-2 max-h-[42dvh] overflow-y-auto rounded-2xl border border-line bg-elev/85 p-4 backdrop-blur-md">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs tracking-widest text-amber uppercase">{selected.group}</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{selected.name}</h2>
                <p className="mt-1 max-w-md text-sm text-muted">{selected.line}</p>
              </div>
              <a href={selected.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-xl bg-amber px-4 text-sm font-semibold text-bg">
                Ouvrir
              </a>
            </div>
            <p className="mt-2 text-xs text-muted">Lettre {selected.key}. Flèches pour changer de station.</p>
            {agentForTool(selected.id) ? <AgentTalk agent={agentForTool(selected.id)!} /> : null}
            <Brief toolId={selected.id} />
          </section>
        ) : null}
        <nav className="flex gap-4 overflow-x-auto rounded-2xl border border-line bg-elev/80 p-2 backdrop-blur-md" aria-label="Stations">
          {GROUPS.map((group) => {
            const tools = TOOLS.filter((t) => t.group === group && matches(t, q));
            if (tools.length === 0) return null;
            return (
              <div key={group} className="flex shrink-0 items-center gap-1">
                <p className="px-2 text-xs tracking-widest text-muted uppercase">{group}</p>
                {tools.map((tool) => {
                  const on = tool.id === selected?.id;
                  const n = openCount(verdict, tool.id);
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => select(tool.id)}
                      aria-current={on ? "true" : undefined}
                      className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm ${on ? "bg-amber text-bg" : "text-fg"}`}
                    >
                      {tool.name}
                      <span className={on ? "text-bg/70" : "text-muted"}>{n > 0 ? n : tool.key}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
