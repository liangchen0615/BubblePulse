"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { competitorBrands } from "@/lib/competitor-data";
import { Target, TrendingUp } from "lucide-react";

const brandColorMap: Record<string, string> = {
  "br1": "bg-emerald-500",
  "br2": "bg-red-500",
  "br3": "bg-blue-500",
  "br4": "bg-amber-500",
};

interface IPCollab {
  id: string;
  ipName: string;
  ipCategory: string;
  brandId: string;
  brandName: string;
  date: string;
  description: string;
  platform: string;
  heat: "高" | "中" | "低";
  socialImpression: string;
}

const ipCollabs: IPCollab[] = [
  // 喜茶 collabs
  { id: "ip1", ipName: "NBA", ipCategory: "体育赛事", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-06-11", description: "NBA总决赛联名系列：撞色限定杯身+球队主题特调", platform: "Instagram", heat: "高", socialImpression: "百万级话题曝光，美国市场品牌认知度显著提升" },
  { id: "ip2", ipName: "纽约Soho商业区", ipCategory: "地标/商业IP", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-05-20", description: "纽约Soho首店开业联动：门店设计融入Soho艺术街区美学", platform: "Instagram", heat: "高", socialImpression: "纽约本地媒体和KOL自发传播，开业首周排队现象成为内容热点" },

  // 蜜雪冰城 collabs
  { id: "ip3", ipName: "Hello Kitty", ipCategory: "卡通角色", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-04-20", description: "Hello Kitty联名杯+周边套装，粉色主题限定", platform: "Instagram", heat: "高", socialImpression: "女性消费者社交分享爆发，东南亚市场尤其活跃" },
  { id: "ip4", ipName: "越南胡志明市", ipCategory: "城市/文化IP", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-06-14", description: "胡志明市首店 × 本地文化IP：门店设计融入越南街头文化元素", platform: "TikTok", heat: "高", socialImpression: "越南TikTok探店UGC爆发，单日话题播放量破千万" },

  // 瑞幸 collabs
  { id: "ip5", ipName: "贵州茅台", ipCategory: "品牌IP", brandId: "br3", brandName: "瑞幸 Luckin", date: "2026-04-12", description: "茅台联名第二弹：酱香拿铁限定返场+新口味拓展", platform: "Instagram", heat: "高", socialImpression: "第一次联名话题度延续，二次联名社会讨论度依然高企" },
  { id: "ip6", ipName: "新加坡", ipCategory: "城市/文化IP", brandId: "br3", brandName: "瑞幸 Luckin", date: "2026-05-05", description: "新加坡第20店 × 狮城文化IP：本土化限定口味+城市主题杯身", platform: "TikTok", heat: "中", socialImpression: "新加坡本地媒体自发报道，东南亚市场扩张信号" },

  // CHAGEE collabs
  { id: "ip7", ipName: "云南茶文化", ipCategory: "文化IP", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-06-15", description: "茶叶产地溯源纪录片系列×云南茶山文化：从云南到全球的品牌故事", platform: "TikTok", heat: "中", socialImpression: "品牌文化深度内容，受众粘性高于产品推新内容" },
  { id: "ip8", ipName: "东方美学", ipCategory: "文化IP", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-06-08", description: "创始人故事×东方美学IP：'从云南茶山到全球化'品牌叙事系列", platform: "TikTok", heat: "中", socialImpression: "品牌辨识度内容策略，与高频推新形成差异化" },
  { id: "ip9", ipName: "菲律宾文化节日", ipCategory: "节庆IP", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-04-05", description: "菲律宾本地文化节日联名：当地IP合作+传统元素限定杯身", platform: "TikTok", heat: "低", socialImpression: "本地化策略试水，在菲律宾市场获得基础品牌认知" },
];

const heatBadge: Record<string, string> = { "高": "bg-red-500/20 text-red-400", "中": "bg-amber-500/20 text-amber-400", "低": "bg-slate-500/20 text-slate-400" };

export default function IpTrackerPage() {
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = ["all", ...new Set(ipCollabs.map((ip) => ip.ipCategory))];

  const filtered = ipCollabs
    .filter((ip) => brandFilter === "all" || ip.brandId === brandFilter)
    .filter((ip) => categoryFilter === "all" || ip.ipCategory === categoryFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const brandIpCount: Record<string, number> = {};
  ipCollabs.forEach((ip) => { brandIpCount[ip.brandId] = (brandIpCount[ip.brandId] || 0) + 1; });

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">IP 联动追踪</h1>
        <p className="mt-0.5 text-sm text-slate-400">追踪竞品品牌的 IP 联名合作动态 · 发现 IP 合作趋势和空白机会</p>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 shrink-0 mr-0.5">品牌:</span>
          <button
            onClick={() => setBrandFilter("all")}
            className={cn("px-2.5 py-1 text-sm rounded-md transition-colors", brandFilter === "all" ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}
          >
            全部 ({ipCollabs.length})
          </button>
          {competitorBrands.map((b) => (
            <button
              key={b.id}
              onClick={() => setBrandFilter(b.id)}
              className={cn(
                "px-2.5 py-1 text-sm rounded-md transition-colors flex items-center gap-1.5",
                brandFilter === b.id ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full shrink-0", brandColorMap[b.id])} />
              {b.name} ({brandIpCount[b.id] || 0})
            </button>
          ))}
          <span className="text-slate-700 mx-2">|</span>
          <span className="text-xs text-slate-500 shrink-0">IP类型:</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={cn("px-2.5 py-1 text-sm rounded-md transition-colors", categoryFilter === c ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}
            >
              {c === "all" ? "全部" : c}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500">{filtered.length} 个联名</span>
        </div>
      </div>

      {/* IP cards */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((ip) => (
          <div key={ip.id} className="rounded-xl border border-slate-700 bg-slate-800/40 overflow-hidden group hover:border-amber-500/20 transition-colors p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-lg">
                {ip.ipCategory === "体育赛事" ? "🏈" : ip.ipCategory === "卡通角色" ? "🐱" : ip.ipCategory === "品牌IP" ? "🍶" : ip.ipCategory === "文化IP" ? "🎋" : ip.ipCategory === "节庆IP" ? "🎪" : ip.ipCategory === "城市/文化IP" ? "🏙" : ip.ipCategory === "地标/商业IP" ? "🏢" : "📌"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-slate-100">{ip.ipName}</h3>
                  <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">{ip.ipCategory}</Badge>
                  <span className={cn("text-[10px] px-1 py-0.5 rounded shrink-0", heatBadge[ip.heat])}>
                    {ip.heat === "高" ? "🔥" : ""} {ip.heat}
                  </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{ip.description}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", brandColorMap[ip.brandId])} />
                  <span className="text-sm text-slate-500">
                    合作: <span className="text-slate-300">{ip.brandName}</span>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-sm text-slate-500">{ip.date}</span>
                  <span className="text-slate-600">·</span>
                  <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-500">{ip.platform}</Badge>
                </div>
                <p className="text-xs text-amber-400/70 mt-2">{ip.socialImpression}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Target className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p>该筛选条件下无IP联名数据</p>
        </div>
      )}
    </div>
  );
}
