export type AgentId = "truffe" | "regie" | "closer" | "terrain";

export type AgentCard = {
  id: string;
  tag: string;
  title: string;
  detail: string;
};

export type AgentReply = {
  source: "interne" | "xai" | "anthropic";
  name: string;
  questions: string[];
  plan: string;
  cards: AgentCard[];
};

export type AgentDef = {
  id: AgentId;
  name: string;
  toolId: string;
  verb: string;
  hint: string;
};

export const AGENTS: AgentDef[] = [
  {
    id: "truffe",
    name: "Truffe",
    toolId: "truffe",
    verb: "Lâcher",
    hint: "Ce que tu cherches, en une phrase.",
  },
  {
    id: "regie",
    name: "Régie",
    toolId: "regie",
    verb: "Préparer",
    hint: "Le contenu ou la maison à mettre dans le flow.",
  },
  {
    id: "closer",
    name: "Closier",
    toolId: "cockpit",
    verb: "Cadrer",
    hint: "Qui appeler, pour cinq minutes, rien d’autre.",
  },
  {
    id: "terrain",
    name: "Terrain",
    toolId: "labo",
    verb: "Ouvrir",
    hint: "Quartier, Place, Terrain ou Garage.",
  },
];

export function agentForTool(toolId: string): AgentDef | undefined {
  return AGENTS.find((a) => a.toolId === toolId);
}

function clip(text: string, max = 140) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** File interne. Jamais de lien, de prix ou d’annonce inventée. */
export function planLocal(agentId: AgentId, brief: string): Omit<AgentReply, "source"> {
  const subject = clip(brief, 90);
  if (agentId === "truffe") {
    return {
      name: "Truffe",
      questions: [
        "Photo réelle obligatoire, ou un lien suffit ?",
        "Plafond, délai, ou les deux ?",
      ],
      plan: "Chasse préparée. Pas de lien, pas de trouvaille : sans accès au web, Truffe ne fabrique pas d’annonces.",
      cards: [
        {
          id: "truffe-filtre",
          tag: "Flair",
          title: "Filtres de la chasse",
          detail: subject,
        },
        {
          id: "truffe-veille",
          tag: "Veille",
          title: "Relance chaque matin",
          detail: "À armer seulement quand les pistes auront un lien et une date de lecture.",
        },
        {
          id: "truffe-regle",
          tag: "Meute",
          title: "Truffe ne paie rien",
          detail: "Elle trie. Toi tu gardes ou tu écartes. Elle ne signe pas.",
        },
      ],
    };
  }
  if (agentId === "regie") {
    return {
      name: "Régie",
      questions: ["C’est pour Enter the Flowverse, ou pour une maison précise ?", "On publie, ou on se déplace ?"],
      plan: "La régie prépare. Elle ne poste pas tant que tu n’as pas gardé la carte.",
      cards: [
        {
          id: "regie-contenu",
          tag: "Inbound",
          title: "Une pièce, pas une campagne",
          detail: subject,
        },
        {
          id: "regie-terrain",
          tag: "Terrain",
          title: "Y aller parce que c’est beau",
          detail: "Audit, bootcamp ou démo. On propose le progrès, pas un pack.",
        },
      ],
    };
  }
  if (agentId === "closer") {
    return {
      name: "Closier",
      questions: ["Quel prénom, quelle maison ?", "Quel créneau de cinq minutes ?"],
      plan: "Il prend le rendez-vous. Si la question sort du business, il recadre.",
      cards: [
        {
          id: "closer-rdv",
          tag: "Cinq minutes",
          title: "Le créneau",
          detail: subject,
        },
        {
          id: "closer-cadre",
          tag: "Cadre",
          title: "Pas de réponse générale",
          detail: "Hors rendez-vous ou hors sujet, il revient à la prise de date.",
        },
      ],
    };
  }
  return {
    name: "Terrain",
    questions: ["On entre par le Quartier, la Place, le Terrain ou le Garage ?", "À pied, ou dans la GT ?"],
    plan: "Le terrain est une ville en particules. On y marche, on y entre, on rembobine.",
    cards: [
      {
        id: "terrain-zone",
        tag: "Zone",
        title: "Le lieu",
        detail: subject,
      },
      {
        id: "terrain-gt",
        tag: "Garage",
        title: "Entrer dans la GT",
        detail: "La voiture est un objet du monde, pas un menu. Sortir de la GT ramène au corps.",
      },
      {
        id: "terrain-place",
        tag: "Place",
        title: "La montre et les anneaux",
        detail: "Les portails relient la Place au Terrain. Toucher remonte la montre.",
      },
    ],
  };
}
