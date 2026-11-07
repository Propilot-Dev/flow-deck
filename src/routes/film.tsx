import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

export const Route = createFileRoute("/film")({
  head: () => ({
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@500&family=Unbounded:wght@600;700&display=swap",
      },
    ],
  }),
  component: Film,
});

const IMG = "/truffe";

type Slide = {
  kicker: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    kicker: "Truffe · par Flow",
    title: "Vous cherchez.\nTruffe trouve.",
    body: "Le chien truffier du web. Une phrase, et la meute rapporte les vraies offres.",
    image: `${IMG}/hero-896.webp`,
    alt: "Truffe, un lagotto romagnolo au pelage bouclé, le nez levé dans une lumière braise",
  },
  {
    kicker: "Le chef de meute",
    title: "Un lagotto.\nPas un moteur anonyme.",
    body: "Truffe est le module. On y branche un flair : ses filtres, ses sources, les réflexes d’un métier.",
    image: `${IMG}/avatar-640.webp`,
    alt: "Avatar de Truffe, de face, regard droit",
  },
  {
    kicker: "01 · Le problème",
    title: "Chercher, c’est un deuxième job.",
    body: "Quarante onglets. Des annonces en double. La pépite partie pendant qu’on compare. Le web a tout. Personne n’a le temps.",
    image: `${IMG}/meute-1344.webp`,
    alt: "Truffe assis en chef d’équipe devant un écran de résultats dans un studio",
  },
  {
    kicker: "02 · Trois temps",
    title: "Flair. Chasse.\nButin.",
    body: "Dites-le comme à un ami. Elle pose deux ou trois questions. Zéro onglet. Vous gardez le meilleur.",
    image: `${IMG}/butin-1168.webp`,
    alt: "Truffe fier à côté d’une caisse à truffes remplie de trouvailles",
  },
  {
    kicker: "Comme une image, ou tout un film",
    title: "Une phrase.\nOu la meute entière.",
    body: "Chasse rapide : les pages publiques, en quelques secondes. Chasse profonde : elle ouvre les sites, remplit les formulaires, fouille les filtres.",
    image: `${IMG}/hero-896.webp`,
    alt: "Truffe, nez levé",
  },
  {
    kicker: "Flow Motors",
    title: "Truffe Auto.",
    body: "Annonces d’Europe, historique, prix du marché. Le flair d’une conciergerie.",
    image: `${IMG}/auto-1168.webp`,
    alt: "Truffe renifle le pare-chocs chromé d’un cabriolet américain des années 70",
  },
  {
    kicker: "Atelier",
    title: "Truffe Pièces.",
    body: "Références, délais, la pièce qui manque. Le réflexe d’un préparateur moto.",
    image: `${IMG}/pieces-1168.webp`,
    alt: "Truffe sur un établi d’atelier moto, un carburateur ancien dans la gueule",
  },
  {
    kicker: "Flow Realty",
    title: "Truffe Immo.",
    body: "Rendement, DPE, travaux, le quartier. Le crible d’un investisseur.",
    image: `${IMG}/immo-1168.webp`,
    alt: "Truffe assis sur le parquet d’un appartement haussmannien vide",
  },
  {
    kicker: "Grand public",
    title: "Truffe Bons plans.",
    body: "La paire qui passe enfin en soldes. Le même chien, un autre terrain.",
    image: `${IMG}/deals-1168.webp`,
    alt: "Truffe tend le nez vers une paire de sneakers en cuir",
  },
  {
    kicker: "04 · La veille",
    title: "Elle ne dort pas.\nVous, si.",
    body: "Une chasse enregistrée repart chaque jour. Prix cible : elle aboie quand on y est. Le matin, trois lignes. Pas trente.",
    image: `${IMG}/veille-1168.webp`,
    alt: "Truffe allongé la nuit, une oreille dressée, devant une tablette lumineuse",
  },
  {
    kicker: "Vitrine distante",
    title: "On montre.\nOn ne télécharge pas.",
    body: "Iframe si le site l’autorise. Sinon l’image reste chez elle. Si la copie est interdite : le lien, le prix, le jour de lecture. Rien d’autre.",
    image: `${IMG}/butin-1168.webp`,
    alt: "Le butin de Truffe",
  },
  {
    kicker: "09 · Les règles",
    title: "Pas de lien,\npas de trouvaille.",
    body: "Elle ne paie rien et ne signe rien. C’est une IA, et elle le dit. Vos chasses restent à vous.",
    image: `${IMG}/avatar-640.webp`,
    alt: "Avatar de Truffe",
  },
  {
    kicker: "L’essence",
    title: "La voiture,\net le plein.",
    body: "Spécialité 6 €. Cinquante chasses 6 €. Dix veilles 9 €. Un siège 19 €. Réservoir vide : elle s’arrête et demande.",
    image: `${IMG}/meute-1344.webp`,
    alt: "Truffe chef de meute",
  },
  {
    kicker: "Flow",
    title: "Une Truffe\npar trésor.",
    body: "Un bien rare, une pièce introuvable, un prix qui tombe. L’application reste à construire. Le flair, lui, est déjà là.",
    image: `${IMG}/hero-896.webp`,
    alt: "Truffe, nez levé dans une lumière braise",
  },
];

