export type ToolGroup = "Présence" | "Ops" | "Lab";

export type FlowTool = {
  id: string;
  name: string;
  group: ToolGroup;
  line: string;
  href: string;
  key: string;
};

/** Seuls les hôtes réellement attachés à *.flow-hub.fr. */
export const TOOLS: FlowTool[] = [
  {
    id: "hub",
    name: "Flow Hub",
    group: "Présence",
    line: "La pièce client. Deux allures, un seul studio.",
    href: "https://www.flow-hub.fr",
    key: "H",
  },
  {
    id: "studio",
    name: "Studio",
    group: "Présence",
    line: "Direction visuelle. Le showroom des pièces.",
    href: "https://studio.flow-hub.fr",
    key: "S",
  },
  {
    id: "salon",
    name: "Salon",
    group: "Présence",
    line: "L’expérience réservée. Plus lent, plus proche.",
    href: "https://salon.flow-hub.fr",
    key: "P",
  },
  {
    id: "video",
    name: "Vidéo",
    group: "Présence",
    line: "À la demande. Accès protégé.",
    href: "https://video.flow-hub.fr",
    key: "V",
  },
  {
    id: "cockpit",
    name: "Cockpit",
    group: "Ops",
    line: "Notifications agents. On valide, on ne saisit pas.",
    href: "https://cockpit.flow-hub.fr",
    key: "C",
  },
  {
    id: "regie",
    name: "Régie",
    group: "Ops",
    line: "Orchestration des campagnes et des files.",
    href: "https://regie.flow-hub.fr",
    key: "R",
  },
  {
    id: "labo",
    name: "Labo",
    group: "Lab",
    line: "Hololab. 360, hologrammes, prototypes.",
    href: "https://labo.flow-hub.fr",
    key: "L",
  },
  {
    id: "truffe",
    name: "Truffe",
    group: "Lab",
    line: "Recherche agentique. Plus précis, moins de bruit.",
    href: "https://truffe.flow-hub.fr",
    key: "T",
  },
];

export const GROUPS: ToolGroup[] = ["Présence", "Ops", "Lab"];
