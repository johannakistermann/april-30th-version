import { useEffect, useState } from "react";
import { useGemConnection } from "@/contexts/GemConnectionContext";

export const GEM_SYNC_INTERVAL_MS = 15 * 60 * 1000;
const STORAGE_KEY = "lastGemSyncDate";

function readLastSync(): Date | null {
  const v = localStorage.getItem(STORAGE_KEY);
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function writeLastSync(d: Date) {
  localStorage.setItem(STORAGE_KEY, d.toISOString());
}

/**
 * Simulates the GEM device's automatic 15-minute reading + sync cycle.
 * Returns a friendly label ("Just synced", "Synced 4m ago · next in 11m", "GEM offline").
 */
export function useGemSync() {
  const { isGemConnected } = useGemConnection();
  const [, setTick] = useState(0);

  // Re-render every 30s for fresh labels.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  // When connected, advance lastSync to the most recent 15-min boundary if stale/missing.
  useEffect(() => {
    if (!isGemConnected) return;
    const last = readLastSync();
    const now = Date.now();
    if (!last || now - last.getTime() > GEM_SYNC_INTERVAL_MS) {
      // Snap to a recent moment so the UI shows "Just synced" right after connecting.
      writeLastSync(new Date(now));
      setTick((n) => n + 1);
    }
  }, [isGemConnected]);

  const lastSyncAt = readLastSync();
  const now = Date.now();
  const minutesSinceLast = lastSyncAt
    ? Math.max(0, Math.floor((now - lastSyncAt.getTime()) / 60000))
    : null;
  const minutesUntilNext = lastSyncAt
    ? Math.max(0, 15 - (minutesSinceLast ?? 0))
    : null;
  const nextSyncAt = lastSyncAt
    ? new Date(lastSyncAt.getTime() + GEM_SYNC_INTERVAL_MS)
    : null;

  let label: string;
  if (!lastSyncAt) {
    label = isGemConnected ? "Syncing now…" : "GEM not connected";
  } else if (!isGemConnected) {
    const m = minutesSinceLast ?? 0;
    label = m < 1 ? "GEM offline" : `Last sync ${m}m ago · GEM offline`;
  } else if ((minutesSinceLast ?? 0) < 1) {
    label = `Just synced · next in ${minutesUntilNext}m`;
  } else {
    label = `Synced ${minutesSinceLast}m ago · next in ${minutesUntilNext}m`;
  }

  return {
    isGemConnected,
    lastSyncAt,
    nextSyncAt,
    minutesSinceLast,
    minutesUntilNext,
    label,
  };
}

/** Format an arbitrary timestamp as a GEM-style sync label (used for client lists). */
export function formatGemSyncLabel(syncAt: Date | string | null | undefined, online = true): string {
  if (!syncAt) return online ? "Syncing soon" : "No GEM data";
  const d = typeof syncAt === "string" ? new Date(syncAt) : syncAt;
  if (isNaN(d.getTime())) return "No GEM data";
  const minutes = Math.floor((Date.now() - d.getTime()) / 60000);
  if (!online) {
    if (minutes < 60) return `Last sync ${minutes}m ago · offline`;
    if (minutes < 60 * 24) return `Last sync ${Math.floor(minutes / 60)}h ago · offline`;
    return `Last sync ${Math.floor(minutes / (60 * 24))}d ago · offline`;
  }
  if (minutes < 1) return "Just synced";
  if (minutes < 60) return `Synced ${minutes}m ago`;
  if (minutes < 60 * 24) return `Synced ${Math.floor(minutes / 60)}h ago`;
  return `Synced ${Math.floor(minutes / (60 * 24))}d ago`;
}
