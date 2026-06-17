"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Plus, X, Sparkles, Pencil, Trash2, Layers } from "lucide-react";
import { useBrandPreset } from "@/lib/brand-context";
import { countryLabel, languageLabel, emotionLabel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Brand, Market, Country, Language, Emotion, BrandStrategy } from "@/types";

const marketLabel: Record<Market, string> = { US: "美国", UK: "英国", AU: "澳洲", SEA: "东南亚" };
const allCountries = Object.keys(countryLabel) as Country[];
const allLanguages = Object.keys(languageLabel) as Language[];
const allEmotions = Object.keys(emotionLabel) as Emotion[];

function generateId() { return `s${Date.now()}`; }

function emptyStrategy(): BrandStrategy {
  return { id: generateId(), name: "", markets: [], countries: [], languages: [], emotions: [], ageMin: 18, ageMax: 35, gender: "all" };
}

export default function BrandSettingsPage() {
  const { brand: ctxBrand, updateBrand, strategies, addStrategy, updateStrategy, deleteStrategy } = useBrandPreset();

  const [brand, setBrand] = useState<Brand>(ctxBrand);
  const [saved, setSaved] = useState(false);
  const [newInterest0, setNewInterest0] = useState("");
  const [newInterest1, setNewInterest1] = useState("");
  const [newStyle, setNewStyle] = useState("");

  // Strategy editor
  const [editing, setEditing] = useState<BrandStrategy | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { setBrand(ctxBrand); }, [ctxBrand]);

  const handleSaveBrand = () => { updateBrand(brand); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const updateAudience = (idx: number, u: Partial<typeof brand.targetAudiences[0]>) => {
    const a = [...brand.targetAudiences]; a[idx] = { ...a[idx]!, ...u }; setBrand({ ...brand, targetAudiences: a });
  };
  const addInterest = (idx: number, val: string) => { if (!val.trim()) return; updateAudience(idx, { interests: [...brand.targetAudiences[idx]!.interests, val.trim()] }); idx === 0 ? setNewInterest0("") : setNewInterest1(""); };
  const removeInterest = (idx: number, i: string) => { updateAudience(idx, { interests: brand.targetAudiences[idx]!.interests.filter((x) => x !== i) }); };
  const toggleMarket = (m: Market) => setBrand({ ...brand, markets: brand.markets.includes(m) ? brand.markets.filter((x) => x !== m) : [...brand.markets, m] });
  const toggleStyle = (s: string) => setBrand({ ...brand, visualStyle: brand.visualStyle.includes(s) ? brand.visualStyle.filter((x) => x !== s) : [...brand.visualStyle, s] });

  // Strategy editing
  const openNew = () => { setEditing(emptyStrategy()); setEditOpen(true); };
  const openEdit = (s: BrandStrategy) => { setEditing({ ...s }); setEditOpen(true); };
  const saveStrategy = () => {
    if (!editing || !editing.name.trim()) return;
    if (strategies.find((s) => s.id === editing.id)) updateStrategy(editing);
    else addStrategy(editing);
    setEditOpen(false);
  };
  const delStrategy = (id: string) => { if (confirm("删除此策略？")) deleteStrategy(id); };
  const toggleEditItem = (field: keyof BrandStrategy, val: any) => {
    if (!editing) return;
    const arr = editing[field] as any[];
    setEditing({ ...editing, [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">品牌设置</h1>
          <p className="mt-1 text-sm text-slate-400">品牌画像 + 策略预设管理</p>
        </div>
        <Button size="lg" className="gap-2 bg-amber-500 text-black hover:bg-amber-400" onClick={handleSaveBrand}>
          {saved ? <><Sparkles className="h-4 w-4" /> 已保存</> : <><CheckCircle2 className="h-4 w-4" /> 保存设置</>}
        </Button>
      </div>

      {/* Brand info */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader><CardTitle className="text-slate-100">基本信息</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-200">品牌名称</label>
            <Input value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-slate-200">品类</label><Input value={brand.category} onChange={(e) => setBrand({ ...brand, category: e.target.value })} className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9" /></div>
            <div><label className="text-sm font-medium text-slate-200">价格带</label><Input value={brand.priceTier} onChange={(e) => setBrand({ ...brand, priceTier: e.target.value })} className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9" /></div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200">视觉风格</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {["Oriental Aesthetic", "Modern", "Minimalist", "Luxury", "Playful", "Eco Natural"].map((s) => (
                <Badge key={s} variant={brand.visualStyle.includes(s) ? "secondary" : "outline"} className={cn("cursor-pointer text-xs", brand.visualStyle.includes(s) ? "bg-slate-700 text-slate-200" : "border-slate-600 text-slate-500 hover:border-slate-500")} onClick={() => toggleStyle(s)}>{s}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Markets */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader><CardTitle className="text-slate-100">目标市场</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(marketLabel) as Market[]).map((m) => (
              <div key={m} className="flex items-center gap-3"><Checkbox id={`mkt-${m}`} checked={brand.markets.includes(m)} onCheckedChange={() => toggleMarket(m)} /><label htmlFor={`mkt-${m}`} className="text-sm text-slate-300 cursor-pointer">{marketLabel[m]}</label></div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audiences (compact) */}
      {brand.targetAudiences.map((ta, idx) => (
        <Card key={ta.id} className="border-slate-700 bg-slate-800/50">
          <CardHeader><CardTitle className="text-slate-100 text-base">目标人群 {idx + 1}: {ta.name}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-200">年龄</label>
                <div className="flex items-center gap-2 mt-2"><span className="text-xs text-slate-400 w-6">{ta.ageRange[0]}</span><Slider value={ta.ageRange} onValueChange={(v) => { const a = Array.isArray(v) ? v : [v]; if (a.length >= 2) updateAudience(idx, { ageRange: [a[0]!, a[1]!] }); }} min={13} max={55} step={1} className="flex-1" /><span className="text-xs text-slate-400 w-6">{ta.ageRange[1]}</span></div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">性别</label>
                <div className="flex items-center gap-4 mt-2">
                  {(["female", "male", "all"] as const).map((g) => (<div key={g} className="flex items-center gap-2"><Checkbox id={`g-${idx}-${g}`} checked={ta.gender === g} onCheckedChange={() => updateAudience(idx, { gender: g })} /><label htmlFor={`g-${idx}-${g}`} className="text-sm text-slate-300 cursor-pointer">{g === "female" ? "女" : g === "male" ? "男" : "不限"}</label></div>))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">兴趣</label>
              <div className="flex flex-wrap gap-1 mt-1.5">{ta.interests.map((i) => (<Badge key={i} variant="secondary" className="gap-1 bg-slate-700 text-slate-200">{i}<button onClick={() => removeInterest(idx, i)} className="ml-0.5 rounded-full p-0.5 hover:bg-slate-600"><X className="h-3 w-3" /></button></Badge>))}</div>
              <div className="flex items-center gap-2 mt-2"><Input placeholder="添加兴趣" className="w-40 h-8 text-sm border-slate-700 bg-slate-800 text-slate-100" value={idx === 0 ? newInterest0 : newInterest1} onChange={(e) => idx === 0 ? setNewInterest0(e.target.value) : setNewInterest1(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addInterest(idx, idx === 0 ? newInterest0 : newInterest1); }} /><Button variant="outline" size="sm" className="border-slate-700 text-slate-300 text-xs h-8" onClick={() => addInterest(idx, idx === 0 ? newInterest0 : newInterest1)}>添加</Button></div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Separator className="bg-slate-700" />

      {/* Strategy presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-100">策略预设</h2>
          </div>
          <Button variant="outline" size="sm" className="gap-1 border-slate-700 text-slate-300 text-xs h-8" onClick={openNew}><Plus className="h-3.5 w-3.5" />新建策略</Button>
        </div>
        <div className="space-y-2">
          {strategies.map((s) => (
            <Card key={s.id} className="border-slate-700 bg-slate-800/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-200 text-sm">{s.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.markets.map((m) => marketLabel[m]).join(" · ")} · {s.ageMin}-{s.ageMax}岁 · {s.gender === "female" ? "女" : s.gender === "male" ? "男" : "不限"} · {s.languages.length} 语言 · {s.emotions.length} 情绪
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-red-400" onClick={() => delStrategy(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {strategies.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">暂无策略预设，点击"新建策略"创建</p>}
        </div>
      </div>

      {/* Strategy edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto border-slate-700 bg-slate-900">
          <SheetHeader>
            <SheetTitle className="text-slate-50">{editing && strategies.find((s) => s.id === editing.id) ? "编辑策略" : "新建策略"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-200">策略名称</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="如：北美年轻女性" className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200">目标市场</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {(Object.keys(marketLabel) as Market[]).map((m) => (
                    <div key={m} className="flex items-center gap-2"><Checkbox id={`es-mkt-${m}`} checked={editing.markets.includes(m)} onCheckedChange={() => toggleEditItem("markets", m)} /><label htmlFor={`es-mkt-${m}`} className="text-xs text-slate-300">{marketLabel[m]}</label></div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200">国家</label>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {allCountries.map((c) => (
                    <Badge key={c} variant={editing.countries.includes(c) ? "secondary" : "outline"} className={cn("cursor-pointer text-xs", editing.countries.includes(c) ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "border-slate-600 text-slate-500 hover:border-slate-500")} onClick={() => toggleEditItem("countries", c)}>{countryLabel[c]}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200">语言</label>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {allLanguages.map((l) => (
                    <Badge key={l} variant={editing.languages.includes(l) ? "secondary" : "outline"} className={cn("cursor-pointer text-xs", editing.languages.includes(l) ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "border-slate-600 text-slate-500 hover:border-slate-500")} onClick={() => toggleEditItem("languages", l)}>{languageLabel[l]}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200">情绪偏好</label>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {allEmotions.map((e) => (
                    <Badge key={e} variant={editing.emotions.includes(e) ? "secondary" : "outline"} className={cn("cursor-pointer text-xs", editing.emotions.includes(e) ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "border-slate-600 text-slate-500 hover:border-slate-500")} onClick={() => toggleEditItem("emotions", e)}>{emotionLabel[e]}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-200">年龄范围: {editing.ageMin}-{editing.ageMax}岁</label>
                  <Slider value={[editing.ageMin, editing.ageMax]} onValueChange={(v) => { const a = Array.isArray(v) ? v : [v, v]; setEditing({ ...editing, ageMin: a[0]!, ageMax: a[1]! }); }} min={13} max={55} step={1} className="mt-2" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200">性别</label>
                  <div className="flex items-center gap-3 mt-2">
                    {(["female", "male", "all"] as const).map((g) => (<div key={g} className="flex items-center gap-2"><Checkbox id={`es-g-${g}`} checked={editing.gender === g} onCheckedChange={() => setEditing({ ...editing, gender: g })} /><label htmlFor={`es-g-${g}`} className="text-sm text-slate-300">{g === "female" ? "女" : g === "male" ? "男" : "不限"}</label></div>))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-amber-500 text-black hover:bg-amber-400" onClick={saveStrategy}>保存策略</Button>
                <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setEditOpen(false)}>取消</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
