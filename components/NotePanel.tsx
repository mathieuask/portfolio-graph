"use client";

import { nodes, CATEGORY_COLORS, CATEGORY_LABELS } from "@/data/content";
import Image from "next/image";
import { Fragment } from "react";

interface Props {
  nodeId: string;
  onNavigate: (id: string) => void;
  onClose: () => void;
}

const byId = new Map(nodes.map((n) => [n.id, n]));

function initials(label: string): string {
  return label
    .split(/[\s/—–-]+/)
    .filter((w) => /^[A-Za-zÀ-ÿ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return h;
}

function renderInline(text: string, onNavigate: (id: string) => void) {
  const parts = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const wiki = part.match(/^\[\[([^\]]+)\]\]$/);
    if (wiki) {
      const target = byId.get(wiki[1]);
      if (!target) return <Fragment key={i}>{wiki[1]}</Fragment>;
      return (
        <button
          key={i}
          onClick={() => onNavigate(target.id)}
          className="text-[var(--accent)] hover:underline"
        >
          {target.label}
        </button>
      );
    }
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i} className="text-[var(--text)]">{bold[1]}</strong>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function NotePanel({ nodeId, onNavigate, onClose }: Props) {
  const node = byId.get(nodeId);
  if (!node) return null;

  const catColor = CATEGORY_COLORS[node.category];
  const backlinks = nodes.filter((n) => n.id !== nodeId && n.note.includes(`[[${nodeId}]]`));
  const lines = node.note.split("\n");

  return (
    <aside className="pointer-events-auto flex h-full w-full flex-col bg-[var(--panel-bg)] backdrop-blur-md max-md:rounded-t-2xl max-md:border-t max-md:border-[var(--border)] md:border-l md:border-[var(--border)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={{ color: catColor, background: `${catColor}18` }}
        >
          {CATEGORY_LABELS[node.category]}
        </span>
        <button
          onClick={onClose}
          className="px-2 py-1 text-[var(--muted)] transition hover:text-[var(--text)]"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      <div
        className="relative flex h-20 shrink-0 items-end overflow-hidden px-5 pb-2"
        style={
          node.image && node.imageFit === "contain"
            ? { background: "#fff" }
            : {
                background: `linear-gradient(${115 + (hash(node.id) % 60)}deg, ${catColor}, color-mix(in srgb, ${catColor} 30%, var(--bg)))`,
              }
        }
      >
        {node.image?.endsWith(".svg") ? (
          // next/image passe les SVG par l'optimiseur (désactivé par défaut, risque XSS) : rendu direct
          // eslint-disable-next-line @next/next/no-img-element
          <img src={node.image} alt="" className="h-full w-full object-contain p-6" />
        ) : node.image ? (
          <Image
            src={node.image}
            alt=""
            fill
            sizes="400px"
            className={node.imageFit === "contain" ? "object-contain p-4" : "object-cover"}
          />
        ) : (
          <span className="absolute -right-1 -top-5 select-none text-[84px] font-bold leading-none text-white/15">
            {initials(node.label)}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 text-[14px] leading-relaxed text-[var(--text-body)]">
        {lines.map((line, i) => {
          if (line.startsWith("# "))
            return (
              <h2 key={i} className="mb-3 text-xl font-semibold text-[var(--text)]">
                {line.slice(2)}
              </h2>
            );
          if (line.startsWith("- "))
            return (
              <div key={i} className="mb-1 flex gap-2">
                <span className="text-[var(--dim)]">•</span>
                <span>{renderInline(line.slice(2), onNavigate)}</span>
              </div>
            );
          if (line.trim() === "") return <div key={i} className="h-3" />;
          return <p key={i} className="mb-1">{renderInline(line, onNavigate)}</p>;
        })}

        {backlinks.length > 0 && (
          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-[var(--dim)]">
              Mentionné dans
            </p>
            <div className="flex flex-wrap gap-2">
              {backlinks.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onNavigate(b.id)}
                  className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[12px] text-[var(--accent)] transition hover:border-[var(--accent)]"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
