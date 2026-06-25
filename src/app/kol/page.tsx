"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { competitorBrands } from "@/lib/competitor-data";
import {
  Users, TrendingUp, ExternalLink,
} from "lucide-react";

const brandColorMap: Record<string, string> = {
  "br1": "bg-emerald-500",
  "br2": "bg-red-500",
  "br3": "bg-blue-500",
  "br4": "bg-amber-500",
};

const platformLabel: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", facebook: "Facebook" };

interface KOLCollab {
  id: string;
  kolHandle: string;
  kolName: string;
  platform: "tiktok" | "instagram" | "facebook";
  followers: number;
  contentStyle: string;
  brandId: string;
  brandName: string;
  date: string;
  content: string;
  engagementRate: number;
}

const kolCollabs: KOLCollab[] = [
  // 喜茶 collabs
  { id: "k1", kolHandle: "@nycfoodgirl", kolName: "NYC Food Girl", platform: "tiktok", followers: 2800000, contentStyle: "美食测评", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-06-11", content: "纽约新店开业探店，芝士奶盖系列测评视频", engagementRate: 4.2 },
  { id: "k2", kolHandle: "@sportsdrinkreviews", kolName: "Sports Drink Reviews", platform: "instagram", followers: 850000, contentStyle: "运动/赛事", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-06-10", content: "NBA联名系列限定杯身开箱+口味测评", engagementRate: 5.8 },
  { id: "k3", kolHandle: "@asianfoodie_la", kolName: "Asian Foodie LA", platform: "tiktok", followers: 1200000, contentStyle: "亚洲美食", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-05-22", content: "纽约Soho门店预热探店，品牌故事内容", engagementRate: 3.5 },
  { id: "k4", kolHandle: "@drinkphotographer", kolName: "Drink Photographer", platform: "instagram", followers: 620000, contentStyle: "美食摄影", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-04-16", content: "夏季水果系列新品视觉内容拍摄", engagementRate: 6.1 },

  // 蜜雪冰城 collabs
  { id: "k5", kolHandle: "@bobabae_", kolName: "Boba Bae", platform: "tiktok", followers: 3500000, contentStyle: "ASMR/饮品", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-06-14", content: "胡志明市首店探店，椰椰系列ASMR展示", engagementRate: 7.3 },
  { id: "k6", kolHandle: "@vietnamesefoodtour", kolName: "Vietnam Food Tour", platform: "tiktok", followers: 1800000, contentStyle: "美食探店", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-06-13", content: "越南门店开业本地化探店内容", engagementRate: 6.8 },
  { id: "k7", kolHandle: "@cheapeatsclub", kolName: "Cheap Eats Club", platform: "instagram", followers: 950000, contentStyle: "性价比美食", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-06-08", content: "第二杯半价活动推广，强调性价比定位", engagementRate: 4.5 },

  // 瑞幸 collabs
  { id: "k8", kolHandle: "@coffeenerdchina", kolName: "Coffee Nerd", platform: "tiktok", followers: 920000, contentStyle: "咖啡垂类", brandId: "br3", brandName: "瑞幸 Luckin", date: "2026-06-13", content: "生椰拿铁3.0专业测评，云南咖啡豆深度分析", engagementRate: 5.2 },
  { id: "k9", kolHandle: "@budgetcoffeeguide", kolName: "Budget Coffee Guide", platform: "instagram", followers: 680000, contentStyle: "性价比测评", brandId: "br3", brandName: "瑞幸 Luckin", date: "2026-05-28", content: "9.9元咖啡节活动推广+横向对比测评", engagementRate: 6.0 },
  { id: "k10", kolHandle: "@moutaicollabwatch", kolName: "联名观察员", platform: "tiktok", followers: 560000, contentStyle: "联名/潮流", brandId: "br3", brandName: "瑞幸 Luckin", date: "2026-04-12", content: "茅台联名第二弹开箱+话题引爆", engagementRate: 9.2 },

  // CHAGEE collabs
  { id: "k11", kolHandle: "@matchamandy", kolName: "Matcha Mandy", platform: "tiktok", followers: 1500000, contentStyle: "茶道/东方美学", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-06-15", content: "品牌历史故事纪录片风格合作，茶山溯源内容", engagementRate: 7.8 },
  { id: "k12", kolHandle: "@orientalstyle_daily", kolName: "东方美学日常", platform: "instagram", followers: 780000, contentStyle: "生活方式/美学", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-06-08", content: "创始人故事合作内容，东方美学品牌叙事", engagementRate: 5.5 },
  { id: "k13", kolHandle: "@pinoyfoodie", kolName: "Pinoy Foodie", platform: "tiktok", followers: 2100000, contentStyle: "菲律宾美食", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-05-12", content: "菲律宾市场优惠券+买一送一活动推广", engagementRate: 6.3 },
];

export default function KolPage() {
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "engagement">("date");

  const filtered = kolCollabs
    .filter((k) => brandFilter === "all" || k.brandId === brandFilter)
    .sort((a, b) => sortBy === "date"
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : b.engagementRate - a.engagementRate);

  // Group by brand for summary
  const brandKolCount: Record<string, number> = {};
  kolCollabs.forEach((k) => { brandKolCount[k.brandId] = (brandKolCount[k.brandId] || 0) + 1; });

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">KOL 合作追踪</h1>
        <p className="mt-0.5 text-sm text-slate-400">追踪竞品品牌在 TikTok/Instagram/Facebook 上的 KOL 合作动态</p>
      </div>

      {/* Brand filter + sort */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 shrink-0 mr-0.5">品牌:</span>
          <button
            onClick={() => setBrandFilter("all")}
            className={cn("px-2.5 py-1 text-sm rounded-md transition-colors", brandFilter === "all" ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}
          >
            全部 ({kolCollabs.length})
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
              {b.name} ({brandKolCount[b.id] || 0})
            </button>
          ))}
          <span className="text-slate-700 mx-2">|</span>
          <span className="text-xs text-slate-500 shrink-0">排序:</span>
          {(["date", "engagement"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn("px-2.5 py-1 text-sm rounded-md transition-colors", sortBy === s ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}
            >
              {s === "date" ? "最新" : "互动率最高"}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500">{filtered.length} 个合作</span>
        </div>
      </div>

      {/* KOL cards */}
      <div className="space-y-3">
        {filtered.map((k) => {
          const brand = competitorBrands.find((b) => b.id === k.brandId);
          return (
            <div key={k.id} className="rounded-xl border border-slate-700 bg-slate-800/40 overflow-hidden group hover:border-amber-500/20 transition-colors">
              <div className="flex items-start gap-4 p-4">
                {/* KOL avatar placeholder */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-base font-bold text-slate-300">
                  {k.kolName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-100">{k.kolHandle}</h3>
                    <span className="text-sm text-slate-500">{k.kolName}</span>
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                      {platformLabel[k.platform]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>{(k.followers / 10000).toFixed(0)}万 粉丝</span>
                    <span>{k.contentStyle}</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      互动率 {k.engagementRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", brandColorMap[k.brandId])} />
                    <span className="text-sm text-slate-400">
                      合作品牌: <span className="text-slate-300">{k.brandName}</span>
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-sm text-slate-500">{k.date}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1.5">{k.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p>该品牌暂无KOL合作数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
