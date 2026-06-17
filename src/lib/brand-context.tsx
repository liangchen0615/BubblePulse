"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Market, Country, Language, Emotion } from "@/types";

const regionCountries: Record<Market, Country[]> = {
  US: ["US", "CA"],
  UK: ["UK", "FR", "DE"],
  AU: ["AU"],
  SEA: ["SG", "MY", "TH", "ID", "PH", "VN", "JP", "KR", "CN"],
};

interface BrandFilterValues {
  markets: Market[];
  countries: Country[];
  ageMin: number;
  ageMax: number;
  gender: string;
  languages: Language[];
  emotions: Emotion[];
}

const chageeFilters: BrandFilterValues = {
  markets: ["US", "UK", "SEA"],
  countries: ["US", "CA", "UK", "FR", "DE", "SG", "MY", "TH", "ID", "PH", "VN", "JP", "KR", "CN"],
  ageMin: 18,
  ageMax: 35,
  gender: "all",
  languages: ["en", "zh", "ja", "ko", "th", "fr", "de"],
  emotions: ["calm", "awe", "excitement", "nostalgia"],
};

interface BrandContextType {
  brandPreset: boolean;
  toggleBrandPreset: () => void;
  brandFilters: BrandFilterValues;
}

const BrandContext = createContext<BrandContextType>({
  brandPreset: false,
  toggleBrandPreset: () => {},
  brandFilters: chageeFilters,
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandPreset, setBrandPreset] = useState(false);

  const toggleBrandPreset = () => setBrandPreset((prev) => !prev);

  return (
    <BrandContext.Provider value={{ brandPreset, toggleBrandPreset, brandFilters: chageeFilters }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrandPreset() {
  return useContext(BrandContext);
}
