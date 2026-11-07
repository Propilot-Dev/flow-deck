import { create } from "zustand";
import { TOOLS } from "@/data/tools";

type HoloState = {
  query: string;
  selectedId: string;
  mode: "holo" | "saas";
  setQuery: (query: string) => void;
  select: (id: string) => void;
  setMode: (mode: "holo" | "saas") => void;
};

export const useHolo = create<HoloState>((set) => ({
  query: "",
  selectedId: TOOLS[0]?.id ?? "hub",
  mode: "holo",
  setQuery: (query) => set({ query }),
  select: (id) => set({ selectedId: id, query: "" }),
  setMode: (mode) => {
    set({ mode });
    try {
      localStorage.setItem("flow-mode", mode);
    } catch {
      /* mémoire indisponible */
    }
  },
}));
