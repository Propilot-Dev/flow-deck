export type Decision = {
  id: string;
  toolId: string;
  tag: string;
  title: string;
  detail: string;
};

/** File réelle du studio — on tranche, on ne ressaisit pas. */
export const DECISIONS: Decision[] = [
  {
    id: "truffe-x125",
    toolId: "truffe",
    tag: "Veille",
    title: "Pièces X125 sous le plafond",
    detail: "Quatre annonces avec photo réelle. Garder celles qui partent, écarter le reste.",
  },
  {
    id: "truffe-resto",
    toolId: "truffe",
    tag: "Flair",
    title: "Chasse resto — pas encore lâchée",
    detail: "La meute a le brief. Feu vert pour fouiller, ou on attend demain matin.",
  },
  {
    id: "cockpit-matin",
    toolId: "cockpit",
    tag: "Validation",
    title: "Deux points du matin",
    detail: "Paul ou Benjamin. On valide, on ne remplit pas un formulaire.",
  },
  {
    id: "regie-flowverse",
    toolId: "regie",
    tag: "Contenu",
    title: "Enter the Flowverse",
    detail: "Un plan de publication est prêt. Feu vert, ou on le garde pour la prochaine session.",
  },
  {
    id: "regie-maisons",
    toolId: "regie",
    tag: "Terrain",
    title: "Cinq maisons qu’on aime",
    detail: "Format audit ou bootcamp. On y va parce que le travail est beau, pas pour vendre un pack.",
  },
  {
    id: "studio-saphy",
    toolId: "studio",
    tag: "Pièce",
    title: "Planche Saphy en ligne",
    detail: "La direction bijoux est visible. On la garde comme référence, ou on la retravaille.",
  },
  {
    id: "salon-rythme",
    toolId: "salon",
    tag: "Session",
    title: "Prochain salon privé",
    detail: "Confirmer le rythme. Le discours, lui, reste le même : mettre les gens dans le flow.",
  },
  {
    id: "video-acces",
    toolId: "video",
    tag: "Accès",
    title: "Une demande de visionnage",
    detail: "Vidéo est protégée. Ouvrir l’accès, ou laisser la demande en attente.",
  },
  {
    id: "labo-120",
    toolId: "labo",
    tag: "Proto",
    title: "Particules avant démo",
    detail: "Le labo ne sort rien qui ne tient pas le rythme. On montre seulement si c’est fluide.",
  },
  {
    id: "hub-essentiel",
    toolId: "hub",
    tag: "Démo",
    title: "L’essentiel, en démo",
    detail: "La page prix est la pièce client. On l’ouvre devant eux, on n’en fait pas une saisie.",
  },
];
