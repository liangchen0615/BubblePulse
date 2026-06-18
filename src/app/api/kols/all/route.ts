import { NextResponse } from "next/server";
import { kols as mockKols } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "mock"; // mock | youtube | merged
  const max = Math.min(parseInt(searchParams.get("max") || "10", 10), 20);

  let items = source === "mock" ? [...mockKols] : [];
  const sources: string[] = source === "mock" ? ["mock"] : [];

  if (source === "youtube" || source === "merged") {
    try {
      const fetchMax = source === "merged" ? 20 : max; // pull more for merged mode
      const ytRes = await fetch(`http://localhost:3000/api/youtube/channels?max=${fetchMax}`);
      if (ytRes.ok) {
        const ytData = await ytRes.json();
        items = [...items, ...ytData.items];
        sources.push("youtube");
      }
    } catch {}
  }

  const seen = new Set<string>();
  items = items.filter((item) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });

  return NextResponse.json({ items: items.slice(0, max), sources, total: Math.min(items.length, max), fetchedAt: new Date().toISOString() });
}
