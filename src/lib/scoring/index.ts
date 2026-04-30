// Public API — useVitality() hook.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGemConnection } from "@/contexts/GemConnectionContext";
import { generateDailyPattern } from "./bodyState";
import { buildAllPillars } from "./pillars";
import { computeVitality } from "./vitality";
import { mockWitnesses } from "./mockWitnesses";
import { getBaseline, type Baseline } from "./baseline";
import type { PillarScore, VitalityScore, DailyEnergyPattern } from "./types";

export type { PillarScore, VitalityScore, DailyEnergyPattern, BodyState, SubScore, Confidence, Zone, PillarId, SeverityHitView } from "./types";
export type { Baseline } from "./baseline";

interface UseVitalityResult {
  vitality: VitalityScore;
  pillars: { energy: PillarScore; recovery: PillarScore; stress: PillarScore };
  control: PillarScore;
  bodyState: DailyEnergyPattern;
  hasScan: boolean;
  scanCount: number;
  isStale: boolean;
  baselineRemaining: number;
  baseline: Baseline;
}

const DEFAULT_USER = "guest-anon";

export function useVitality(): UseVitalityResult {
  const { isGemConnected } = useGemConnection();
  const [userId, setUserId] = useState<string>(DEFAULT_USER);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted && data?.user?.id) setUserId(data.user.id);
      else if (mounted && localStorage.getItem("dev-bypass-auth") === "true") {
        setUserId("dev-bypass-user");
      }
    });
    return () => { mounted = false; };
  }, []);

  const lastScanRaw = typeof window !== "undefined" ? localStorage.getItem("lastScanDate") : null;
  const scanCountRaw = typeof window !== "undefined" ? localStorage.getItem("scanCount") : null;
  const scanCount = scanCountRaw ? parseInt(scanCountRaw, 10) || 0 : (lastScanRaw ? 1 : 0);

  return useMemo(() => {
    const bodyState = generateDailyPattern(userId, isGemConnected);
    const { control, energy, recovery, stress } = buildAllPillars(userId, isGemConnected, bodyState);
    const trends = mockWitnesses(userId).trends;
    const vitality = computeVitality(energy, recovery, stress, trends.vitality, isGemConnected);
    const lastScan = lastScanRaw ? new Date(lastScanRaw) : null;
    const isStale = lastScan ? Date.now() - lastScan.getTime() > 24 * 60 * 60 * 1000 : false;
    const baseline = getBaseline(scanCount);
    return {
      vitality,
      pillars: { energy, recovery, stress },
      control,
      bodyState,
      hasScan: !!lastScan,
      scanCount,
      isStale,
      baselineRemaining: Math.max(0, 4 - scanCount),
      baseline,
    };
  }, [userId, isGemConnected, lastScanRaw, scanCount]);
}
