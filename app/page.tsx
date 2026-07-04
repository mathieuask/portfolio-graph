"use client";

import { useState } from "react";
import Graph from "@/components/Graph";
import NotePanel from "@/components/NotePanel";
import Booking from "@/components/Booking";
import { nodes, CATEGORY_COLORS, CATEGORY_LABELS, Category } from "@/data/content";

const CATS: Category[] = ["etudes", "projets", "competences", "entrepreneuriat"];
const COUNTS = Object.fromEntries(
  CATS.map((c) => [c, nodes.filter((n) => n.category === c).length]),
) as Record<Category, number>;

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Category[]>([]);

  function toggleCat(c: Category) {
    setHidden((h) => (h.includes(c) ? h.filter((x) => x !== c) : [...h, c]));
  }

  return (
    <main className="relative h-dvh w-dvw overflow-hidden">
      <Graph hiddenCats={hidden} selectedId={selected} onSelect={setSelected} />

      <header className="pointer-events-none absolute left-4 top-4 md:left-6 md:top-6">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--text)]">
          Mathieu Askamp
        </h1>
        <p className="text-[12px] text-[var(--muted)] md:text-[13px]">
          Étudiant · développeur · entrepreneur — explore le graphe
        </p>
      </header>

      <div className="absolute left-1/2 top-[4.5rem] z-10 flex w-full max-w-[95vw] -translate-x-1/2 flex-wrap justify-center gap-2 px-2 md:top-6 md:w-auto">
        {CATS.map((c) => {
          const off = hidden.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggleCat(c)}
              className={`flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-[12px] backdrop-blur transition ${
                off
                  ? "text-[var(--dim)] opacity-60"
                  : "bg-[var(--panel-bg)] text-[var(--text)]"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: off ? "var(--dim)" : CATEGORY_COLORS[c] }}
              />
              {CATEGORY_LABELS[c]}
              <span className="text-[var(--dim)]">{COUNTS[c]}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="pointer-events-none absolute right-0 z-20 max-md:bottom-0 max-md:h-[52dvh] max-md:w-full md:top-0 md:h-full md:w-full md:max-w-[400px]">
          <NotePanel
            nodeId={selected}
            onNavigate={setSelected}
            onClose={() => setSelected(null)}
          />
        </div>
      )}

      <Booking />
    </main>
  );
}
