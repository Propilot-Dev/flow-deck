import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/truffe")({
  component: TruffePrd,
});

const RAPIDE = [
  { k: "01", t: "Une phrase", d: "À l’écrit, à la voix ou en photo. Comme à un ami." },
  { k: "02", t: "Deux questions", d: "Un pro du métier. Pas un formulaire." },
  { k: "03", t: "Des cartes", d: "À droite le butin. À gauche, elle ne revient plus." },
];

const FILM = [
  { k: "01", t: "Le flair", d: "Spécialité, filtres, exclusions. Le profil s’en mêle." },
  { k: "02", t: "La meute", d: "Plusieurs limiers, plusieurs sources, une chasse profonde." },
  { k: "03", t: "Les vues", d: "Cartes, tableau, comparateur. Délai, qualité, prix, état, rendement." },
  { k: "04", t: "La veille", d: "Chaque matin. Trois lignes. Elle aboie au prix cible." },
  { k: "05", t: "L’équipe", d: "Sièges, pistes partagées, export, branchement CRM sur devis." },
];

const LIMIERS = [
  { nom: "Pièces", terrain: "Moto, réfs, délais", qui: "Préparateur" },
  { nom: "Annonces", terrain: "Europe, historique, prix", qui: "Conciergerie auto" },
  { nom: "Murs", terrain: "Rendement, DPE, travaux", qui: "Investisseur" },
  { nom: "Dressé", terrain: "Votre métier, vos sources", qui: "Flow Lab, sur devis" },
];

const REGLES = [
  { t: "Preuve", d: "Pas de lien, pas de trouvaille. Lien direct et jour de lecture. Elle ne juge que ce qu’elle a lu." },
  { t: "Respect", d: "Si le site interdit la copie, on garde le lien, pas le contenu. Jamais de téléchargement." },
  { t: "Contrôle", d: "Elle ne paie rien et ne signe rien. La décision reste à vous." },
  { t: "Transparence", d: "C’est un agent. Vos chasses restent à vous. Pas de revente, pas de pub." },
];

const PRIX = [
  { t: "Spécialité en plus", n: "6 €", u: "/ mois" },
  { t: "Recharge 50 chasses", n: "6 €", u: "dont 5 profondes" },
  { t: "10 pistes de veille", n: "9 €", u: "/ mois" },
  { t: "Siège en plus", n: "19 €", u: "/ mois" },
];

const CHANTIER = [
  { n: "1", t: "Flair", d: "Une phrase, deux questions, des cartes avec lien et date." },
  { n: "2", t: "Vitrine distante", d: "Iframe ou image d’origine. Rien n’est copié chez nous." },
  { n: "3", t: "Butin", d: "Garder, écarter, profil qui apprend." },
  { n: "4", t: "Veille", d: "Relance du matin, prix cible, historique." },
  { n: "5", t: "Meute", d: "Limiers, sièges, tableau, comparateur, export." },
];

