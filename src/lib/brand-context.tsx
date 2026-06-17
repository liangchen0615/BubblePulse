"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Brand, BrandStrategy } from "@/types";
import { defaultBrand } from "@/lib/mock-data";

const defaultStrategies: BrandStrategy[] = [
  {
    id: "s1", name: "北美年轻女性",
    markets: ["US"], countries: ["US", "CA"],
    languages: ["en"], emotions: ["calm", "awe", "empathy"],
    ageMin: 22, ageMax: 35, gender: "female",
  },
  {
    id: "s2", name: "东南亚 Z 世代",
    markets: ["SEA"], countries: ["SG", "MY", "TH", "ID", "PH", "VN"],
    languages: ["en", "zh", "th", "id", "vi", "tl", "ms"],
    emotions: ["excitement", "curiosity", "joy", "humor"],
    ageMin: 18, ageMax: 28, gender: "all",
  },
  {
    id: "s3", name: "欧洲 wellness",
    markets: ["UK"], countries: ["UK", "FR", "DE"],
    languages: ["en", "fr", "de"],
    emotions: ["calm", "curiosity", "nostalgia"],
    ageMin: 25, ageMax: 40, gender: "female",
  },
];

interface BrandContextType {
  brand: Brand;
  updateBrand: (b: Brand) => void;
  strategies: BrandStrategy[];
  activeStrategyId: string | null;
  brandPreset: boolean;
  toggleBrandPreset: () => void;
  setActiveStrategy: (id: string | null) => void;
  addStrategy: (s: BrandStrategy) => void;
  updateStrategy: (s: BrandStrategy) => void;
  deleteStrategy: (id: string) => void;
  activeStrategy: BrandStrategy | null;
}

const BrandContext = createContext<BrandContextType>({
  brand: defaultBrand, updateBrand: () => {},
  strategies: defaultStrategies, activeStrategyId: null,
  brandPreset: false, toggleBrandPreset: () => {},
  setActiveStrategy: () => {}, addStrategy: () => {}, updateStrategy: () => {}, deleteStrategy: () => {},
  activeStrategy: null,
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<Brand>(defaultBrand);
  const [strategies, setStrategies] = useState<BrandStrategy[]>(defaultStrategies);
  const [activeStrategyId, setActiveStrategyId] = useState<string | null>(null);
  const [brandPreset, setBrandPreset] = useState(false);

  const updateBrand = useCallback((b: Brand) => { setBrand(b); }, []);
  const toggleBrandPreset = useCallback(() => {
    setBrandPreset((prev) => !prev);
  }, []);

  const setActiveStrategy = useCallback((id: string | null) => {
    setActiveStrategyId(id);
    if (id) setBrandPreset(true);
    else setBrandPreset(false);
  }, []);

  const addStrategy = useCallback((s: BrandStrategy) => {
    setStrategies((prev) => [...prev, s]);
  }, []);

  const updateStrategy = useCallback((s: BrandStrategy) => {
    setStrategies((prev) => prev.map((x) => (x.id === s.id ? s : x)));
  }, []);

  const deleteStrategy = useCallback((id: string) => {
    setStrategies((prev) => prev.filter((x) => x.id !== id));
    if (activeStrategyId === id) {
      setActiveStrategyId(null);
      setBrandPreset(false);
    }
  }, [activeStrategyId]);

  const activeStrategy = strategies.find((s) => s.id === activeStrategyId) || null;

  return (
    <BrandContext.Provider value={{
      brand, updateBrand,
      strategies, activeStrategyId, brandPreset, toggleBrandPreset,
      setActiveStrategy, addStrategy, updateStrategy, deleteStrategy,
      activeStrategy,
    }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrandPreset() {
  return useContext(BrandContext);
}
