// Mock hardware orchestration — UI only (P6).
// Simulates BLE/WiFi sessions with timers + localStorage persistence.
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export type DeviceKind = "gem" | "mihealth";
export type SessionStatus = "idle" | "connecting" | "broadcasting" | "completed";

export interface MockSession {
  device: DeviceKind;
  programName: string;
  programCode: string;
  startedAt: number; // epoch ms
  durationMs: number;
  status: SessionStatus;
}

const KEY = "mockHardwareSession";
const EVT = "mockHardware:change";

function readSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockSession;
  } catch { return null; }
}

function writeSession(s: MockSession | null) {
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useMockHardware() {
  const [session, setSession] = useState<MockSession | null>(() => readSession());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setSession(readSession());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  // tick every second when active
  useEffect(() => {
    if (!session || session.status === "completed") return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [session?.startedAt, session?.status]);

  // promote to completed when time elapsed
  useEffect(() => {
    if (!session || session.status === "completed") return;
    const elapsed = Date.now() - session.startedAt;
    if (session.status === "connecting" && elapsed > 1500) {
      const next = { ...session, status: "broadcasting" as SessionStatus };
      writeSession(next);
      toast({ title: "Program loaded", description: `${next.programName} broadcasting now.` });
    } else if (session.status === "broadcasting" && elapsed >= session.durationMs) {
      const next = { ...session, status: "completed" as SessionStatus };
      writeSession(next);
      toast({ title: "Session complete", description: `${next.programName} finished.` });
    }
  }, [tick, session]);

  const elapsedMs = session ? Date.now() - session.startedAt : 0;
  const remainingMs = session ? Math.max(0, session.durationMs - elapsedMs) : 0;
  const progressPct = session ? Math.min(100, (elapsedMs / session.durationMs) * 100) : 0;

  const startProgram = useCallback((device: DeviceKind, programName: string, durationSec = 30) => {
    const code = `${programName.replace(/\s+/g, "-").toUpperCase().slice(0, 8)}-${Math.floor(Math.random() * 90 + 10)}`;
    const next: MockSession = {
      device,
      programName,
      programCode: code,
      startedAt: Date.now(),
      durationMs: durationSec * 1000,
      status: "connecting",
    };
    writeSession(next);
    toast({ title: `Connected to ${device === "gem" ? "GEM" : "miHealth"}`, description: `Loading ${programName}…` });
  }, []);

  const stopSession = useCallback(() => {
    writeSession(null);
    toast({ title: "Session stopped", description: "Broadcast cancelled." });
  }, []);

  const dismissCompleted = useCallback(() => {
    if (session?.status === "completed") writeSession(null);
  }, [session]);

  // mock device telemetry
  const battery = session?.device === "gem" ? 78 : 64;
  const signal = session ? 4 : 0;

  return {
    session,
    startProgram,
    stopSession,
    dismissCompleted,
    elapsedMs,
    remainingMs,
    progressPct,
    battery,
    signal,
  };
}
