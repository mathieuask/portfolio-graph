import { createEvent, freeBusy } from "@/lib/google";
import { SLOT_MINUTES, allSlots, freeSlots, isValidDate, parisToUtc } from "@/lib/slots";

const attempts = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 3600_000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 5;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "?";
  if (rateLimited(ip)) {
    return Response.json({ error: "trop de tentatives, réessaie plus tard" }, { status: 429 });
  }

  let body: { date?: string; time?: string; name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "requête invalide" }, { status: 400 });
  }

  const { date = "", time = "", message = "" } = body;
  const name = (body.name ?? "").trim().slice(0, 80);
  const email = (body.email ?? "").trim().slice(0, 120);
  if (!isValidDate(date) || !allSlots().includes(time)) {
    return Response.json({ error: "créneau invalide" }, { status: 400 });
  }
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "nom ou email invalide" }, { status: 400 });
  }

  try {
    const busy = await freeBusy(
      parisToUtc(date, "00:00").toISOString(),
      parisToUtc(date, "23:59").toISOString(),
    );
    if (!freeSlots(date, busy).includes(time)) {
      return Response.json({ error: "ce créneau vient d'être pris" }, { status: 409 });
    }
    const start = parisToUtc(date, time);
    const end = new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);
    await createEvent({
      start: start.toISOString(),
      end: end.toISOString(),
      name,
      email,
      message: String(message).slice(0, 1000),
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "réservation impossible, réessaie" }, { status: 502 });
  }
}
