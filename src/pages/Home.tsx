import { useEffect, useState, useMemo } from "react";
import { useGemConnection } from "@/contexts/GemConnectionContext";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MessageSquare, User, Scan, Sparkles } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { usePractitionerRole } from "@/hooks/usePractitionerRole";
import { format, formatDistanceToNow } from "date-fns";
import { useVitality } from "@/lib/scoring";
import { useGemSync } from "@/lib/gem/syncClock";
import { getWeeklyRecs } from "@/lib/recommendations/mockRecommendations";

type ZoneToken = "success" | "warning" | "destructive";
const zoneToken = (zone: "green" | "amber" | "red"): ZoneToken =>
  zone === "green" ? "success" : zone === "amber" ? "warning" : "destructive";

const zoneLabel = (zone: "green" | "amber" | "red") =>
  zone === "green" ? "GREEN" : zone === "amber" ? "AMBER" : "RED";

const ZONE_TILE_BG: Record<ZoneToken, string> = {
  success: "bg-success/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
};
const ZONE_TEXT: Record<ZoneToken, string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const Home = () => {
  const navigate = useNavigate();
  const { isGemConnected } = useGemConnection();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { isPractitioner } = usePractitionerRole();
  const [hasActivePractitioner, setHasActivePractitioner] = useState(false);
  const [userId, setUserId] = useState<string>("guest-anon");

  const hasScanned = useMemo(() => {
    if (localStorage.getItem("dev-bypass-auth") === "true" && !localStorage.getItem("lastScanDate")) {
      localStorage.setItem("lastScanDate", new Date().toISOString());
    }
    return !!localStorage.getItem("lastScanDate");
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();
        if (data?.display_name) setDisplayName(data.display_name);

        const { data: conn } = await supabase
          .from("practitioner_clients")
          .select("id")
          .eq("client_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        setHasActivePractitioner(!!conn);
      } else if (localStorage.getItem("dev-bypass-auth") === "true") {
        setUserId("dev-bypass-user");
      }
    };
    fetchProfile();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const { label: gemSyncLabel } = useGemSync();

  const { vitality, pillars, control, baselineRemaining, scanCount, baseline } = useVitality();
  const vitalityZoneColor = zoneToken(vitality.zone);
  const baselineWeek = Math.min(scanCount || 0, 4);

  const lastScanRaw = localStorage.getItem("lastScanDate");
  const lastScanLabel = lastScanRaw ? formatDistanceToNow(new Date(lastScanRaw), { addSuffix: true }) : "No scan yet";

  const recs = getWeeklyRecs(userId);
  const top2 = recs.slice(0, 2);
  const more = Math.max(0, recs.length - 2);

  const todayLabel = `${format(new Date(), "EEEE")} · Week ${Math.max(1, baselineWeek || 1)}`;
  const firstName = displayName?.split(" ")[0] ?? "there";

  // Sub-scores for "This Week's Bioenergetic Priorities" — fixed display order
  const PRIORITY_ORDER = ["Detox & Elimination", "Digestion & Metabolism", "Vitality & Constitution", "Immunity & Defence"];
  const controlSubs = PRIORITY_ORDER
    .map((n) => control.subScores.find((s) => s.name === n))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .concat(control.subScores.filter((s) => !PRIORITY_ORDER.includes(s.name)))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />

      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Greeting */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-[11px] text-muted-foreground font-display">{todayLabel}</p>
          <p className="text-lg font-display font-medium mt-0.5">{getGreeting()}, {firstName}</p>
        </div>

        {/* Last Scan / GEM strip */}
        <div className="px-5 pb-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-card/60 border border-border/60 rounded-xl px-3.5 py-3.5 text-left active:scale-[0.98] transition-transform"
          >
            <p className="text-sm font-medium">{lastScanLabel}</p>
          </button>
          <button
            onClick={() => navigate(isGemConnected ? "/gem/detect" : "/shop")}
            className="bg-card/60 border border-border/60 rounded-xl px-3.5 py-3 text-left active:scale-[0.98] transition-transform"
          >
            <p className={`text-[10px] uppercase tracking-wider font-display ${isGemConnected ? "text-success" : "text-muted-foreground"}`}>
              {isGemConnected ? "CONNECTED" : "GEM"}
            </p>
            <p className="text-sm font-medium mt-0.5">{isGemConnected ? gemSyncLabel : "Get yours"}</p>
          </button>
        </div>

        {/* Vitality hero — baseline-week aware */}
        <div className="px-5 pb-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-card/60 border border-primary/40 rounded-2xl p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="relative w-[86px] h-[86px] flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - vitality.score / 100)}`}
                  strokeOpacity={baseline.isEstablishing ? 0.6 : 1}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-medium leading-none">{vitality.score}</span>
                {baseline.isEstablishing && (
                  <span className="text-[9px] text-muted-foreground mt-1">establishing</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-display font-medium">Vitality Score</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">Information × Voltage / Resistance</p>
              {/* I × V / R contribution chips */}
              <div className="flex items-center gap-1.5 mt-2" aria-hidden="true">
                <span
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-display font-semibold"
                  style={{ background: "hsl(270 60% 70% / 0.15)", color: "hsl(270 60% 70%)" }}
                >I</span>
                <span className="text-[10px] text-muted-foreground">×</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-display font-semibold bg-success/15 text-success">V</span>
                <span className="text-[10px] text-muted-foreground">/</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-display font-semibold bg-destructive/15 text-destructive">R</span>
              </div>
              {baseline.isEstablishing ? (
                <div className="mt-2.5 px-2.5 py-2 rounded-lg bg-primary/15">
                  <p className="text-[11px] text-primary leading-snug">
                    Your baseline locks after 4 weekly scans ({Math.max(1, baselineWeek)} of 4)
                  </p>
                  <p className="text-[10px] text-primary/75 leading-snug mt-1">
                    Pillars firm up after 4 weekly scans · acute change detection unlocks at week 4
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground mt-1">Trend {vitality.trend} · {vitality.confidence} confidence</p>
              )}
            </div>
          </button>
        </div>

        {/* 3 pillar tiles */}
        <div className="px-5 pb-3 grid grid-cols-3 gap-2">
          {[pillars.energy, pillars.recovery, pillars.stress].map((p) => {
            const tk = zoneToken(p.zone);
            const shortName = p.id === "stress-nervous" ? "Stress & NS" : p.name;
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/pillar/${p.id}`)}
                className={`relative overflow-hidden rounded-xl px-2 py-2.5 text-center active:scale-[0.98] transition-transform ${ZONE_TILE_BG[tk]}`}
              >
                {p.id === "recovery" && (
                  <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 flex flex-col">
                    <span className="flex-1 bg-success" />
                    <span className="flex-1 bg-destructive" />
                  </span>
                )}
                <p className={`text-[22px] font-display font-medium leading-none ${ZONE_TEXT[tk]}`}>{p.score}</p>
                <p className="text-[10px] text-foreground/80 mt-1">{shortName}</p>
                <p className={`text-[8px] tracking-wider mt-0.5 ${ZONE_TEXT[tk]}`}>{zoneLabel(p.zone)}</p>
              </button>
            );
          })}
        </div>

        {/* Bioenergetic Priorities (Control) */}
        {hasScanned && (
          <div className="px-5 pb-3">
            <button
              onClick={() => navigate("/pillar/control")}
              className="w-full bg-card/60 border border-border/60 rounded-xl p-3.5 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-display leading-tight">This Week's Bioenergetic<br/>Priorities</p>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-base font-display font-medium">Control</p>
                <p className={`text-base font-display font-medium ${ZONE_TEXT[zoneToken(control.zone)]}`}>· {control.score}</p>
                <span className={`text-[9px] tracking-wider ${ZONE_TEXT[zoneToken(control.zone)]}`}>{zoneLabel(control.zone)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {controlSubs.map((s) => {
                  const sScore = s.score ?? 0;
                  const sZone: ZoneToken = sScore >= 75 ? "success" : sScore >= 50 ? "warning" : "destructive";
                  const shortName = s.name
                    .replace("Vitality & Constitution", "Vitality & Const.")
                    .replace("Detox & Elimination", "Detox & Elim.")
                    .replace("Digestion & Metabolism", "Digestion")
                    .replace("Immunity & Defence", "Immunity");
                  return (
                    <div key={s.name} className="flex items-center justify-between border border-border/60 rounded-lg px-3 py-2.5">
                      <span className="text-xs text-foreground/90">{shortName}</span>
                      <span className={`text-sm font-medium ${ZONE_TEXT[sZone]}`}>{s.locked ? "—" : sScore}</span>
                    </div>
                  );
                })}
              </div>
            </button>
          </div>
        )}

        {/* This Week's 5 Infoceuticals */}
        {hasScanned && (
          <div className="px-5 pb-3">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[13px] font-display font-medium">This week's 5 Infoceuticals</p>
              <button onClick={() => navigate("/dashboard")} className="text-[11px] text-success">View all ›</button>
            </div>
            <div className="space-y-1.5">
              {top2.map((r, i) => (
                <div key={r.id} className="bg-card/60 border border-border/60 rounded-xl px-3 py-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium">
                      <span className="text-muted-foreground">{i + 1} ·</span> {r.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.rationale}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                    r.confidence === "High" ? "bg-success/15 text-success" :
                    r.confidence === "Medium" ? "bg-warning/15 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {r.confidence}
                  </span>
                </div>
              ))}
              {more > 0 && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-card/60 border border-border/60 rounded-xl px-3 py-2.5 flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                  <p className="text-xs text-muted-foreground">+ {more} more recommendations</p>
                  <ChevronRight className="w-3.5 h-3.5 text-success" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Today's program — GEM-driven if connected, phone-driven otherwise */}
        <div className="px-5 pb-3">
          <button
            onClick={() => navigate(isGemConnected ? "/correct" : "/learn")}
            className="w-full text-left rounded-2xl p-3.5 border border-success/30 active:scale-[0.98] transition-transform"
            style={{ background: "linear-gradient(135deg, hsl(var(--success) / 0.15), hsl(var(--success) / 0.05))" }}
          >
            <div className="flex items-baseline justify-between mb-2.5">
              <p className="text-[13px] font-display font-medium">
                {isGemConnected ? "Today's GEM program" : "Today's protocol"}
              </p>
              <span className="text-[10px] text-success font-medium">2 of 5 done</span>
            </div>
            <div className="h-1 bg-muted rounded-full mb-2.5 overflow-hidden">
              <div className="h-full bg-success rounded-full" style={{ width: "40%" }} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-foreground/80">
                  {isGemConnected ? "Next: Liver Driver" : "Next: 4-min vagal breath"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {isGemConnected ? "Scheduled 6:30 PM · in 2h" : "Guided · phone only"}
                </p>
              </div>
              <span className="bg-success text-success-foreground px-4 py-2.5 rounded-lg text-[12px] font-medium leading-tight whitespace-pre-line text-center">
                {"Start\nnow"}
              </span>
            </div>
            {!isGemConnected && (
              <div className="mt-3 pt-2.5 border-t border-success/20 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">Add a GEM for hardware-driven protocols</p>
                <ChevronRight className="w-3.5 h-3.5 text-success" />
              </div>
            )}
          </button>
        </div>

        {/* Ask the Coach */}
        <div className="px-5 pb-3">
          <button
            onClick={() => navigate("/ai-coach")}
            className="w-full rounded-xl px-3.5 py-3 flex items-center gap-3 border border-primary/30 bg-primary/10 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-9 h-9 rounded-full bg-primary/25 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Ask the Coach</p>
              <p className="text-[11px] text-primary/80 mt-0.5 leading-snug">Want to talk through this week's liver focus?</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* Weekly scan streak */}
        <div className="px-5 pb-3">
          <div className="bg-card/60 border border-border/60 rounded-xl px-3.5 py-3">
            <div className="flex items-baseline justify-between mb-2.5">
              <p className="text-xs font-medium">Weekly scan streak</p>
              <span className="text-[11px] text-warning font-medium">{Math.max(1, baselineWeek)} week{baselineWeek === 1 ? "" : "s"}</span>
            </div>
            <div className="flex gap-1 mb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${i < Math.max(1, baselineWeek) ? "bg-success" : "bg-muted"}`}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Scan each week to lock your baseline by week 4. Next scan due Sunday.
            </p>
          </div>
        </div>

        {/* Empty state — no scan yet */}
        {!hasScanned && (
          <div className="px-5 pb-3">
            <div className="bg-card/60 border border-border/60 rounded-xl p-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-display font-bold">No Scan Yet</p>
                <p className="text-xs text-muted-foreground mt-1">Take your first scan to unlock your weekly insights.</p>
              </div>
              <button
                onClick={() => navigate("/mirror-check")}
                className="bg-primary text-primary-foreground font-display font-medium text-xs px-5 py-2.5 rounded-xl active:scale-[0.98] transition-transform"
              >
                <Scan className="w-3.5 h-3.5 inline mr-1.5" />
                Start Scanning
              </button>
            </div>
          </div>
        )}

        {/* Find Practitioner — softened */}
        {!isPractitioner && !hasActivePractitioner && (
          <div className="px-5 pb-5">
            <button
              onClick={() => navigate("/find-practitioner")}
              className="w-full bg-card/60 border border-border/60 rounded-xl px-3.5 py-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">Find a practitioner</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Personalized support beyond the consumer tier</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
