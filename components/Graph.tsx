"use client";

import { useEffect, useRef } from "react";
import { nodes, links, Category, CATEGORY_COLORS } from "@/data/content";

interface SimNode {
  id: string;
  label: string;
  category: Category;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Props {
  hiddenCats: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const degree = new Map<string, number>();
for (const l of links) {
  degree.set(l.source, (degree.get(l.source) ?? 0) + 1);
  degree.set(l.target, (degree.get(l.target) ?? 0) + 1);
}

const neighbors = new Map<string, Set<string>>();
for (const l of links) {
  if (!neighbors.has(l.source)) neighbors.set(l.source, new Set());
  if (!neighbors.has(l.target)) neighbors.set(l.target, new Set());
  neighbors.get(l.source)!.add(l.target);
  neighbors.get(l.target)!.add(l.source);
}

function createSimNodes(): SimNode[] {
  return nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    const r = n.id === "mathieu" ? 0 : 180 + (i % 3) * 60;
    return {
      id: n.id,
      label: n.label,
      category: n.category,
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      vx: 0,
      vy: 0,
      radius: 5 + Math.min(12, (degree.get(n.id) ?? 1) * 1.6),
    };
  });
}

function stepSimulation(sim: SimNode[], byId: Map<string, SimNode>) {
  for (let i = 0; i < sim.length; i++) {
    for (let j = i + 1; j < sim.length; j++) {
      const a = sim[i], b = sim[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d2 = Math.max(dx * dx + dy * dy, 100);
      const f = 9000 / d2;
      const d = Math.sqrt(d2);
      const fx = (dx / d) * f, fy = (dy / d) * f;
      a.vx -= fx; a.vy -= fy;
      b.vx += fx; b.vy += fy;
    }
  }
  for (const l of links) {
    const a = byId.get(l.source)!, b = byId.get(l.target)!;
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const f = (d - 130) * 0.012;
    const fx = (dx / d) * f, fy = (dy / d) * f;
    a.vx += fx; a.vy += fy;
    b.vx -= fx; b.vy -= fy;
  }
  for (const n of sim) {
    n.vx -= n.x * 0.002;
    n.vy -= n.y * 0.002;
    n.vx *= 0.88; n.vy *= 0.88;
    n.x += n.vx; n.y += n.vy;
  }
}

export default function Graph({ hiddenCats, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenRef = useRef(hiddenCats);
  hiddenRef.current = hiddenCats;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const sim = createSimNodes();
    const byId = new Map(sim.map((n) => [n.id, n]));
    const view = { x: 0, y: 0, scale: 1 };
    const pointers = new Map<number, { x: number; y: number }>();
    let viewTarget: { x: number; y: number } | null = null;
    let pinchDist = 0;
    let pinchMid = { x: 0, y: 0 };
    let hovered: SimNode | null = null;
    let dragging: SimNode | null = null;
    let panning = false;
    let last = { x: 0, y: 0 };
    let moved = false;
    let raf = 0;

    const isHidden = (n: SimNode) =>
      n.category !== "moi" && hiddenRef.current.includes(n.category);

    let scaleInit = false;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      // l'échelle initiale attend une taille réelle : dans un onglet caché,
      // clientWidth vaut 0 au montage et donnerait une échelle nulle
      if (!scaleInit && canvas.clientWidth > 0) {
        view.scale = Math.min(1, canvas.clientWidth / 900);
        scaleInit = true;
      }
      draw();
    }

    function toWorld(px: number, py: number) {
      return {
        x: (px - canvas.clientWidth / 2 - view.x) / view.scale,
        y: (py - canvas.clientHeight / 2 - view.y) / view.scale,
      };
    }

    function zoomAt(px: number, py: number, newScale: number) {
      const clamped = Math.min(3, Math.max(0.35, newScale));
      const cx = px - canvas.clientWidth / 2;
      const cy = py - canvas.clientHeight / 2;
      // garde le point du monde sous (px,py) immobile pendant le zoom
      view.x = cx - ((cx - view.x) / view.scale) * clamped;
      view.y = cy - ((cy - view.y) / view.scale) * clamped;
      view.scale = clamped;
      viewTarget = null;
    }

    function nodeAt(px: number, py: number): SimNode | null {
      const w = toWorld(px, py);
      for (let i = sim.length - 1; i >= 0; i--) {
        const n = sim[i];
        if (isHidden(n)) continue;
        const dx = n.x - w.x, dy = n.y - w.y;
        if (dx * dx + dy * dy < (n.radius + 8) ** 2) return n;
      }
      return null;
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.clientWidth, H = canvas.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.translate(W / 2 + view.x, H / 2 + view.y);
      ctx.scale(view.scale, view.scale);

      const focus = hovered?.id ?? selectedRef.current;
      const focusSet = focus ? neighbors.get(focus) : null;
      const isDim = (id: string) =>
        focus !== null && focus !== undefined && id !== focus && !focusSet?.has(id);

      for (const l of links) {
        const a = byId.get(l.source)!, b = byId.get(l.target)!;
        const hidden = isHidden(a) || isHidden(b);
        const active = !hidden && !!focus && (l.source === focus || l.target === focus);
        ctx.globalAlpha = hidden ? 0.04 : 1;
        ctx.strokeStyle = active ? "rgba(167,139,250,0.55)" : "rgba(140,140,160,0.16)";
        ctx.lineWidth = (active ? 1.6 : 1) / view.scale;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (const n of sim) {
        const hidden = isHidden(n);
        const dim = isDim(n.id);
        const isFocus = n.id === focus;
        ctx.globalAlpha = hidden ? 0.05 : dim ? 0.25 : 1;
        if (isFocus) {
          ctx.shadowColor = CATEGORY_COLORS[n.category];
          ctx.shadowBlur = 18;
        }
        ctx.fillStyle = CATEGORY_COLORS[n.category];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (!hidden) {
          ctx.font = `${isFocus ? 600 : 400} ${12 / Math.max(view.scale, 0.8)}px system-ui, sans-serif`;
          ctx.fillStyle = dim ? "rgba(190,190,210,0.35)" : "#c8c8dc";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y + n.radius + 15 / Math.max(view.scale, 0.8));
        }
        ctx.globalAlpha = 1;
      }
    }

    function focusOn(n: SimNode) {
      const W = canvas.clientWidth, H = canvas.clientHeight;
      const mobile = W < 768;
      const cx = mobile ? 0 : -Math.min(200, W - 500);
      const cy = mobile ? -H * 0.26 : 0;
      viewTarget = { x: cx - n.x * view.scale, y: cy - n.y * view.scale };
    }

    function loop() {
      stepSimulation(sim, byId);
      if (viewTarget) {
        view.x += (viewTarget.x - view.x) * 0.1;
        view.y += (viewTarget.y - view.y) * 0.1;
        if (Math.abs(viewTarget.x - view.x) + Math.abs(viewTarget.y - view.y) < 1) {
          viewTarget = null;
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    }

    function onPointerDown(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      pointers.set(e.pointerId, { x: px, y: py });
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        pinchDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        pinchMid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        dragging = null;
        panning = false;
        return;
      }
      moved = false;
      last = { x: px, y: py };
      const n = nodeAt(px, py);
      if (n) dragging = n;
      else panning = true;
      canvas.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: px, y: py });
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        view.x += mid.x - pinchMid.x;
        view.y += mid.y - pinchMid.y;
        if (pinchDist > 0) {
          zoomAt(mid.x, mid.y, view.scale * (d / pinchDist));
        }
        pinchDist = d;
        pinchMid = mid;
        moved = true;
        draw();
        return;
      }
      const dx = px - last.x, dy = py - last.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      if (dragging) {
        const w = toWorld(px, py);
        dragging.x = w.x; dragging.y = w.y;
        dragging.vx = 0; dragging.vy = 0;
      } else if (panning) {
        viewTarget = null;
        view.x += dx; view.y += dy;
      } else {
        const h = nodeAt(px, py);
        hovered = h;
        canvas.style.cursor = h ? "pointer" : "grab";
      }
      last = { x: px, y: py };
    }

    function onPointerUp(e: PointerEvent) {
      pointers.delete(e.pointerId);
      pinchDist = 0;
      const rect = canvas.getBoundingClientRect();
      const n = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (!moved && pointers.size === 0) {
        onSelectRef.current(n ? n.id : null);
        if (n) focusOn(n);
        else viewTarget = null;
      }
      dragging = null;
      panning = false;
    }

    function onPointerCancel(e: PointerEvent) {
      pointers.delete(e.pointerId);
      pinchDist = 0;
      dragging = null;
      panning = false;
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.08 : 0.93;
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, view.scale * factor);
      draw();
    }

    // layout pré-calculé + premier dessin synchrone : le graphe est visible
    // même si requestAnimationFrame est throttlé (onglet caché, mode éco)
    for (let i = 0; i < 150; i++) stepSimulation(sim, byId);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ cursor: "grab", touchAction: "none" }}
    />
  );
}
