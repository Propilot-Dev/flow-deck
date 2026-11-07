import { Link } from "@tanstack/react-router";
import { Bell, Bookmark, ExternalLink, Mic, Search, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { runHunt } from "@/lib/hunt.functions";
import type { LiveOffer } from "@/lib/hunt-verify";
import { FLOWS, RAIL, guessSpec, type ScreenId, type SpecId } from "./data";
import { FlairGame } from "./FlairGame";

const STORE = "truffe-hunt";
const primary =
  "min-h-14 rounded-2xl bg-ember px-5 text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

type Saved = { query: string; offers: LiveOffer[]; readAt: string; kept: string[]; cible: string };

function heure(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

function isOffer(value: unknown): value is LiveOffer {
  if (!value || typeof value !== "object") return false;
  const row = value as LiveOffer;
  return typeof row.url === "string" && row.url.startsWith("https://") && typeof row.title === "string";
}

export function TruffeStudio() {
  const [screen, setScreen] = useState<ScreenId>("flair");
  const [spec, setSpec] = useState<SpecId>("pieces");
  const [query, setQuery] = useState(FLOWS[0].query);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [deckI, setDeckI] = useState(0);
  const [kept, setKept] = useState<string[]>([]);
  const [offers, setOffers] = useState<LiveOffer[]>([]);
  const [readAt, setReadAt] = useState("");
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [cible, setCible] = useState("");
  const [veille, setVeille] = useState(false);
  const [note, setNote] = useState("");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ Souple: true, France: true });
  const [ready, setReady] = useState(false);
  const lock = useRef(false);

  const flow = FLOWS.find((item) => item.id === spec) ?? FLOWS[0];
  const card = offers[deckI];
  const keptOffers = offers.filter((offer) => kept.includes(offer.id));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return;
      const saved = JSON.parse(raw) as Saved;
      if (!Array.isArray(saved.offers) || !saved.offers.every(isOffer)) return;
      setOffers(saved.offers);
      setQuery(typeof saved.query === "string" ? saved.query : "");
      setKept(Array.isArray(saved.kept) ? saved.kept.filter((id) => typeof id === "string") : []);
      setReadAt(typeof saved.readAt === "string" ? saved.readAt : "");
      setCible(typeof saved.cible === "string" ? saved.cible : "");
      if (saved.offers.length) setScreen("cartes");
    } catch {
      /* lecture locale ignorée */
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const payload: Saved = { query, offers, readAt, kept, cible };
    localStorage.setItem(STORE, JSON.stringify(payload));
  }, [ready, query, offers, readAt, kept, cible]);

  function launch(text: string, id: SpecId) {
    setQuery(text);
    setSpec(id);
    setQi(0);
    setAnswers([]);
    setScreen("questions");
  }

  async function hunt(answersIn: string[]) {
    const text = query.trim();
    if (text.length < 3 || lock.current) return;
    lock.current = true;
    const notes = [...answersIn, ...Object.entries(prefs).filter(([, on]) => on).map(([label]) => label)];
    setScreen("chasse");
    setReading(true);
    setError("");
    try {
      const result = await runHunt({ data: { query: text, notes } });
      if (!result.ok) {
        setError(result.error);
        setOffers([]);
        return;
      }
      setOffers(result.offers);
      setReadAt(result.readAt);
      setDeckI(0);
      setKept([]);
      if (!result.offers.length) setError("Rien lu. Reformule, ou sois plus précis.");
    } catch {
      setError("La lecture a été interrompue.");
    } finally {
      lock.current = false;
      setReading(false);
    }
  }

  function answer(option: string) {
    const next = [...answers, option];
    setAnswers(next);
    if (qi >= flow.questions.length - 1) void hunt(next);
    else setQi((n) => n + 1);
  }

  function decide(keep: boolean) {
    if (!card) return;
    if (keep) setKept((ids) => (ids.includes(card.id) ? ids : [...ids, card.id]));
    else setKept((ids) => ids.filter((id) => id !== card.id));
    const next = deckI + 1;
    setDeckI(next);
    if (next >= offers.length) setScreen("butin");
  }

  return (
    <div className="flex h-dvh bg-ink font-truffe text-cream">
      <aside className="hidden w-52 shrink-0 flex-col border-r border-vein bg-bark lg:flex">
        <div className="px-4 py-5">
          <p className="font-display text-sm tracking-wide">Truffe</p>
          <p className="mt-1 text-xs text-sand">Recherche réelle</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2">
          {RAIL.map((item, index) => {
            const on = item.id === screen;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm ${on ? "bg-ember text-ink" : "text-cream"}`}
              >
                <span className={on ? "text-ink" : "text-sand"}>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="flex flex-col gap-2 px-4 py-4 text-sm">
          <Link to="/film" className="text-sand">
            Film
          </Link>
          <Link to="/" className="text-sand">
            Deck
          </Link>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex gap-2 overflow-x-auto border-b border-vein px-3 py-2 lg:hidden">
          {RAIL.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScreen(item.id)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm ${item.id === screen ? "bg-ember text-ink" : "bg-soil text-cream"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {screen === "flair" ? (
            <Flair
              query={query}
              spec={spec}
              note={note}
              onQuery={setQuery}
              onSpec={(id) => {
                setSpec(id);
                setQuery(FLOWS.find((item) => item.id === id)?.query ?? "");
              }}
              onNote={setNote}
              onLaunch={() => launch(query.trim() || flow.query, guessSpec(query.trim() || flow.query))}
              onNow={() => void hunt([])}
            />
          ) : null}
          {screen === "questions" ? (
            <Questions
              index={qi}
              total={flow.questions.length}
              prompt={flow.questions[qi]?.prompt ?? ""}
              options={flow.questions[qi]?.options ?? []}
              onPick={answer}
              onBack={() => setScreen("flair")}
              onSkip={() => void hunt(answers)}
            />
          ) : null}
          {screen === "chasse" ? (
            <Chasse reading={reading} error={error} count={offers.length} query={query} onOpen={() => setScreen("cartes")} onRetry={() => void hunt(answers)} />
          ) : null}
          {screen === "cartes" ? (
            <Cartes
              card={card}
              kept={kept.length}
              seen={Math.min(deckI, offers.length)}
              total={offers.length}
              when={heure(readAt)}
              onDecide={decide}
              onButin={() => setScreen("butin")}
            />
          ) : null}
          {screen === "butin" ? (
            <Butin offers={keptOffers} when={heure(readAt)} onView={setScreen} onHunt={() => setScreen(offers.length ? "cartes" : "flair")} />
          ) : null}
          {screen === "tableau" ? <Tableau offers={offers} when={heure(readAt)} onCompare={() => setScreen("comparer")} /> : null}
          {screen === "comparer" ? <Comparer offers={offers} onKeep={(id) => setKept((ids) => (ids.includes(id) ? ids : [...ids, id]))} /> : null}
          {screen === "veille" ? (
            <Veille
              on={veille}
              cible={cible}
              title={offers[0]?.title ?? ""}
              price={offers[0]?.price ?? ""}
              onToggle={() => setVeille((value) => !value)}
              onCible={setCible}
            />
          ) : null}
          {screen === "profil" ? <Profil specName={flow.name} prefs={prefs} onToggle={(label) => setPrefs((state) => ({ ...state, [label]: !state[label] }))} /> : null}
        </div>

        <nav className="grid grid-cols-4 border-t border-vein bg-bark">
          {(
            [
              ["flair", "Flair", Search],
              ["butin", "Butin", Bookmark],
              ["veille", "Veille", Bell],
              ["profil", "Profil", UserRound],
            ] as const
          ).map(([id, label, Icon]) => {
            const on = screen === id || (id === "butin" && (screen === "tableau" || screen === "comparer"));
            return (
              <button key={id} type="button" onClick={() => setScreen(id)} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${on ? "text-ember" : "text-sand"}`}>
                <Icon size={18} aria-hidden />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function Flair(props: {
  query: string;
  spec: SpecId;
  note: string;
  onQuery: (value: string) => void;
  onSpec: (id: SpecId) => void;
  onNote: (value: string) => void;
  onLaunch: () => void;
  onNow: () => void;
}) {
  return (
    <div className="grid lg:h-full lg:grid-cols-2">
      <img
        src="/truffe/hero-896.webp"
        alt="Truffe, un lagotto romagnolo au pelage bouclé, le nez levé dans une lumière braise"
        className="h-56 w-full object-cover lg:h-full"
      />
      <div className="flex flex-col justify-center gap-6 px-5 py-8 sm:px-10">
        <div>
          <p className="text-xs tracking-widest text-sand uppercase">Dites-le comme à un ami</p>
          <h1 className="mt-3 font-display text-4xl leading-none sm:text-5xl">
            Vous cherchez.
            <span className="mt-1 block text-ember">Truffe trouve.</span>
          </h1>
        </div>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            props.onLaunch();
          }}
        >
          <label className="flex items-center gap-2 rounded-2xl border border-vein bg-soil px-4">
            <span className="sr-only">Ce que vous cherchez</span>
            <input value={props.query} onChange={(event) => props.onQuery(event.target.value)} className="min-h-14 w-full bg-transparent text-base outline-none" />
            <MicButton onNote={props.onNote} onText={props.onQuery} />
          </label>
          {props.note ? <p className="text-sm text-sand">{props.note}</p> : null}
          <div className="flex flex-wrap gap-2">
            {FLOWS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={props.spec === item.id}
                onClick={() => props.onSpec(item.id)}
                className={`min-h-11 rounded-full px-4 text-sm ${props.spec === item.id ? "bg-ember text-ink" : "border border-vein text-cream"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          <button type="submit" className={primary}>
            Affiner, puis chercher
          </button>
          <button type="button" onClick={props.onNow} className="min-h-11 text-sm text-sand">
            Chercher tout de suite
          </button>
        </form>
      </div>
    </div>
  );
}

function MicButton(props: { onText: (value: string) => void; onNote: (value: string) => void }) {
  const rec = useRef<Dictation | null>(null);
  return (
    <button
      type="button"
      className="grid size-11 shrink-0 place-items-center rounded-full text-cream"
      aria-label="Dicter"
      onClick={() => {
        const SR = dictationCtor();
        if (!SR) {
          props.onNote("La dictée n’est pas disponible dans ce navigateur.");
          return;
        }
        if (rec.current) {
          rec.current.stop();
          return;
        }
        const next = new SR();
        next.lang = "fr-FR";
        next.onresult = (event) => props.onText(event.results[0]?.[0]?.transcript ?? "");
        next.onend = () => {
          rec.current = null;
        };
        rec.current = next;
        next.start();
        props.onNote("");
      }}
    >
      <Mic size={18} aria-hidden />
    </button>
  );
}

type Dictation = {
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function dictationCtor(): (new () => Dictation) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => Dictation;
    webkitSpeechRecognition?: new () => Dictation;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function Questions(props: {
  index: number;
  total: number;
  prompt: string;
  options: string[];
  onPick: (option: string) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-5 py-10">
      <button type="button" onClick={props.onBack} className="min-h-11 self-start text-sm text-sand">
        Retour
      </button>
      <p className="text-xs tracking-widest text-sand uppercase">
        Question {props.index + 1} sur {props.total}
      </p>
      <h1 className="font-display text-3xl leading-tight">{props.prompt}</h1>
      <div className="flex flex-col gap-2">
        {props.options.map((option) => (
          <button key={option} type="button" onClick={() => props.onPick(option)} className="min-h-14 rounded-2xl border border-vein bg-soil px-4 text-left text-base">
            {option}
          </button>
        ))}
      </div>
      <button type="button" onClick={props.onSkip} className="min-h-11 self-start text-sm text-sand">
        Chercher avec ça
      </button>
    </div>
  );
}

const TIPS = [
  "Elle n’ouvre que des pages publiques.",
  "Si le prix n’est pas écrit, elle le dit.",
  "Pas de lien, pas de carte.",
  "La photo reste chez le vendeur.",
];

function Chasse(props: { reading: boolean; error: string; count: number; query: string; onOpen: () => void; onRetry: () => void }) {
  const [practice, setPractice] = useState(false);
  const [tip, setTip] = useState(0);
  const playing = props.reading || practice;

  useEffect(() => {
    if (!props.reading) return;
    const timer = window.setInterval(() => setTip((value) => (value + 1) % TIPS.length), 3500);
    return () => window.clearInterval(timer);
  }, [props.reading]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-5 py-8">
      <p className="text-xs tracking-widest text-ember uppercase">{props.reading ? "Lecture" : "Chasse"}</p>
      <h1 className="font-display text-4xl leading-none">
        {props.reading ? "Elle a le nez au sol." : props.count > 0 ? "Elle a trouvé." : "Prête à lire."}
      </h1>
      <p className="text-sand">{props.query}</p>
      {props.reading ? <p className="text-sm text-cream">{TIPS[tip]}</p> : null}
      {props.reading ? <p className="text-sm text-sand">Souvent moins d’une minute. Tu peux jouer en attendant.</p> : null}
      {props.error ? <p className="text-sm">{props.error}</p> : null}
      {!props.reading && props.count > 0 ? (
        <button type="button" onClick={props.onOpen} className={primary}>
          Voir les {props.count} pages
        </button>
      ) : null}
      {!props.error && (playing || props.reading) ? <FlairGame playing={playing} /> : null}
      {!props.reading && !props.error && props.count === 0 && !practice ? (
        <button type="button" onClick={() => setPractice(true)} className="min-h-14 rounded-2xl border border-vein">
          Essayer le flair
        </button>
      ) : null}
      {!props.reading && props.error ? (
        <button type="button" onClick={props.onRetry} className="min-h-11 self-start text-sm text-ember">
          Relire
        </button>
      ) : null}
    </div>
  );
}

function Cartes(props: {
  card?: LiveOffer;
  kept: number;
  seen: number;
  total: number;
  when: string;
  onDecide: (keep: boolean) => void;
  onButin: () => void;
}) {
  const startX = useRef<number | null>(null);
  const [dx, setDx] = useState(0);

  if (!props.total) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-3 px-5 py-16">
        <h1 className="font-display text-4xl">Pas encore de chasse.</h1>
        <p className="text-sand">Dis ce que tu cherches. Truffe ne montre que les pages qu’elle a lues.</p>
      </div>
    );
  }

  if (!props.card) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 px-5 py-16">
        <h1 className="font-display text-4xl">Butin trié.</h1>
        <p className="text-sand">
          {props.kept} gardée{props.kept > 1 ? "s" : ""}.
        </p>
        <button type="button" onClick={props.onButin} className={primary}>
          Ouvrir le butin
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-5 py-8">
      <p className="text-sm text-sand">
        {props.seen + 1} / {props.total} · {props.kept} gardée{props.kept > 1 ? "s" : ""}
        {props.when ? ` · lu à ${props.when}` : ""}
      </p>
      <article
        key={props.card.id}
        className="truffe-in relative rounded-2xl border border-vein bg-soil p-5"
        style={{ transform: dx ? `translateX(${dx}px) rotate(${dx / 18}deg)` : undefined }}
        onPointerDown={(event) => {
          startX.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (startX.current === null) return;
          setDx(event.clientX - startX.current);
        }}
        onPointerUp={() => {
          if (dx > 90) props.onDecide(true);
          else if (dx < -90) props.onDecide(false);
          startX.current = null;
          setDx(0);
        }}
      >
        <span className={`pointer-events-none absolute top-4 right-4 rounded-lg border border-ember px-2 py-1 text-xs text-ember transition-opacity ${dx > 36 ? "opacity-100" : "opacity-0"}`}>
          Gardée
        </span>
        <span className={`pointer-events-none absolute top-4 left-4 rounded-lg border border-sand px-2 py-1 text-xs text-sand transition-opacity ${dx < -36 ? "opacity-100" : "opacity-0"}`}>
          Écartée
        </span>
        <p className="text-xs tracking-widest text-sand uppercase">{props.card.host}</p>
        <h1 className="mt-4 font-display text-2xl leading-tight">{props.card.title}</h1>
        <p className="mt-3 font-display text-4xl text-ember">{props.card.price}</p>
        <p className="mt-2 text-sand">{props.card.meta}</p>
        <p className="mt-4 text-sm leading-relaxed text-sand">La photo reste sur l’annonce. Ici, seulement le lien lu.</p>
        <a href={props.card.url} target="_blank" rel="noreferrer noopener" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-ember">
          Ouvrir la page
          <ExternalLink size={16} aria-hidden />
        </a>
      </article>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => props.onDecide(false)} className="min-h-14 rounded-2xl border border-vein">
          Écarter
        </button>
        <button type="button" onClick={() => props.onDecide(true)} className={primary}>
          Garder
        </button>
      </div>
    </div>
  );
}

function Butin(props: { offers: LiveOffer[]; when: string; onView: (id: ScreenId) => void; onHunt: () => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 py-8">
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Butin</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => props.onView("tableau")} className="min-h-11 rounded-full border border-vein px-4 text-sm">
            Tableau
          </button>
          <button type="button" onClick={() => props.onView("comparer")} className="min-h-11 rounded-full border border-vein px-4 text-sm">
            Comparer
          </button>
        </div>
      </div>
      {props.offers.length === 0 ? (
        <div className="rounded-2xl border border-vein bg-soil p-5">
          <p>Rien de gardé.</p>
          <button type="button" onClick={props.onHunt} className="mt-4 min-h-11 text-sm text-ember">
            Revenir aux cartes
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {props.offers.map((offer) => (
            <li key={offer.id} className="rounded-2xl border border-vein bg-soil p-4">
              <p className="text-xs tracking-widest text-sand uppercase">{offer.host}</p>
              <p className="mt-2 font-display text-xl">{offer.title}</p>
              <p className="mt-1 text-ember">{offer.price}</p>
              <p className="text-sm text-sand">{offer.meta}</p>
              <a href={offer.url} target="_blank" rel="noreferrer noopener" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-ember">
                Ouvrir la page
                <ExternalLink size={16} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
      {props.when ? <p className="text-xs text-sand">Lu à {props.when}. Gardé sur cet appareil.</p> : null}
    </div>
  );
}

function priceValue(price: string) {
  if (/prix sur la page/i.test(price)) return null;
  const match = price.replace(/\s/g, "").replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  const value = match ? Number(match[1]) : NaN;
  return Number.isFinite(value) ? value : null;
}

function Tableau(props: { offers: LiveOffer[]; when: string; onCompare: () => void }) {
  const [byPrice, setByPrice] = useState(false);
  const rows = byPrice
    ? [...props.offers].sort((a, b) => (priceValue(a.price) ?? Number.MAX_VALUE) - (priceValue(b.price) ?? Number.MAX_VALUE))
    : props.offers;
  return (
    <div className="px-5 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Tableau</h1>
        <div className="flex gap-2">
          <button type="button" aria-pressed={byPrice} onClick={() => setByPrice((value) => !value)} className="min-h-11 rounded-full border border-vein px-4 text-sm">
            {byPrice ? "Ordre de lecture" : "Trier par prix"}
          </button>
          <button type="button" onClick={props.onCompare} className="min-h-11 rounded-full border border-vein px-4 text-sm">
            Comparer
          </button>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="text-sand">Aucune page lue.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-vein">
          <table className="w-full text-left text-sm">
            <thead className="text-xs tracking-widest text-sand uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Page</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Détail</th>
                <th className="px-4 py-3 font-medium">Lien</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((offer) => (
                <tr key={offer.id} className="border-t border-vein">
                  <td className="px-4 py-4">
                    {offer.title}
                    <span className="mt-1 block text-xs text-sand">{offer.host}</span>
                  </td>
                  <td className="px-4 py-4 text-ember">{offer.price}</td>
                  <td className="px-4 py-4 text-sand">{offer.meta}</td>
                  <td className="px-4 py-4">
                    <a href={offer.url} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-11 items-center text-ember">
                      Ouvrir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {props.when ? <p className="mt-3 text-sm text-sand">Lu à {props.when}. Chaque ligne a son lien. Pas de lien, pas de ligne.</p> : null}
    </div>
  );
}

function Comparer(props: { offers: LiveOffer[]; onKeep: (id: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const pair = props.offers.slice(0, 2);
  if (pair.length < 2) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="font-display text-3xl">Comparer</h1>
        <p className="mt-3 text-sand">Il faut au moins deux pages lues.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="font-display text-3xl">Comparer</h1>
      <p className="mt-2 text-sm text-sand">Deux pages lues, côte à côte. Le lien ouvre l’annonce, pas une copie.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {pair.map((offer) => {
          const on = picked === offer.id;
          return (
            <article key={offer.id} className={`rounded-2xl border p-5 ${on ? "border-ember bg-soil" : "border-vein bg-bark"}`}>
              <p className="text-xs tracking-widest text-sand uppercase">{offer.host}</p>
              <h2 className="mt-3 font-display text-2xl leading-tight">{offer.title}</h2>
              <p className="mt-3 font-display text-3xl text-ember">{offer.price}</p>
              <p className="mt-2 text-sand">{offer.meta}</p>
              <a href={offer.url} target="_blank" rel="noreferrer noopener" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-ember">
                Ouvrir la page
                <ExternalLink size={16} aria-hidden />
              </a>
              <button
                type="button"
                onClick={() => {
                  setPicked(offer.id);
                  props.onKeep(offer.id);
                }}
                className="mt-4 min-h-12 w-full rounded-xl bg-ember font-semibold text-ink"
              >
                {on ? "Gardée" : "Garder celle-ci"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Veille(props: {
  on: boolean;
  cible: string;
  title: string;
  price: string;
  onToggle: () => void;
  onCible: (value: string) => void;
}) {
  return (
    <div className="grid lg:grid-cols-2">
      <img
        src="/truffe/veille-1168.webp"
        alt="Truffe allongé la nuit, une oreille dressée, veille devant une tablette lumineuse"
        className="h-56 w-full object-cover lg:h-full"
      />
      <div className="flex flex-col gap-5 px-5 py-8 sm:px-10">
        <h1 className="font-display text-4xl leading-none">Elle ne dort pas.</h1>
        <p className="text-sand">La relance du matin n’est pas encore branchée. Le prix cible reste sur cet appareil.</p>
        <button
          type="button"
          aria-pressed={props.on}
          onClick={props.onToggle}
          className={`min-h-14 rounded-2xl px-4 text-left font-semibold ${props.on ? "bg-ember text-ink" : "border border-vein"}`}
        >
          {props.on ? "Notée sur cet appareil" : "Noter cette chasse"}
        </button>
        <label className="text-sm text-sand">
          Prix cible
          <input
            value={props.cible}
            onChange={(event) => props.onCible(event.target.value)}
            placeholder="180 €"
            className="mt-2 min-h-14 w-full rounded-2xl border border-vein bg-soil px-4 text-base text-cream outline-none"
          />
        </label>
        <div className="rounded-2xl border border-vein bg-soil p-4 text-sm leading-relaxed">
          {props.title ? (
            <>
              <p>{props.title}</p>
              <p className="mt-2 text-sand">Dernier prix lu : {props.price || "Prix sur la page"}.</p>
              {props.cible ? <p className="text-sand">Tu veux être prévenu à {props.cible}.</p> : null}
            </>
          ) : (
            <p className="text-sand">Aucune chasse lue pour l’instant.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Profil(props: { specName: string; prefs: Record<string, boolean>; onToggle: (label: string) => void }) {
  const groups = [
    { label: "Budget", options: ["Serré", "Souple", "Sans plafond"] },
    { label: "Rayon", options: ["Ville", "France", "Europe"] },
    { label: "Exclusions", options: ["Hors Europe", "Sans photo", "Vendeur neuf seulement"] },
  ];
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-5 py-8">
      <div className="flex items-center gap-4">
        <img src="/truffe/avatar-640.webp" alt="Avatar de Truffe, de face" className="size-16 rounded-full object-cover" />
        <div>
          <h1 className="font-display text-3xl">Votre flair</h1>
          <p className="text-sm text-sand">Spécialité active · {props.specName}</p>
        </div>
      </div>
      {groups.map((group) => (
        <fieldset key={group.label}>
          <legend className="text-sm text-sand">{group.label}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.options.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={!!props.prefs[option]}
                onClick={() => props.onToggle(option)}
                className={`min-h-11 rounded-full px-4 text-sm ${props.prefs[option] ? "bg-ember text-ink" : "border border-vein"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <p className="text-sm text-sand">Ces choix partent avec la prochaine chasse.</p>
    </div>
  );
}
