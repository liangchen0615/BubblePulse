"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Market, Country, Language, Emotion, Brand } from "@/types";
import { defaultBrand } from "@/lib/mock-data";

export interface BrandPresetFilters {
  markets: Market[];
  countries: Country[];
  languages: Language[];
  emotions: Emotion[];
  ageMin: number;
  ageMax: number;
  gender: string;
}

function buildPresetFilters(brand: Brand): BrandPresetFilters {
  const markets = brand.markets;
  const countries: Country[] = [];
  const regionCountries: Record<Market, Country[]> = {
    US: ["US", "CA"], UK: ["UK", "FR", "DE"], AU: ["AU"],
    SEA: ["SG", "MY", "TH", "ID", "PH", "VN", "JP", "KR", "CN"],
  };
  for (const m of markets) {
    countries.push(...(regionCountries[m] || []));
  }

  const allInterests = new Set(brand.targetAudiences.flatMap((ta) => ta.interests.map((i) => i.toLowerCase())));
  const emotions: Emotion[] = [];
  if (allInterests.has("wellness") || allInterests.has("茶文化") || allInterests.has("minimalism")) emotions.push("calm");
  if (allInterests.has("anime") || allInterests.has("k-pop") || allInterests.has("genshin impact")) emotions.push("excitement");
  if (allInterests.has("aesthetic") || allInterests.has("东方美学") || allInterests.has("travel")) emotions.push("awe");
  if (allInterests.has("fashion") || allInterests.has("streetwear")) emotions.push("nostalgia");
  if (allInterests.has("lifestyle")) emotions.push("curiosity");
  if (!emotions.length) emotions.push("joy", "calm", "curiosity");

  const ages = brand.targetAudiences.flatMap((ta) => ta.ageRange);
  const ageMin = Math.min(...ages);
  const ageMax = Math.max(...ages);

  const isFemaleOnly = brand.targetAudiences.every((ta) => ta.gender === "female");

  const marketLanguageMap: Record<string, Language[]> = {
    US: ["en"], UK: ["en", "fr", "de"], AU: ["en"],
    SEA: ["en", "zh", "ja", "ko", "th", "id", "vi", "tl", "ms"],
  };
  const languages: Language[] = [];
  for (const m of markets) {
    for (const l of marketLanguageMap[m] || ["en"]) {
      if (!languages.includes(l)) languages.push(l);
    }
  }

  return {
    markets,
    countries: [...new Set(countries)],
    languages,
    emotions: [...new Set(emotions)],
    ageMin,
    ageMax,
    gender: isFemaleOnly ? "female" : "all",
  };
}

interface BrandContextType {
  brand: Brand;
  updateBrand: (b: Brand) => void;
  brandPreset: boolean;
  toggleBrandPreset: () => void;
  setBrandPreset: (v: boolean) => void;
  brandFilters: BrandPresetFilters;
}

const BrandContext = createContext<BrandContextType>({
  brand: defaultBrand,
  updateBrand: () => {},
  brandPreset: false,
  toggleBrandPreset: () => {},
  setBrandPreset: () => {},
  brandFilters: buildPresetFilters(defaultBrand),
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<Brand>(defaultBrand);
  const [brandPreset, setBrandPreset] = useState(false);

  const toggleBrandPreset = useCallback(() => {
    setBrandPreset((prev) => !prev);
  }, []);

  const updateBrand = useCallback((b: Brand) => {
    setBrand(b);
  }, []);

  const brandFilters = buildPresetFilters(brand);

  return (
    <BrandContext.Provider value={{ brand, updateBrand, brandPreset, toggleBrandPreset, setBrandPreset, brandFilters }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrandPreset() {
  return useContext(BrandContext);
}
