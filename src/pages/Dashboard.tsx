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

const PILLAR_ICON: Record<string, any> = {
  energy: Zap, recovery: Heart, "stress-nervous": Brain, control: Gauge,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { isGemConnected } = useGemConnection();
  const { vitality, pillars, control, bodyState, baselineRemaining } = useVitality();
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
          {/* Four Pillars */}
          <div className="px-6 mb-4">
            <div className="glass-card p-4 space-y-3">
              <div className="space-y-0.5">
                <h2 className="text-sm font-display font-semibold">Four Pillars</h2>
                <p className="text-[10px] text-muted-foreground font-display">
                  Scan: {lastScanLabel}
                  {isGemConnected && (() => {
                    const gemSync = localStorage.getItem("lastGemSyncDate");
                    return gemSync
                      ? ` · GEM readings: ${formatDistanceToNow(new Date(gemSync), { addSuffix: true })}`
                      : " · GEM readings: none";
                  })()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PILLARS.map((p) => {
                  const Icon = p.icon;
                  const trendUp = p.trend.startsWith("+");
                  const zoneColor = p.zone === "green" ? "success" : p.zone === "amber" ? "warning" : "destructive";
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/pillar/${p.id}`)}
                      className={`glass-card p-3 flex flex-col gap-2 text-left border-${zoneColor}/30 hover:border-${zoneColor}/50 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-7 h-7 rounded-lg bg-${zoneColor}/10 flex items-center justify-center`}>
                          <Icon className={`w-3.5 h-3.5 text-${zoneColor}`} />
                        </div>
                        <span className={`text-[10px] font-display font-medium flex items-center gap-0.5 ${trendUp ? "text-success" : "text-destructive"}`}>
                          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {p.trend}
                        </span>
                      </div>
                      <div>
                        <p className="text-2xl font-display font-bold text-foreground">{p.score}</p>
                        <p className="text-[10px] text-muted-foreground font-display font-medium leading-tight">{p.name}</p>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full bg-${zoneColor}`} style={{ width: `${p.score}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
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
