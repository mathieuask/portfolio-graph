import { freeBusy } from "@/lib/google";
import { freeSlots, isValidDate, parisToUtc } from "@/lib/slots";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!isValidDate(date)) {
    return Response.json({ error: "date invalide" }, { status: 400 });
  }
  try {
    const busy = await freeBusy(
      parisToUtc(date, "00:00").toISOString(),
      parisToUtc(date, "23:59").toISOString(),
    );
    return Response.json({ slots: freeSlots(date, busy) });
  } catch {
    return Response.json({ error: "calendrier indisponible" }, { status: 502 });
  }
}
