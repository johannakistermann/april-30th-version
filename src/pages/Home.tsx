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
    <div className="brand-e4l min-h-screen pb-24" style={{ backgroundColor: "hsl(var(--background))" }}>
      <TopMenu />

      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Greeting */}
        <div className="px-5 pt-5 pb-3">
          <p className="label-caps">{todayLabel}</p>
          <h1 className="text-[28px] font-display font-light leading-tight mt-2">
            {getGreeting()}, <em className="italic" style={{ color: "hsl(var(--e4l-amber))" }}>{firstName}</em>.
          </h1>
        </div>

        {/* Last Scan / GEM strip */}
        <div className="px-5 pb-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="e4l-card px-3.5 py-3 text-left active:scale-[0.98] transition-transform"
          >
            <p className="label-caps">Last scan</p>
            <p className="text-base font-display font-light mt-1">{lastScanLabel}</p>
          </button>
          <button
            onClick={() => navigate(isGemConnected ? "/gem/detect" : "/shop")}
            className="e4l-card px-3.5 py-3 text-left active:scale-[0.98] transition-transform"
          >
            <p className="label-caps" style={isGemConnected ? { color: "hsl(var(--e4l-teal))" } : undefined}>
              {isGemConnected ? "Connected" : "GEM"}
            </p>
            <p className="text-base font-display font-light mt-1">{isGemConnected ? gemSyncLabel : "Get yours"}</p>
          </button>
        </div>

        {/* Vitality hero — impact band */}
        <div className="px-5 pb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="impact-band w-full p-5 flex items-center gap-5 text-left active:scale-[0.99] transition-transform rounded-md"
          >
            <span aria-hidden className="equation-watermark" style={{ top: 10, right: 12, fontSize: 22 }}>
              V = (I×V)/(R×E)
            </span>
            <div className="relative w-[96px] h-[96px] flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--e4l-amber))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - vitality.score / 100)}`}
                  strokeOpacity={baseline.isEstablishing ? 0.6 : 1}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[44px] font-display font-light leading-none text-white">{vitality.score}</span>
                {baseline.isEstablishing && (
                  <span className="text-[9px] text-white/60 mt-1">establishing</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-2xl font-display font-light text-white leading-tight">Vitality Score</p>
              <p className="equation text-[12px] mt-1">I × V / R</p>
              <div className="flex items-center gap-1.5 mt-2.5" aria-hidden="true">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                  style={{ background: "hsl(var(--e4l-plum-light) / 0.25)", color: "hsl(var(--e4l-lavender))" }}>I</span>
                <span className="text-[10px] text-white/50">×</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                  style={{ background: "hsl(var(--e4l-teal) / 0.3)", color: "#9CC9DA" }}>V</span>
                <span className="text-[10px] text-white/50">/</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                  style={{ background: "hsl(var(--e4l-ember) / 0.25)", color: "#E8A685" }}>R</span>
              </div>
              {baseline.isEstablishing ? (
                <p className="text-[11px] mt-2.5" style={{ color: "hsl(var(--e4l-lavender))" }}>
                  Baseline locks after 4 weekly scans ({Math.max(1, baselineWeek)} of 4)
                </p>
              ) : (
                <p className="text-[10px] text-white/60 mt-2">Trend {vitality.trend} · {vitality.confidence} confidence</p>
              )}
            </div>
          </button>
        </div>

        {/* 3 pillar tiles */}
        <div className="px-5 pb-4 grid grid-cols-3 gap-2">
          {[pillars.energy, pillars.recovery, pillars.stress].map((p) => {
            const tk = zoneToken(p.zone);
            const shortName = p.id === "stress-nervous" ? "Stress & NS" : p.name;
            const tone = tk === "success" ? "hsl(var(--e4l-teal))" : tk === "warning" ? "hsl(var(--e4l-amber))" : "hsl(var(--e4l-ember))";
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/pillar/${p.id}`)}
                className="e4l-card relative overflow-hidden px-2 py-3 text-center active:scale-[0.98] transition-transform"
              >
                {p.id === "recovery" && (
                  <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 flex flex-col">
                    <span className="flex-1" style={{ background: "hsl(var(--e4l-teal))" }} />
                    <span className="flex-1" style={{ background: "hsl(var(--e4l-ember))" }} />
                  </span>
                )}
                <p className="text-[28px] font-display font-light leading-none" style={{ color: tone }}>{p.score}</p>
                <p className="text-[11px] mt-1.5 hex-bullet">{shortName}</p>
                <p className="label-caps mt-1" style={{ color: tone, fontSize: 9 }}>{zoneLabel(p.zone)}</p>
              </button>
            );
          })}
        </div>

        {/* Bioenergetic Priorities (Control) */}
        {hasScanned && (
          <div className="px-5 pb-4">
            <button
              onClick={() => navigate("/pillar/control")}
              className="e4l-card w-full p-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <p className="label-caps">This week's bioenergetic priorities</p>
                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--e4l-amber))" }} />
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-2xl font-display font-light">Control</p>
                <p className="text-2xl font-display font-light" style={{ color: "hsl(var(--e4l-amber))" }}>· {control.score}</p>
                <span className="label-caps" style={{ color: "hsl(var(--e4l-amber))" }}>{zoneLabel(control.zone)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {controlSubs.map((s) => {
                  const sScore = s.score ?? 0;
                  const tone = sScore >= 75 ? "hsl(var(--e4l-teal))" : sScore >= 50 ? "hsl(var(--e4l-amber))" : "hsl(var(--e4l-ember))";
                  const shortName = s.name
                    .replace("Vitality & Constitution", "Vitality & Const.")
                    .replace("Detox & Elimination", "Detox & Elim.")
                    .replace("Digestion & Metabolism", "Digestion")
                    .replace("Immunity & Defence", "Immunity");
                  return (
                    <div key={s.name} className="flex items-center justify-between border rounded px-3 py-2" style={{ borderColor: "hsl(var(--e4l-deep-earth) / 0.08)" }}>
                      <span className="text-[12px] hex-bullet">{shortName}</span>
                      <span className="text-sm font-mono" style={{ color: tone }}>{s.locked ? "—" : sScore}</span>
                    </div>
                  );
                })}
              </div>
            </button>
          </div>
        )}

        {/* This Week's 5 Infoceuticals */}
        {hasScanned && (
          <div className="px-5 pb-4">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-[20px] font-display font-light">This week's 5 Infoceuticals</h3>
              <button onClick={() => navigate("/dashboard")} className="label-caps">View all ›</button>
            </div>
            <div className="space-y-1.5">
              {top2.map((r, i) => (
                <div key={r.id} className="e4l-card px-3 py-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px]">
                      <span className="font-mono text-[11px]" style={{ color: "hsl(var(--e4l-amber))" }}>0{i + 1}</span>
                      <span className="mx-2 text-muted-foreground">·</span>
                      {r.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{r.rationale}</p>
                  </div>
                  <span className="label-caps" style={{
                    color: r.confidence === "High" ? "hsl(var(--e4l-teal))" :
                           r.confidence === "Medium" ? "hsl(var(--e4l-amber))" :
                           "hsl(var(--muted-foreground))"
                  }}>
                    {r.confidence}
                  </span>
                </div>
              ))}
              {more > 0 && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="e4l-card w-full px-3 py-2.5 flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                  <p className="text-[12px] text-muted-foreground">+ {more} more recommendations</p>
                  <ChevronRight className="w-4 h-4" style={{ color: "hsl(var(--e4l-amber))" }} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Today's program — impact band */}
        <div className="px-5 pb-4">
          <div className="impact-band rounded-md p-5">
            <span aria-hidden className="equation-watermark" style={{ bottom: 8, left: 12, fontSize: 18 }}>
              I = V/R
            </span>
            <div className="flex items-baseline justify-between mb-3 relative z-10">
              <p className="label-caps">{isGemConnected ? "Today's GEM program" : "Today's protocol"}</p>
              <span className="text-[11px] text-white/70 font-mono">2 / 5</span>
            </div>
            <div className="h-px w-12 mb-4" style={{ background: "hsl(var(--e4l-amber))" }} />
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div>
                <p className="text-[18px] font-display font-light text-white leading-tight">
                  {isGemConnected ? "Liver Driver" : "4-min vagal breath"}
                </p>
                <p className="text-[11px] text-white/60 mt-1">
                  {isGemConnected ? "Scheduled 6:30 PM · in 2h" : "Guided · phone only"}
                </p>
              </div>
              <button
                onClick={() => navigate(isGemConnected ? "/correct" : "/learn")}
                className="cta-rect"
              >
                Start now
              </button>
            </div>
          </div>
        </div>

        {/* Ask the Coach */}
        <div className="px-5 pb-4">
          <button
            onClick={() => navigate("/ai-coach")}
            className="e4l-card w-full px-4 py-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            style={{ borderLeft: "3px solid hsl(var(--e4l-plum))" }}
          >
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--e4l-plum) / 0.1)" }}>
              <MessageSquare className="w-4 h-4" style={{ color: "hsl(var(--e4l-plum))" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="label-caps" style={{ color: "hsl(var(--e4l-plum))" }}>Ask the Coach</p>
              <p className="text-[13px] font-display font-light mt-0.5">Want to talk through this week's liver focus?</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "hsl(var(--e4l-amber))" }} />
          </button>
        </div>

        {/* Weekly scan streak */}
        <div className="px-5 pb-4">
          <div className="e4l-card px-4 py-3.5">
            <div className="flex items-baseline justify-between mb-3">
              <p className="label-caps">Weekly scan streak</p>
              <span className="text-2xl font-display font-light" style={{ color: "hsl(var(--e4l-amber))" }}>
                {Math.max(1, baselineWeek)}<span className="text-[11px] text-muted-foreground ml-1">/ 4</span>
              </span>
            </div>
            <div className="flex gap-1 mb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full"
                  style={{ background: i < Math.max(1, baselineWeek) ? "hsl(var(--e4l-amber))" : "hsl(var(--e4l-deep-earth) / 0.1)" }}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Scan each week to lock your baseline by week 4. Next scan due Sunday.
            </p>
          </div>
        </div>

        {/* Empty state */}
        {!hasScanned && (
          <div className="px-5 pb-4">
            <div className="e4l-card p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center" style={{ background: "hsl(var(--e4l-amber) / 0.15)" }}>
                <Sparkles className="w-6 h-6" style={{ color: "hsl(var(--e4l-amber))" }} />
              </div>
              <div>
                <h3 className="text-xl font-display font-light">Begin your baseline</h3>
                <p className="text-[12px] text-muted-foreground mt-1">Take your first scan to unlock weekly insights.</p>
              </div>
              <button onClick={() => navigate("/mirror-check")} className="cta-rect">
                Start scanning
              </button>
            </div>
          </div>
        )}

        {/* Find Practitioner */}
        {!isPractitioner && !hasActivePractitioner && (
          <div className="px-5 pb-5">
            <button
              onClick={() => navigate("/find-practitioner")}
              className="e4l-card w-full px-3.5 py-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--e4l-cream))" }}>
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-display">Find a practitioner</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Personalized support beyond the consumer tier</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "hsl(var(--e4l-amber))" }} />
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="px-5 pb-4 pt-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            GEM is not intended to diagnose, treat, cure, or prevent any disease. Results may vary.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;

