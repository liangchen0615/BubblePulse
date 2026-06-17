import { NextResponse } from "next/server";
import { ips as mockIps } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "mock"; // mock | wikipedia | merged
  const max = Math.min(parseInt(searchParams.get("max") || "8", 10), 20);

  let items = [...mockIps];
  const sources: string[] = source !== "wikipedia" ? ["mock"] : [];

  if (source === "wikipedia" || source === "merged") {
    try {
      const wikiRes = await fetch(`http://localhost:3000/api/wikipedia/trending?max=${max}`);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        items = [...items, ...wikiData.items];
        sources.push("wikipedia");
      }
    } catch {}
  }

  const seen = new Set<string>();
  items = items.filter((item) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });

  return NextResponse.json({ items: items.slice(0, max), sources, total: Math.min(items.length, max), fetchedAt: new Date().toISOString() });
}
