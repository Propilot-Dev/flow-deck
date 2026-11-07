import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Deck } from "@/components/holo/Deck";
import { useHolo } from "@/lib/holo-store";

const World = lazy(() => import("@/components/holo/World"));

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const mode = useHolo((s) => s.mode);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      {mode === "holo" ? (
        <>
          <div className="absolute inset-0">
            {ready ? (
              <Suspense fallback={<div className="h-full w-full bg-bg" />}>
                <World />
              </Suspense>
            ) : (
              <div className="h-full w-full bg-bg" />
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050507_92%)]" />
        </>
      ) : null}
      <Deck />
    </main>
  );
}
