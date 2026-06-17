"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Plus, X, Sparkles } from "lucide-react";
import { useBrandPreset } from "@/lib/brand-context";
import type { Brand, Market } from "@/types";

const marketLabel: Record<Market, string> = { US: "美国", UK: "英国", AU: "澳洲", SEA: "东南亚" };

export default function BrandSettingsPage() {
  const { brand: ctxBrand, updateBrand } = useBrandPreset();

  const [brand, setBrand] = useState<Brand>(ctxBrand);
  const [saved, setSaved] = useState(false);
  const [newInterest0, setNewInterest0] = useState("");
  const [newInterest1, setNewInterest1] = useState("");
  const [newStyle, setNewStyle] = useState("");

  // Sync from context when it changes externally
  useEffect(() => { setBrand(ctxBrand); }, [ctxBrand]);

  const handleSave = () => {
    updateBrand(brand);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateAudience = (idx: number, update: Partial<typeof brand.targetAudiences[0]>) => {
    const updated = [...brand.targetAudiences];
    updated[idx] = { ...updated[idx], ...update };
    setBrand({ ...brand, targetAudiences: updated });
  };

  const addInterest = (idx: number, val: string) => {
    if (!val.trim()) return;
    updateAudience(idx, { interests: [...brand.targetAudiences[idx]!.interests, val.trim()] });
    idx === 0 ? setNewInterest0("") : setNewInterest1("");
  };

  const removeInterest = (idx: number, interest: string) => {
    updateAudience(idx, { interests: brand.targetAudiences[idx]!.interests.filter((i) => i !== interest) });
  };

  const toggleMarket = (m: Market) => {
    const has = brand.markets.includes(m);
    setBrand({ ...brand, markets: has ? brand.markets.filter((x) => x !== m) : [...brand.markets, m] });
  };

  const addStyle = () => {
    if (!newStyle.trim()) return;
    setBrand({ ...brand, visualStyle: [...brand.visualStyle, newStyle.trim()] });
    setNewStyle("");
  };

  const removeStyle = (s: string) => {
    setBrand({ ...brand, visualStyle: brand.visualStyle.filter((x) => x !== s) });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">品牌设置</h1>
          <p className="mt-1 text-sm text-slate-400">
            设定品牌画像。所有热点、KOL、IP 的匹配度都基于此计算。
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2 bg-amber-500 text-black hover:bg-amber-400"
          onClick={handleSave}
        >
          {saved ? (
            <>
              <Sparkles className="h-4 w-4" /> 已保存
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" /> 保存设置
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-100">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-200">品牌名称</label>
              <Input
                value={brand.name}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">品类</label>
              <Input
                value={brand.category}
                onChange={(e) => setBrand({ ...brand, category: e.target.value })}
                className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">价格带</label>
              <Input
                value={brand.priceTier}
                onChange={(e) => setBrand({ ...brand, priceTier: e.target.value })}
                className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">视觉风格</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {brand.visualStyle.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 bg-slate-700 text-slate-200">
                    {s}
                    <button onClick={() => removeStyle(s)} className="ml-0.5 rounded-full p-0.5 hover:bg-slate-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="添加视觉风格"
                  className="w-40 h-8 text-sm border-slate-700 bg-slate-800 text-slate-100"
                  value={newStyle}
                  onChange={(e) => setNewStyle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addStyle(); }}
                />
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 text-xs h-8" onClick={addStyle}>添加</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Markets */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-100">目标市场</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(marketLabel) as Market[]).map((m) => (
                <div key={m} className="flex items-center gap-3">
                  <Checkbox
                    id={`market-${m}`}
                    checked={brand.markets.includes(m)}
                    onCheckedChange={() => toggleMarket(m)}
                  />
                  <label htmlFor={`market-${m}`} className="text-sm text-slate-300 cursor-pointer">
                    {marketLabel[m]}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Target audiences */}
        {brand.targetAudiences.map((ta, idx) => (
          <Card key={ta.id} className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-slate-100">
                <Input
                  value={ta.name}
                  onChange={(e) => updateAudience(idx, { name: e.target.value })}
                  className="border-none bg-transparent text-slate-100 font-semibold p-0 h-auto text-lg w-auto min-w-40"
                  placeholder="目标人群名称"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-200">年龄范围</label>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-slate-400 w-8">{ta.ageRange[0]}</span>
                    <Slider
                      value={ta.ageRange}
                      onValueChange={(v) => {
                        const arr = Array.isArray(v) ? v : [v];
                        if (arr.length >= 2) updateAudience(idx, { ageRange: [arr[0]!, arr[1]!] as [number, number] });
                      }}
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
                        <Checkbox
                          id={`gender-${idx}-${g}`}
                          checked={ta.gender === g}
                          onCheckedChange={() => updateAudience(idx, { gender: g })}
                        />
                        <label htmlFor={`gender-${idx}-${g}`} className="text-sm text-slate-300 cursor-pointer">
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
                      <button onClick={() => removeInterest(idx, i)} className="ml-0.5 rounded-full p-0.5 hover:bg-slate-600">
                        <X className="h-3 w-3" />
                      </button>
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
                      if (e.key === "Enter") addInterest(idx, idx === 0 ? newInterest0 : newInterest1);
                    }}
                  />
                  <Button
                    variant="outline" size="sm"
                    className="border-slate-700 text-slate-300 text-xs h-8"
                    onClick={() => addInterest(idx, idx === 0 ? newInterest0 : newInterest1)}
                  >
                    添加
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
