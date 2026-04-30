// Mock subscription tier — Phase 3 UI only. No Stripe, no DB.
import { useEffect, useState } from "react";

export type Tier = "free" | "consumer" | "practitioner";

const KEY = "mockTier";
const EVT = "mockTier:change";

export function getTier(): Tier {
  if (typeof window === "undefined") return "consumer";
  const v = localStorage.getItem(KEY) as Tier | null;
  return v ?? "consumer";
}

export function setTier(tier: Tier) {
  localStorage.setItem(KEY, tier);
  window.dispatchEvent(new CustomEvent(EVT, { detail: tier }));
}

export function useTier() {
  const [tier, setTierState] = useState<Tier>(() => getTier());

  useEffect(() => {
    const handler = (e: Event) => setTierState((e as CustomEvent<Tier>).detail);
    const storageHandler = () => setTierState(getTier());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  return { tier, setTier };
}

export const TIER_LABEL: Record<Tier, string> = {
  free: "Free",
  consumer: "Consumer",
  practitioner: "Practitioner",
};

export const TIER_PRICE: Record<Tier, string> = {
  free: "$0",
  consumer: "$24/mo",
  practitioner: "$97/mo",
};