const WAIT = 7000;

function Film() {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(true);
  const n = SLIDES.length;
  const go = useCallback((next: number) => setI((next + n) % n), [n]);

  useEffect(() => {
    if (!play) return;
    const t = window.setTimeout(() => go(i + 1), WAIT);
    return () => window.clearTimeout(t);
  }, [i, play, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setPlay(false);
        go(i + 1);
      }
      if (e.key === "ArrowLeft") {
        setPlay(false);
        go(i - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i]);

  const slide = SLIDES[i];

  return (
    <main className="relative h-dvh overflow-hidden bg-[#08070a] text-[#fff1e2]">
      <style>{`
        @keyframes truffe-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes truffe-drift { from { transform: scale(1.08); } to { transform: scale(1); } }
        @keyframes truffe-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .truffe-rise { animation: truffe-rise .7s cubic-bezier(.2,.9,.2,1) both; }
        .truffe-drift { animation: truffe-drift 8s linear both; }
        .truffe-bar { animation: truffe-bar ${WAIT}ms linear; transform-origin: left; }
        @media (prefers-reduced-motion: reduce) {
          .truffe-rise, .truffe-drift, .truffe-bar { animation: none; }
        }
      `}</style>

      <img
        key={slide.image + i}
        src={slide.image}
        alt={slide.alt}
        className="truffe-drift absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-[#08070a]/75 to-[#08070a]/20" />

      <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8">
        <Link to="/" className="font-mono text-[11px] tracking-[0.16em] text-[#fff1e2]/80 uppercase">
          Deck
        </Link>
        <p className="font-mono text-[11px] tracking-[0.16em] text-[#ff7a1a] uppercase">
          {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </p>
      </header>

      <section key={i} className="absolute right-0 bottom-24 left-0 z-10 px-4 sm:bottom-28 sm:px-10">
        <p className="truffe-rise font-mono text-[11px] tracking-[0.16em] text-[#ff7a1a] uppercase">{slide.kicker}</p>
        <h1
          className="truffe-rise mt-3 max-w-4xl text-4xl leading-[0.95] font-semibold tracking-tight whitespace-pre-line sm:text-7xl"
          style={{ fontFamily: "Unbounded, sans-serif", animationDelay: ".08s" }}
        >
          {slide.title}
        </h1>
        <p
          className="truffe-rise mt-4 max-w-xl text-base leading-relaxed text-[#fff1e2]/80 sm:text-lg"
          style={{ fontFamily: "Geist, sans-serif", animationDelay: ".16s" }}
        >
          {slide.body}
        </p>
        <p className="truffe-rise mt-3 font-mono text-[10px] tracking-[0.14em] text-[#ab9f95] uppercase">Image IA · truffe.flow-hub.fr</p>
      </section>

      <footer className="absolute right-0 bottom-0 left-0 z-10 flex items-center gap-3 px-4 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => {
            setPlay(false);
            go(i - 1);
          }}
          className="min-h-11 min-w-11 rounded-full border border-[#fff1e217] text-sm"
          aria-label="Précédent"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setPlay((p) => !p)}
          className="min-h-11 rounded-full border border-[#fff1e217] px-4 text-sm"
        >
          {play ? "Pause" : "Lecture"}
        </button>
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-[#fff1e217]">
          {play ? <div key={i} className="truffe-bar h-full bg-[#ff7a1a]" /> : null}
        </div>
        <button
          type="button"
          onClick={() => {
            setPlay(false);
            go(i + 1);
          }}
          className="min-h-11 rounded-full bg-[#ff7a1a] px-4 text-sm font-semibold text-[#08070a]"
        >
          Suivant
        </button>
      </footer>
    </main>
  );
}