function TruffePrd() {
  const [film, setFilm] = useState(false);
  const steps = film ? FILM : RAPIDE;

  return (
    <main className="h-dvh overflow-y-auto bg-bg text-fg">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md sm:px-8">
        <Link to="/" className="text-sm text-muted">
          Retour au deck
        </Link>
        <p className="text-[11px] font-medium tracking-[0.16em] text-amber uppercase">PRD · Truffe</p>
        <Link to="/film" className="text-sm text-amber">
          Présentation
        </Link>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:px-8 sm:py-14">
        <section>
          <p className="text-[11px] font-medium tracking-[0.16em] text-amber uppercase">
            La page est en ligne. L’application, non.
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Vous cherchez.
            <span className="block text-amber">Truffe trouve.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Un moteur de recherche tenu par une meute. Truffe est le chef. Les limiers ont chacun un terrain.
            Une phrase suffit. Ceux qui veulent un film ont toute la meute.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            ["Flair", "Dire ce qu’on cherche."],
            ["Chasse", "La meute lit le web."],
            ["Butin", "Garder le meilleur."],
          ].map(([t, d]) => (
            <article key={t} className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="text-lg font-semibold">{t}</h2>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </article>
          ))}
        </section>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Deux profondeurs</h2>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Comme on génère une image, ou tout un film. Le même chien. Pas le même terrain.
              </p>
            </div>
            <div className="flex rounded-xl border border-line p-1">
              <button
                type="button"
                onClick={() => setFilm(false)}
                className={`min-h-11 rounded-lg px-4 text-sm ${film ? "text-muted" : "bg-amber font-semibold text-bg"}`}
              >
                Une phrase
              </button>
              <button
                type="button"
                onClick={() => setFilm(true)}
                className={`min-h-11 rounded-lg px-4 text-sm ${film ? "bg-amber font-semibold text-bg" : "text-muted"}`}
              >
                Le film
              </button>
            </div>
          </div>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {steps.map((s) => (
              <li key={s.k + s.t} className="rounded-2xl border border-line bg-surface p-5">
                <p className="text-[11px] tracking-[0.14em] text-amber">{s.k}</p>
                <h3 className="mt-1 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted">
            {film
              ? "Chasse profonde : elle ouvre les sites, remplit les formulaires, fouille les filtres. Ça consomme de l’essence."
              : "Chasse rapide : elle lit les pages publiques, compare, trie. Quelques secondes."}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Vitrine distante</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            On montre le produit. On ne le télécharge jamais. Pas de copie sur nos serveurs, pas de cache, pas d’entraînement sur l’image.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-line bg-elev p-5">
              <h3 className="font-semibold">Iframe</h3>
              <p className="mt-1 text-sm text-muted">La page d’origine, chez elle, si elle autorise l’intégration.</p>
            </article>
            <article className="rounded-2xl border border-line bg-elev p-5">
              <h3 className="font-semibold">Image citée</h3>
              <p className="mt-1 text-sm text-muted">Le navigateur l’affiche depuis son URL. Nous ne stockons pas l’octet.</p>
            </article>
            <article className="rounded-2xl border border-amber/40 bg-elev p-5">
              <h3 className="font-semibold text-amber">Sinon, le lien</h3>
              <p className="mt-1 text-sm text-muted">Titre, prix, date de lecture, lien direct. Rien d’autre.</p>
            </article>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-line bg-elev p-5">
            <h2 className="text-lg font-semibold">Particulier</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              La voiture rare, la pièce de moto, le T2 qui rapporte, la paire en soldes. Une chasse, un trésor. Le profil retient budget, marques, rayon, exclusions.
            </p>
          </article>
          <article className="rounded-2xl border border-line bg-elev p-5">
            <h2 className="text-lg font-semibold">Professionnel</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Une spécialité par métier, des sièges, une veille à l’échelle, un export. Flow Lab la dresse, Flow Studio l’habille, le consulting aide à l’adopter. Sur devis.
            </p>
          </article>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Les limiers</h2>
          <p className="mt-1 text-sm text-muted">Truffe est un module. On y branche un flair : filtres, sources, réflexes du métier.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {LIMIERS.map((l) => (
              <li key={l.nom} className="rounded-2xl border border-line bg-surface p-5">
                <p className="text-[11px] tracking-[0.14em] text-amber uppercase">{l.qui}</p>
                <h3 className="mt-1 font-semibold">{l.nom}</h3>
                <p className="mt-1 text-sm text-muted">{l.terrain}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Règles de la meute</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {REGLES.map((r) => (
              <li key={r.t} className="rounded-2xl border border-line p-5">
                <h3 className="font-semibold">{r.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{r.d}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">L’essence</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            L’abonnement est la voiture : plateforme, profil, spécialités. Les chasses sont le plein, inclus chaque mois. Réservoir vide : elle s’arrête et demande. Jamais de facture surprise. Tarifs de lancement, TVA selon statut.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-4">
            {PRIX.map((p) => (
              <li key={p.t} className="rounded-2xl border border-line bg-elev p-4">
                <p className="text-2xl font-semibold text-amber">{p.n}</p>
                <p className="mt-1 text-sm font-medium">{p.t}</p>
                <p className="text-xs text-muted">{p.u}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Ordre de chantier</h2>
          <ol className="mt-4 flex flex-col gap-2">
            {CHANTIER.map((c) => (
              <li key={c.n} className="flex gap-4 rounded-2xl border border-line bg-surface px-4 py-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber text-sm font-bold text-bg">{c.n}</span>
                <div>
                  <h3 className="font-semibold">{c.t}</h3>
                  <p className="text-sm text-muted">{c.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className="pb-8 text-sm text-muted">
          Un bien rare, une pièce introuvable, un prix qui tombe : une Truffe par trésor.
        </p>
      </div>
    </main>
  );
}
