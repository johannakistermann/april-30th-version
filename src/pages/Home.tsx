import { useEffect, useState, useMemo } from "react";
import { useGemConnection } from "@/contexts/GemConnectionContext";
import { useNavigate } from "react-router-dom";
import {
  Bluetooth, BluetoothOff, ShoppingBag, ChevronRight, TrendingUp, TrendingDown,
  Flame, Play, Clock, Sparkles, Scan, X, User, Zap, Smartphone, Sun,
  Camera, ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { getScoreLabel } from "@/components/ScoreBadge";
import { supabase } from "@/integrations/supabase/client";
import { usePractitionerRole } from "@/hooks/usePractitionerRole";
import { format, formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useVitality } from "@/lib/scoring";
import DailyEnergyStrip from "@/components/scoring/DailyEnergyStrip";


const STREAK_DAYS = [
  { day: "M", done: true },
  { day: "T", done: true },
  { day: "W", done: true },
  { day: "T", done: true },
  { day: "F", done: true },
  { day: "S", done: false, isToday: true },
  { day: "S", done: false },
];

function getSubScoreColor(score: number, trend: string) {
  const declining = trend.startsWith("-");
  if (score >= 75 && !declining) return { text: "text-success", bg: "bg-success/10", border: "border-success/20" };
  if (score < 55) return { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" };
  return { text: "text-warning", bg: "bg-warning/10", border: "border-warning/20" };
}

const Home = () => {
  const navigate = useNavigate();
  const { isGemConnected } = useGemConnection();
  const [displayName, setDisplayName] = useState<string | null>(null);
  
  const [hasMiHealth] = useState(() => localStorage.getItem("hasMiHealthDevice") === "true");
  
  const { isPractitioner } = usePractitionerRole();
  const [hasActivePractitioner, setHasActivePractitioner] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [devicePickerOpen, setDevicePickerOpen] = useState(false);

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

        const { data: conn } = await supabase
          .from("practitioner_clients")
          .select("id")
          .eq("client_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        setHasActivePractitioner(!!conn);
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

  const lastScanLabel = useMemo(() => {
    const last = localStorage.getItem("lastScanDate");
    if (!last) return "No scan yet";
    return formatDistanceToNow(new Date(last), { addSuffix: true });
  }, []);

  // Seed fake GEM reading if connected and none exists
  if (isGemConnected && !localStorage.getItem("lastGemSyncDate")) {
    localStorage.setItem("lastGemSyncDate", new Date(Date.now() - 30 * 60 * 1000).toISOString());
  }

  const { vitality, pillars, control, bodyState, baselineRemaining } = useVitality();
  const vitalityZoneColor = vitality.zone === "green" ? "success" : vitality.zone === "amber" ? "warning" : "destructive";
  const { label: avgLabel, colorClass: avgColorClass } = getScoreLabel(vitality.score);

  const streakCount = STREAK_DAYS.filter((d) => d.done).length;
  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />

      {displayName && (
        <p className="px-6 pt-3 pb-1 text-[11px] text-muted-foreground font-display">
          Welcome back, <span className="text-foreground font-medium">{displayName}</span>
        </p>
      )}

      {/* 2. Data Sources Strip */}
      <div className="px-6 mb-2 mt-0.5">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Scan Source */}
          <button
            onClick={() => setScanDialogOpen(true)}
            className={`glass-card p-1.5 flex items-center gap-1.5 text-left transition-colors active:scale-[0.98] ${
              (() => {
                const last = localStorage.getItem("lastScanDate");
                if (!last) return "border-muted-foreground/20";
                const diffMs = Date.now() - new Date(last).getTime();
                if (diffMs < 24 * 60 * 60 * 1000) return "border-success/30";
                if (diffMs < 3 * 24 * 60 * 60 * 1000) return "border-warning/30";
                return "border-destructive/30";
              })()
            }`}
          >
            <div className={`w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0 ${
              hasScanned ? "bg-primary/10" : "bg-muted/50"
            }`}>
              <Camera className={`w-3 h-3 ${hasScanned ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium">Scan</p>
              {(() => {
                const last = localStorage.getItem("lastScanDate");
                if (!last) return <p className="text-[11px] text-muted-foreground mt-0.5">No scan yet</p>;
                const diffMs = Date.now() - new Date(last).getTime();
                const label = formatDistanceToNow(new Date(last), { addSuffix: true });
                const freshColor = diffMs < 24 * 60 * 60 * 1000 ? "text-success" : diffMs < 3 * 24 * 60 * 60 * 1000 ? "text-warning" : "text-destructive";
                return <p className={`text-[11px] font-display font-semibold ${freshColor}`}>{label}</p>;
              })()}
            </div>
          </button>

          {/* GEM Source */}
          {isGemConnected ? (
            <button
              onClick={() => navigate("/gem/detect")}
              className="glass-card p-1.5 flex items-center gap-1.5 text-left border-success/30 transition-colors active:scale-[0.98]"
            >
              <div className="w-6 h-6 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <Bluetooth className="w-3 h-3 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium">GEM Connected</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                </div>
                {(() => {
                  const lastSync = localStorage.getItem("lastGemSyncDate");
                  if (!lastSync) return <p className="text-[11px] text-success/70 font-display font-medium">No readings yet</p>;
                  return <p className="text-[11px] text-success font-display font-semibold">Last reading: {formatDistanceToNow(new Date(lastSync), { addSuffix: false })} ago</p>;
                })()}
              </div>
            </button>
          ) : (
            <button
              onClick={() => window.open("https://shop.e4l.com", "_blank")}
              className="glass-card p-1.5 flex items-center gap-1.5 text-left border-dashed opacity-80 transition-colors active:scale-[0.98]"
            >
              <div className="w-6 h-6 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                <Bluetooth className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium">GEM</p>
                <p className="text-[11px] text-primary font-display font-medium flex items-center gap-1">
                  Get yours <ExternalLink className="w-3 h-3" />
                </p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Scan CTA */}
      <div className="px-6 mb-5">
        <button
          onClick={() => setScanDialogOpen(true)}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-base shadow-lg hover:bg-primary/90 transition-all active:scale-[0.97]"
          style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.35)" }}
        >
          <Scan className="w-5 h-5" />
          <span>Start a Scan</span>
        </button>
      </div>

      {/* 3. Vitality Score hero */}
      {hasScanned && (
        <div className="px-6 mb-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="glass-card p-5 w-full text-left hover:border-primary/20 transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={`hsl(var(--${vitalityZoneColor}))`}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - vitality.score / 100)}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-display font-bold">{vitality.score}</span>
                  <span className={`text-[9px] font-display font-medium ${avgColorClass}`}>{avgLabel}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold">Vitality Score</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Voltage {vitality.voltage} × Resistance {vitality.resistanceEfficiency.toFixed(2)}
                </p>
                {baselineRemaining > 0 ? (
                  <p className="text-[10px] text-primary mt-1 font-display">Scan weekly to establish baseline ({4 - baselineRemaining}/4)</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-1">Trend {vitality.trend} · Confidence {vitality.confidence}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>

            {/* 3-pillar contributors strip (Energy / Recovery / Stress) */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/30">
              {[pillars.energy, pillars.recovery, pillars.stress].map(p => {
                const c = p.zone === "green" ? "success" : p.zone === "amber" ? "warning" : "destructive";
                return (
                  <div key={p.id} className="flex flex-col items-center text-center">
                    <span className={`text-base font-display font-bold text-${c}`}>{p.score}</span>
                    <span className="text-[9px] text-muted-foreground font-display leading-tight">{p.id === "stress-nervous" ? "Stress" : p.name}</span>
                  </div>
                );
              })}
            </div>
          </button>
        </div>
      )}

      {/* Control tile — "This Week's Bioenergetic Priorities" (spec §9A.4) */}
      {hasScanned && (
        <div className="px-6 mb-4">
          <button
            onClick={() => navigate(`/pillar/control`)}
            className="glass-card p-3 w-full flex items-center gap-3 text-left border-primary/20 hover:border-primary/40 transition-colors active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium">This Week's Bioenergetic Priorities</p>
              <p className="text-xs font-display font-semibold mt-0.5">Control · {control.score}</p>
              <p className="text-[10px] text-muted-foreground truncate">{control.insight}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Daily Energy Pattern strip */}
      {hasScanned && isGemConnected && bodyState.states.length > 0 && (
        <div className="px-6 mb-4">
          <div className="glass-card p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-2">Daily Energy Pattern · last 24h</p>
            <DailyEnergyStrip pattern={bodyState} compact />
          </div>
        </div>
      )}

      {/* GEM State Card */}
      <div className="px-6 mb-4">
        <button
          onClick={() => navigate("/dashboard")}
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

      {/* No Scan Empty State */}
      {!hasScanned && (
        <div className="px-6 mb-4">
          <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-display font-bold">No Scan Yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">Take your first scan to see your health summary here.</p>
            </div>
            <button
              onClick={() => navigate("/mirror-check")}
              className="bg-primary text-primary-foreground font-display font-medium text-xs px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors active:scale-[0.98]"
            >
              <Scan className="w-3.5 h-3.5 inline mr-1.5" />
              Start Scanning
            </button>
          </div>
        </div>
      )}


      {/* 5. 7-Day Streak with motivational copy */}
      <div className="px-6 mb-4">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-warning" />
            <div>
              <p className="text-xs font-display font-medium">7-Day Scan Streak</p>
              <p className="text-[10px] text-muted-foreground">
                {streakCount} day{streakCount !== 1 ? "s" : ""} strong 🔥 Scan today to keep it going!
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-1">
            {STREAK_DAYS.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-medium transition-colors ${
                    d.done
                      ? "bg-warning/20 text-warning"
                      : d.isToday
                      ? "border-2 border-primary text-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {d.done ? "✓" : d.day}
                </div>
                <span className={`text-[9px] font-display ${d.isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {d.isToday ? "Today" : d.day}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => navigate("/scan")}
              className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-display font-medium rounded-full px-3 py-1 hover:bg-primary/20 transition-colors active:scale-[0.98]"
            >
              <Scan className="w-3 h-3" />
              Scan Now
            </button>
          </div>
        </div>
      </div>

      {/* 6. Work with a Coach */}
      {!isPractitioner && !hasActivePractitioner && (
        <div className="px-6 mb-4">
          <button
            onClick={() => navigate("/find-practitioner")}
            className="glass-card p-4 w-full flex items-center gap-3 text-left border-primary/20 hover:border-primary/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-display font-semibold">Book a Bioenergetic Consultation</p>
              <p className="text-xs text-muted-foreground">Deeper insights with an E4L certified practitioner</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
        </div>
      )}

      {/* 7. Video of the Day */}
      <div className="px-6 mb-4">
        <div className="glass-card overflow-hidden">
          <div
            className="relative w-full h-40 rounded-t-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--info) / 0.2))" }}
          >
            <div className="absolute top-3 left-3">
              <span className="text-[9px] font-display font-medium text-muted-foreground bg-background/60 backdrop-blur-sm px-2 py-1 rounded-full">
                Recommended based on your stress score
              </span>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary/30 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-primary/40 transition-colors">
              <Play className="w-6 h-6 text-primary ml-0.5" />
            </div>
          </div>
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-1">
              Video of the Day
            </p>
            <p className="text-sm font-display font-semibold">Understanding Your Energy Pillar</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">8 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Track of the Day */}
      <div className="px-6 mb-4">
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-2">
            Track of the Day
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0 text-2xl">
              🧘
            </div>
            <div className="flex-1">
              <p className="text-sm font-display font-semibold">Morning Calm</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">5 min guided</span>
              </div>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">Good for recovery days</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center hover:bg-info/20 transition-colors flex-shrink-0 active:scale-95">
              <Play className="w-4 h-4 text-info ml-0.5" />
            </button>
          </div>
        </div>
      </div>


      {/* Scan Type Picker Dialog */}
      <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Choose Scan Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => { setScanDialogOpen(false); navigate("/mirror-check"); }}
              className="glass-card p-4 w-full flex items-center gap-4 text-left hover:border-primary/20 transition-colors active:scale-[0.98]"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Scan className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold">Quick Scan</p>
                <p className="text-[11px] text-muted-foreground">~60s · Face, voice &amp; tongue snapshot</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => { setScanDialogOpen(false); navigate("/deep-scan"); }}
              className="glass-card p-4 w-full flex items-center gap-4 text-left hover:border-primary/20 transition-colors active:scale-[0.98]"
            >
              <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold">Deep Scan</p>
                <p className="text-[11px] text-muted-foreground">~3 min · Mirror check + vocal biomarkers</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Device Picker Dialog */}
      <Dialog open={devicePickerOpen} onOpenChange={setDevicePickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Send to Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {/* Phone — Coming soon */}
            <button
              onClick={() => { toast({ title: "Coming soon", description: "Phone playback is coming in a future update." }); }}
              className="glass-card p-4 w-full flex items-center gap-4 text-left opacity-60 cursor-default"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold">Phone</p>
                <p className="text-[11px] text-muted-foreground">Play on this device</p>
              </div>
              <span className="text-[9px] font-display font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Coming soon</span>
            </button>
            {/* GEM — Active */}
            <button
              onClick={() => { setDevicePickerOpen(false); navigate("/gem/correct"); }}
              className="glass-card p-4 w-full flex items-center gap-4 text-left hover:border-success/20 transition-colors active:scale-[0.98]"
            >
              <div className="w-11 h-11 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <Bluetooth className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold">GEM</p>
                <p className="text-[11px] text-muted-foreground">Send to your GEM device</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            {/* miHealth — Coming soon */}
            <button
              onClick={() => { toast({ title: "Coming soon", description: "miHealth integration is coming in a future update." }); }}
              className="glass-card p-4 w-full flex items-center gap-4 text-left opacity-60 cursor-default"
            >
              <div className="w-11 h-11 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold">miHealth</p>
                <p className="text-[11px] text-muted-foreground">Send to your miHealth device</p>
              </div>
              <span className="text-[9px] font-display font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Coming soon</span>
            </button>
            {/* Lightbed — Coming soon */}
            <button
              onClick={() => { toast({ title: "Coming soon", description: "Lightbed integration is coming in a future update." }); }}
              className="glass-card p-4 w-full flex items-center gap-4 text-left opacity-60 cursor-default"
            >
              <div className="w-11 h-11 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                <Sun className="w-5 h-5 text-info" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold">Lightbed</p>
                <p className="text-[11px] text-muted-foreground">Send to your Lightbed</p>
              </div>
              <span className="text-[9px] font-display font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Coming soon</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Home;
