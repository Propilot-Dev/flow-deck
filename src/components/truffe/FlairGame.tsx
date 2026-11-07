import { useEffect, useRef, useState } from "react";

type Puff = { id: number; x: number; good: boolean };

export function FlairGame(props: { playing: boolean }) {
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const [score, setScore] = useState(0);
  const [calm, setCalm] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setCalm(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!props.playing || calm) return;
    const timer = window.setInterval(() => {
      nextId.current += 1;
      const puff = { id: nextId.current, x: 6 + Math.random() * 72, good: Math.random() > 0.3 };
      setPuffs((list) => [...list.slice(-7), puff]);
    }, 700);
    return () => window.clearInterval(timer);
  }, [props.playing, calm]);

  function pop(puff: Puff) {
    setPuffs((list) => list.filter((item) => item.id !== puff.id));
    if (puff.good) setScore((value) => value + 1);
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm text-sand">Touche les taches braise. Les grises ne comptent pas.</p>
        <p className="font-display text-lg text-ember">Flair {score}</p>
      </div>
      {calm ? (
        <button type="button" onClick={() => setScore((value) => value + 1)} className="min-h-14 w-full rounded-2xl bg-ember font-semibold text-ink">
          Renifler
        </button>
      ) : (
        <div className="relative h-72 overflow-hidden rounded-2xl border border-vein bg-bark" aria-label="Jeu d'attente">
          {puffs.map((puff) => (
            <button
              key={puff.id}
              type="button"
              onClick={() => pop(puff)}
              onAnimationEnd={() => setPuffs((list) => list.filter((item) => item.id !== puff.id))}
              aria-label={puff.good ? "Odeur à suivre" : "Fausse piste"}
              className={`truffe-puff absolute bottom-0 size-14 rounded-full ${puff.good ? "bg-ember" : "border border-vein bg-soil"}`}
              style={{ left: `${puff.x}%` }}
            />
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-sand">Le jeu ne change pas ce qu’elle trouve.</p>
    </div>
  );
}
