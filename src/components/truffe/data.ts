export type SpecId = "pieces" | "auto" | "immo" | "deals";

export type Flow = {
  id: SpecId;
  name: string;
  query: string;
  questions: { prompt: string; options: string[] }[];
};

export const FLOWS: Flow[] = [
  {
    id: "pieces",
    name: "Pièces",
    query: "Carburateur VM34 pour Yamaha XS650",
    questions: [
      { prompt: "Neuf, ou l’occasion passe ?", options: ["Neuf", "Occasion", "Peu importe"] },
      { prompt: "Tu peux attendre combien ?", options: ["Cette semaine", "Ce mois-ci", "Peu importe"] },
    ],
  },
  {
    id: "auto",
    name: "Auto",
    query: "Cabriolet américain des années 70 à vendre",
    questions: [
      { prompt: "Jusqu’où tu vas le chercher ?", options: ["France", "Europe", "Peu importe"] },
      { prompt: "L’historique, tu le veux ?", options: ["Oui, complet", "L’essentiel", "Plus tard"] },
    ],
  },
  {
    id: "immo",
    name: "Immo",
    query: "T2 à vendre bon rendement",
    questions: [
      { prompt: "Quel rendement minimum ?", options: ["4 %", "6 %", "Je veux voir"] },
      { prompt: "Les travaux, tu les prends ?", options: ["Rafraîchir", "Gros œuvre", "Aucun"] },
    ],
  },
  {
    id: "deals",
    name: "Bons plans",
    query: "Sneakers cuir blanc en soldes",
    questions: [
      { prompt: "Quelle pointure ?", options: ["41", "42", "43"] },
      { prompt: "Le cuir, seulement ?", options: ["Cuir", "Peu importe"] },
    ],
  },
];

export type ScreenId =
  | "flair"
  | "questions"
  | "chasse"
  | "cartes"
  | "butin"
  | "tableau"
  | "comparer"
  | "veille"
  | "profil";

export const RAIL: { id: ScreenId; label: string }[] = [
  { id: "flair", label: "Flair" },
  { id: "questions", label: "Questions" },
  { id: "chasse", label: "Chasse" },
  { id: "cartes", label: "Cartes" },
  { id: "butin", label: "Butin" },
  { id: "tableau", label: "Tableau" },
  { id: "comparer", label: "Comparer" },
  { id: "veille", label: "Veille" },
  { id: "profil", label: "Profil" },
];

export function guessSpec(text: string): SpecId {
  const t = text.toLowerCase();
  if (/immo|appart|maison|t2|rendement|dpe/.test(t)) return "immo";
  if (/sneaker|paire|solde|cuir|bon plan/.test(t)) return "deals";
  if (/voiture|porsche|auto|cabriolet|youngtimer/.test(t)) return "auto";
  return "pieces";
}
