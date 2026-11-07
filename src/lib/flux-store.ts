import { create } from "zustand";
import { DECISIONS } from "@/data/decisions";

export type Verdict = "open" | "kept" | "later" | "out";

const KEY = "flow21-flux-v1";

type FluxState = {
  verdict: Record<string, Verdict>;
  hydrate: () => void;
  setVerdict: (id: string, verdict: Verdict) => void;
};

function seed(): Record<string, Verdict> {
  return Object.fromEntries(DECISIONS.map((d) => [d.id, "open" as Verdict]));
}

export const useFlux = create<FluxState>((set, get) => ({
  verdict: seed(),
  hydrate: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, Verdict>;
      set({ verdict: { ...seed(), ...parsed } });
    } catch {
      /* garde la file par défaut */
    }
  },
  setVerdict: (id, verdict) => {
    const next = { ...get().verdict, [id]: verdict };
    set({ verdict: next });
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* mémoire pleine : la session suffit */
    }
  },
}));

export function openCount(verdict: Record<string, Verdict>, toolId?: string) {
  return DECISIONS.filter(
    (d) => (toolId ? d.toolId === toolId : true) && verdict[d.id] !== "kept" && verdict[d.id] !== "out",
  ).length;
}
