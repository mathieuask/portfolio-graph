import { BusyRange } from "./google";

export const SLOT_MINUTES = 30;
export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 18;
export const HORIZON_DAYS = 14;
const MIN_NOTICE_MS = 2 * 60 * 60 * 1000;

// décalage Europe/Paris à cet instant (gère été/hiver sans dépendance)
function parisOffsetMs(utc: Date): number {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(utc).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - utc.getTime();
}

export function parisToUtc(dateStr: string, timeStr: string): Date {
  const naive = new Date(`${dateStr}T${timeStr}:00Z`);
  const utc = new Date(naive.getTime() - parisOffsetMs(naive));
  // second passage : corrige le cas d'un changement d'heure entre les deux
  return new Date(naive.getTime() - parisOffsetMs(utc));
}

export function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const day = parisToUtc(dateStr, "12:00");
  if (isNaN(day.getTime())) return false;
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris", weekday: "short",
  }).format(day);
  if (weekday === "Sat" || weekday === "Sun") return false;
  const now = Date.now();
  const max = now + HORIZON_DAYS * 24 * 3600 * 1000;
  return day.getTime() > now - 24 * 3600 * 1000 && day.getTime() < max;
}

export function allSlots(): string[] {
  const slots: string[] = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function freeSlots(dateStr: string, busy: BusyRange[]): string[] {
  const minStart = Date.now() + MIN_NOTICE_MS;
  return allSlots().filter((time) => {
    const start = parisToUtc(dateStr, time);
    const end = new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);
    if (start.getTime() < minStart) return false;
    return !busy.some(
      (b) => start < new Date(b.end) && end > new Date(b.start),
    );
  });
}
