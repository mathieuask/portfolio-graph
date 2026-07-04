"use client";

import { useEffect, useState } from "react";
import { HORIZON_DAYS } from "@/lib/slots";

type Step = "closed" | "slot" | "form" | "done";

function upcomingDays(): { iso: string; label: string }[] {
  const days: { iso: string; label: string }[] = [];
  const fmtIso = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" });
  const fmtLabel = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris", weekday: "short", day: "numeric", month: "short",
  });
  for (let i = 1; i <= HORIZON_DAYS; i++) {
    const d = new Date(Date.now() + i * 24 * 3600 * 1000);
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Paris", weekday: "short",
    }).format(d);
    if (weekday === "Sat" || weekday === "Sun") continue;
    days.push({ iso: fmtIso.format(d), label: fmtLabel.format(d) });
  }
  return days;
}

export default function Booking() {
  const [step, setStep] = useState<Step>("closed");
  const [days] = useState(upcomingDays);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!date) return;
    setSlots(null);
    setTime("");
    fetch(`/api/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]));
  }, [date]);

  async function book() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "erreur");
        if (res.status === 409) {
          setStep("slot");
          setDate("");
        }
        return;
      }
      setStep("done");
    } catch {
      setError("connexion impossible, réessaie");
    } finally {
      setBusy(false);
    }
  }

  if (step === "closed") {
    return (
      <button
        onClick={() => setStep("slot")}
        className="pointer-events-auto fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--panel-bg)] px-4 py-2.5 text-[13px] text-[var(--text)] shadow-lg shadow-black/40 backdrop-blur transition hover:border-[var(--accent)]"
      >
        <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
        Prendre rendez-vous
      </button>
    );
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-6">
      <div className="flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--bg)] md:max-w-[440px] md:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <span className="text-[14px] font-medium text-[var(--text)]">
            {step === "done" ? "C'est noté" : "Prendre rendez-vous"}
          </span>
          <button
            onClick={() => setStep("closed")}
            className="px-2 py-1 text-[var(--muted)] hover:text-[var(--text)]"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "slot" && (
            <>
              <p className="mb-3 text-[13px] text-[var(--muted)]">
                Visio de 30 min, du lundi au vendredi (heure de Paris). Choisis un jour :
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {days.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => setDate(d.iso)}
                    className={`rounded-lg border px-3 py-1.5 text-[13px] transition ${
                      date === d.iso
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-body)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              {date && slots === null && (
                <p className="text-[13px] text-[var(--muted)]">Recherche des créneaux…</p>
              )}
              {date && slots !== null && slots.length === 0 && (
                <p className="text-[13px] text-[var(--muted)]">
                  Aucun créneau libre ce jour-là, essaie un autre jour.
                </p>
              )}
              {date && slots !== null && slots.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setTime(s);
                        setStep("form");
                      }}
                      className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-[13px] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === "form" && (
            <>
              <p className="mb-4 text-[13px] text-[var(--muted)]">
                {days.find((d) => d.iso === date)?.label} à {time} (Paris) · 30 min
              </p>
              <div className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ton nom"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel-bg)] px-3 py-2 text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)]"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Ton email (pour l'invitation)"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel-bg)] px-3 py-2 text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)]"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Le sujet en une phrase (optionnel)"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--panel-bg)] px-3 py-2 text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)]"
                />
              </div>
              {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setStep("slot")}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-[13px] text-[var(--muted)] transition hover:text-[var(--text)]"
                >
                  Retour
                </button>
                <button
                  onClick={book}
                  disabled={busy}
                  className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-[#13131a] transition hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? "Réservation…" : "Confirmer le rendez-vous"}
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div className="py-6 text-center">
              <p className="mb-2 text-[15px] text-[var(--text)]">Rendez-vous confirmé.</p>
              <p className="text-[13px] text-[var(--muted)]">
                Tu vas recevoir une invitation Google Calendar à {email}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
