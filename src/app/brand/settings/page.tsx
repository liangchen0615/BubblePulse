"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Plus, X } from "lucide-react";
import { defaultBrand } from "@/lib/mock-data";
import type { Market } from "@/types";

const marketLabel: Record<Market, string> = { US: "美国", UK: "英国", AU: "澳洲", SEA: "东南亚" };

export default function BrandSettingsPage() {
  const [brand, setBrand] = useState(defaultBrand);
  const [newInterest0, setNewInterest0] = useState("");
  const [newInterest1, setNewInterest1] = useState("");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">品牌设置</h1>
        <p className="mt-1 text-sm text-slate-400">
          设定品牌画像。所有热点、KOL、IP 的匹配度都基于此计算。
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-100">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-200">品牌名称</label>
              <Input defaultValue={brand.name} className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">品类</label>
              <Input defaultValue={brand.category} className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">价格带</label>
              <Input defaultValue={brand.priceTier} className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">视觉风格</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {brand.visualStyle.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-slate-700 text-slate-200">{s}</Badge>
                ))}
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-700 border-slate-600 text-slate-400">
                  <Plus className="h-3 w-3 mr-1" /> 添加
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-100">目标市场</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(marketLabel) as Market[]).map((m) => (
                <div key={m} className="flex items-center gap-3">
                  <Checkbox id={`market-${m}`} defaultChecked={brand.markets.includes(m)} />
                  <label htmlFor={`market-${m}`} className="text-sm text-slate-300">
                    {marketLabel[m]}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {brand.targetAudiences.map((ta, idx) => (
          <Card key={ta.id} className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-slate-100">目标人群 {idx + 1}: {ta.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-200">年龄范围</label>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-slate-400 w-8">{ta.ageRange[0]}</span>
                    <Slider
                      defaultValue={ta.ageRange}
                      min={13}
                      max={55}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-slate-400 w-8">{ta.ageRange[1]}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200">性别</label>
                  <div className="flex items-center gap-4 mt-2">
                    {(["female", "male", "all"] as const).map((g) => (
                      <div key={g} className="flex items-center gap-2">
                        <Checkbox id={`gender-${idx}-${g}`} defaultChecked={ta.gender === g} />
                        <label htmlFor={`gender-${idx}-${g}`} className="text-sm text-slate-300">
                          {g === "female" ? "女" : g === "male" ? "男" : "不限"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">兴趣标签</label>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {ta.interests.map((i) => (
                    <Badge key={i} variant="secondary" className="gap-1 bg-slate-700 text-slate-200">
                      {i}
                      <X className="h-3 w-3 cursor-pointer" />
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    placeholder="添加兴趣标签"
                    className="w-48 h-8 text-sm border-slate-700 bg-slate-800 text-slate-100"
                    value={idx === 0 ? newInterest0 : newInterest1}
                    onChange={(e) => idx === 0 ? setNewInterest0(e.target.value) : setNewInterest1(e.target.value)}
                    onKeyDown={(e) => {
                      const val = idx === 0 ? newInterest0 : newInterest1;
                      if (e.key === "Enter" && val.trim()) {
                        const updated = [...brand.targetAudiences];
                        updated[idx] = { ...updated[idx], interests: [...updated[idx].interests, val.trim()] };
                        setBrand({ ...brand, targetAudiences: updated });
                        idx === 0 ? setNewInterest0("") : setNewInterest1("");
                      }
                    }}
                  />
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 text-xs h-8">添加</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button size="lg" className="gap-2 bg-amber-500 text-black hover:bg-amber-400">
          <CheckCircle2 className="h-4 w-4" /> 保存设置
        </Button>
      </div>
    </div>
  );
}
