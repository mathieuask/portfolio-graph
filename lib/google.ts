const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CAL_BASE = "https://www.googleapis.com/calendar/v3";

let cached: { token: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && Date.now() < cached.exp) return cached.token;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`token refresh: ${res.status}`);
  const data = await res.json();
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in - 60) * 1000 };
  return cached.token;
}

export interface BusyRange {
  start: string;
  end: string;
}

export async function freeBusy(timeMin: string, timeMax: string): Promise<BusyRange[]> {
  const token = await accessToken();
  const res = await fetch(`${CAL_BASE}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: "primary" }] }),
  });
  if (!res.ok) throw new Error(`freeBusy: ${res.status}`);
  const data = await res.json();
  return data.calendars?.primary?.busy ?? [];
}

export async function createEvent(opts: {
  start: string;
  end: string;
  name: string;
  email: string;
  message: string;
}): Promise<string> {
  const token = await accessToken();
  const res = await fetch(
    `${CAL_BASE}/calendars/primary/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `RDV — ${opts.name}`,
        description: `Pris via le portfolio.\n\nContact : ${opts.email}\n\n${opts.message}`,
        start: { dateTime: opts.start, timeZone: "Europe/Paris" },
        end: { dateTime: opts.end, timeZone: "Europe/Paris" },
        attendees: [{ email: opts.email }],
        reminders: { useDefault: true },
      }),
    },
  );
  if (!res.ok) throw new Error(`createEvent: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.id;
}
