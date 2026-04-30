import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Scan, Activity, TrendingDown, TrendingUp, ChevronRight, Zap, Brain, Heart, Gauge, Bluetooth, BluetoothOff, CalendarClock, Sparkles, ExternalLink } from "lucide-react";
import { useGemConnection } from "@/contexts/GemConnectionContext";
import { getScoreLabel } from "@/components/ScoreBadge";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import RewardsProgress from "@/components/RewardsProgress";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useVitality } from "@/lib/scoring";
import DailyEnergyStrip from "@/components/scoring/DailyEnergyStrip";
import WeeklyRecsCard from "@/components/recommendations/WeeklyRecsCard";

const PILLAR_ICON: Record<string, any> = {
  energy: Zap, recovery: Heart, "stress-nervous": Brain, control: Gauge,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { isGemConnected } = useGemConnection();
  const { vitality, pillars, control, bodyState, baselineRemaining, baseline } = useVitality();
  const vitalityZoneColor = vitality.zone === "green" ? "success" : vitality.zone === "amber" ? "warning" : "destructive";
  const vitalityLabel = getScoreLabel(vitality.score);

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
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();
        if (data?.display_name) setDisplayName(data.display_name);
      }
    };
    fetchProfile();
  }, []);

  

  const showScanNudge = useMemo(() => {
    const last = localStorage.getItem("lastScanDate");
    if (!last) return false;
    const diffMs = Date.now() - new Date(last).getTime();
    return diffMs > 24 * 60 * 60 * 1000;
  }, []);

  const lastScanLabel = useMemo(() => {
    const last = localStorage.getItem("lastScanDate");
    if (!last) return "No scan yet";
    return formatDistanceToNow(new Date(last), { addSuffix: true });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />


      {/* GEM Connection Status */}
      <div className="px-6 mb-3">
        {isGemConnected ? (
          <div className="glass-card p-3 w-full flex items-center gap-3 text-left border-success/30">
            <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <Bluetooth className="w-4 h-4 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">GEM Connected</p>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              </div>
              {(() => {
                const lastSync = localStorage.getItem("lastGemSyncDate");
                if (!lastSync) return <p className="text-[11px] text-success/70 font-display font-medium">No readings yet</p>;
                return <p className="text-[11px] text-success font-display font-semibold">Last reading: {formatDistanceToNow(new Date(lastSync), { addSuffix: false })} ago</p>;
              })()}
            </div>
          </div>
        ) : (
          <div className="glass-card p-3 w-full border-dashed opacity-80">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                <BluetoothOff className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">GEM</p>
                <p className="text-[11px] text-muted-foreground font-display font-medium">Not connected</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open("https://shop.e4l.com", "_blank")}
                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-display font-medium text-primary bg-primary/10 rounded-xl py-2 px-3 transition-colors hover:bg-primary/20 active:scale-[0.98]"
              >
                <ExternalLink className="w-3 h-3" />
                Get Yours
              </button>
              <button
                onClick={() => navigate("/gem/detect")}
                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-display font-medium text-primary bg-primary/10 rounded-xl py-2 px-3 transition-colors hover:bg-primary/20 active:scale-[0.98]"
              >
                <Bluetooth className="w-3 h-3" />
                Pair GEM
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GEM State Card */}
      <div className="px-6 mb-3">
        <button
          onClick={() => navigate("/gem/detect")}
          className="glass-card p-4 w-full text-left hover:border-primary/20 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isGemConnected ? 'bg-success/15' : 'bg-muted/30'}`}>
              {isGemConnected
                ? <Bluetooth className="w-6 h-6 text-success" />
                : <BluetoothOff className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-display font-semibold">GEM State</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isGemConnected
                  ? `Calm · synced ${localStorage.getItem("lastGemSyncDate")
                      ? `${formatDistanceToNow(new Date(localStorage.getItem("lastGemSyncDate")!), { addSuffix: false })} ago`
                      : "just now"}`
                  : "Not connected"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Tap for full details</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      </div>

      {/* === FIRST-TIME EMPTY STATE === */}
      {!hasScanned && (
        <div className="px-6 mb-6">
          <div className="glass-card p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-display font-bold">Take Your First Scan</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                A 60-second face, voice & tongue scan gives you personalised health insights across four pillars.
              </p>
            </div>
            <button
              onClick={() => navigate("/mirror-check")}
              className="bg-primary text-primary-foreground font-display font-medium text-sm px-6 py-3 rounded-2xl hover:bg-primary/90 transition-colors"
            >
              <Scan className="w-4 h-4 inline mr-2" />
              Start Scanning
            </button>
          </div>
        </div>
      )}

      {/* === RETURNING USER SECTIONS === */}
      {hasScanned && (
        <>
          {/* Vitality Score hero (spec §9A.4) */}
          <div className="px-6 mb-4">
            <div className={`glass-card p-5 border-${vitalityZoneColor}/30`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">Vitality Score</p>
                <div className="flex items-center gap-1.5">
                  {baseline.isEstablishing && (
                    <span className="text-[10px] font-display font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {baseline.label}
                    </span>
                  )}
                  <span className={`text-[10px] font-display font-medium px-2 py-0.5 rounded-full bg-${vitalityZoneColor}/15 text-${vitalityZoneColor} capitalize`}>
                    {vitality.zone} · {vitalityLabel.label}
                  </span>
                </div>
              </div>
              <div className="flex items-end gap-3 mb-3">
                <span className={`text-5xl font-display font-bold text-${vitalityZoneColor} leading-none`}>{vitality.score}</span>
                <div className="pb-1">
                  <p className="text-[10px] text-muted-foreground font-display">
                    Voltage <span className="text-foreground font-semibold">{vitality.voltage}</span> × Resistance <span className="text-foreground font-semibold">{vitality.resistanceEfficiency.toFixed(2)}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground font-display">
                    {baselineRemaining > 0
                      ? `Scan weekly to establish baseline (${4 - baselineRemaining}/4)`
                      : `Trend ${vitality.trend} · Confidence ${vitality.confidence}`}
                  </p>
                </div>
              </div>

              {/* 3 contributors: Energy / Recovery / Stress */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/30">
                {[pillars.energy, pillars.recovery, pillars.stress].map((p) => {
                  const Icon = PILLAR_ICON[p.id];
                  const trendUp = p.trend.startsWith("+");
                  const c = p.zone === "green" ? "success" : p.zone === "amber" ? "warning" : "destructive";
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/pillar/${p.id}`)}
                      className={`glass-card p-3 flex flex-col gap-1.5 text-left border-${c}/20 hover:border-${c}/40 transition-colors active:scale-[0.98]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-6 h-6 rounded-lg bg-${c}/10 flex items-center justify-center`}>
                          <Icon className={`w-3 h-3 text-${c}`} />
                        </div>
                        <span className={`text-[9px] font-display font-medium flex items-center gap-0.5 ${trendUp ? "text-success" : "text-destructive"}`}>
                          {trendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {p.trend}
                        </span>
                      </div>
                      <p className={`text-xl font-display font-bold text-${c}`}>{p.score}</p>
                      <p className="text-[10px] text-muted-foreground font-display leading-tight">{p.id === "stress-nervous" ? "Stress" : p.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Control tile — separate per spec §9A.4 (excluded from Vitality formula) */}
          <div className="px-6 mb-4">
            <button
              onClick={() => navigate("/pillar/control")}
              className={`glass-card p-4 w-full text-left border-${control.zone === "green" ? "success" : control.zone === "amber" ? "warning" : "destructive"}/30 hover:border-primary/40 transition-colors active:scale-[0.98]`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Gauge className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium">This Week's Bioenergetic Priorities</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-display font-semibold">Control</p>
                    <span className="text-2xl font-display font-bold">{control.score}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground">{control.insight}</p>
            </button>
          </div>

          {/* Daily Energy Pattern */}
          {isGemConnected && bodyState.states.length > 0 && (
            <div className="px-6 mb-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">Daily Energy Pattern · 24h</p>
                  {bodyState.sustainedFiredUp && (
                    <span className="text-[9px] text-warning font-display font-medium">Sustained Fired Up · −15</span>
                  )}
                </div>
                <DailyEnergyStrip pattern={bodyState} />
              </div>
            </div>
          )}

          {/* Weekly Infoceutical Recommendations (P1 mock) */}
          <div className="px-6 mb-4">
            <WeeklyRecsCard hasScan={hasScanned} />
          </div>

          {/* Scan Nudge — only if 24h+ since last scan */}
          {showScanNudge && (
            <div className="px-6 mb-4">
              <button
                onClick={() => navigate("/scan")}
                className="glass-card p-3 w-full flex items-center gap-3 text-left border-primary/20 hover:border-primary/40 transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-display font-semibold">Scan Today?</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">It's been a while — time for a quick check-in?</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Bio Age Delta */}
          <div className="px-6 mb-4">
            <div className="glass-card p-5 glow-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-center gap-5">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--success))" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * 0.32}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-display font-bold text-success">-3.2</span>
                    <span className="text-[9px] text-muted-foreground">years</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full font-display font-medium">
                    ⏳ Time Traveler
                  </span>
                  <p className="text-xs text-foreground font-medium leading-snug">
                    You're <span className="text-success font-bold">3.2 years younger</span> than your chronological age
                  </p>
                  <p className="text-[10px] text-muted-foreground">Confidence: Medium</p>
                </div>
              </div>
            </div>
          </div>

          {/* Truth Detector Card */}
          <div className="px-6 mb-4">
            <div className="glass-card p-4 border-warning/20 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-display font-semibold text-warning">Truth Detector</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You said you slept well, but your HRV says otherwise. Recovery score adjusted.
                </p>
                <button
                  onClick={() => navigate("/ai-coach", { state: { preload: "My HRV suggests poor sleep even though I feel rested. What should I do?" } })}
                  className="text-[10px] text-primary font-display font-medium mt-1.5 hover:underline"
                >
                  What should I do? →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rewards Progress */}
      <div className="px-6 mb-6">
        <RewardsProgress />
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
