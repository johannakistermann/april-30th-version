import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, TrendingUp, TrendingDown, Minus, Info, Zap, Heart, Brain, Gauge, AlertTriangle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ControlPillarDetail from "@/pages/detect/ControlPillarDetail";
import { useVitality } from "@/lib/scoring";
import DailyEnergyStrip from "@/components/scoring/DailyEnergyStrip";
import type { PillarId, PillarScore } from "@/lib/scoring";

const PILLAR_NAV: { id: PillarId; label: string; icon: any }[] = [
  { id: "control", label: "Control", icon: Gauge },
  { id: "energy", label: "Energy", icon: Zap },
  { id: "recovery", label: "Recovery", icon: Heart },
  { id: "stress-nervous", label: "Stress", icon: Brain },
];

const PILLAR_ICON: Record<PillarId, any> = {
  control: Gauge, energy: Zap, recovery: Heart, "stress-nervous": Brain,
};

const zoneColor = (zone: string) =>
  zone === "green" ? "success" : zone === "amber" ? "warning" : "destructive";

const PillarDetail = () => {
  const navigate = useNavigate();
  const { pillarId } = useParams<{ pillarId: string }>();
  const { control, pillars, bodyState, baselineRemaining, baseline } = useVitality();

  const allPillars: Record<PillarId, PillarScore> = {
    control,
    energy: pillars.energy,
    recovery: pillars.recovery,
    "stress-nervous": pillars.stress,
  };

  const activeId = (pillarId as PillarId) in allPillars ? (pillarId as PillarId) : "control";
  const pillar = allPillars[activeId];
  const color = zoneColor(pillar.zone);
  const trendUp = pillar.trend.startsWith("+") && pillar.trend !== "+0";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">{pillar.name}</h1>
          {activeId === "control" && (
            <p className="text-[10px] text-primary font-display">Bioenergetic priorities — not in Vitality formula</p>
          )}
        </div>
      </div>

      {/* Pillar Switcher */}
      <div className="px-6 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {PILLAR_NAV.map((p) => {
          const isActive = p.id === activeId;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/pillar/${p.id}`)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <div className="px-6 mb-4">
        <p className="text-xs text-muted-foreground italic">"{pillar.question}"</p>
      </div>

      {/* Hero score */}
      <div className="px-6 mb-4">
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={`hsl(var(--${color}))`} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - pillar.score / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-display font-bold">{pillar.score}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs bg-${color}/20 text-${color} px-2 py-0.5 rounded-full font-medium capitalize`}>
                {pillar.zone} Zone
              </span>
              {baseline.isEstablishing ? (
                <span className="text-[10px] text-primary">{baseline.label}</span>
              ) : (
                <span className={`text-xs flex items-center gap-0.5 ${trendUp ? "text-success" : pillar.trend.startsWith("-") ? "text-destructive" : "text-muted-foreground"}`}>
                  {trendUp ? <TrendingUp className="w-3 h-3" /> : pillar.trend.startsWith("-") ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {pillar.trend}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Confidence: {pillar.confidence}</p>
            <p className="text-[10px] text-muted-foreground/80">{pillar.formula}</p>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="px-6 mb-4">
        <div className={`glass-card p-3 border-${color}/20 flex items-center gap-2`}>
          <Info className={`w-4 h-4 text-${color} flex-shrink-0`} />
          <p className="text-xs text-muted-foreground">{pillar.insight}</p>
        </div>
      </div>

      {/* Severity hits (spec §6) */}
      {pillar.severityHits.length > 0 && (
        <div className="px-6 mb-4">
          <div className="glass-card p-3 border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
              <p className="text-[11px] font-display font-semibold text-warning">Severity hits this week</p>
              <span className="text-[10px] text-muted-foreground ml-auto">
                Raw {pillar.rawScore} → {pillar.score}
              </span>
            </div>
            <div className="space-y-1.5">
              {pillar.severityHits.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-foreground/80">{h.label}</span>
                  <span className="flex items-center gap-2">
                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      h.severity === "severe" ? "bg-destructive/15 text-destructive" :
                      h.severity === "moderate" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
                    }`}>{h.severity}</span>
                    <span className="font-display font-semibold text-destructive">−{h.deduction}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Energy Pattern strip — Energy pillar only */}
      {activeId === "energy" && (
        <div className="px-6 mb-4">
          <div className="glass-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-3">Daily Energy Pattern · 24h</p>
            <DailyEnergyStrip pattern={bodyState} />
          </div>
        </div>
      )}

      {/* Sub-scores */}
      <div className="px-6 space-y-3">
        <h2 className="text-sm font-display font-semibold">Sub-Scores</h2>
        {pillar.subScores.map((sub) => {
          const weightPct = Math.round(sub.weight * 100);
          const baseWeightPct = Math.round(sub.baseWeight * 100);
          const redistributed = !sub.locked && weightPct !== baseWeightPct;
          return (
            <div key={sub.name} className={`glass-card p-4 ${sub.locked ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {sub.locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                  {sub.acuteFlag && (
                    <span title="Acute drop vs trend (>15)" className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  )}
                  <span className="text-sm font-medium">{sub.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({sub.locked ? `${baseWeightPct}% locked` : `${weightPct}%`}{redistributed ? ` · base ${baseWeightPct}%` : ""})
                  </span>
                </div>
                {sub.score !== null ? (
                  <div className="flex items-center gap-1.5">
                    {sub.trend === "up" && <TrendingUp className="w-3 h-3 text-success" />}
                    {sub.trend === "flat" && <Minus className="w-3 h-3 text-muted-foreground" />}
                    {sub.trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
                    <span className="text-lg font-display font-bold">{sub.score}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">LOCKED</span>
                )}
              </div>
              {!sub.locked && sub.score !== null && (
                <div className="w-full h-1 bg-muted rounded-full">
                  <div
                    className={`h-full rounded-full ${sub.score >= 75 ? "bg-success" : sub.score >= 50 ? "bg-warning" : "bg-destructive"}`}
                    style={{ width: `${sub.score}%` }}
                  />
                </div>
              )}
              {!sub.locked && (
                <p className="text-[10px] text-muted-foreground mt-2">Confidence: {sub.confidence}</p>
              )}
              {sub.message && (
                <p className="text-[10px] text-primary mt-1">{sub.message}</p>
              )}
              {redistributed && (
                <p className="text-[10px] text-warning mt-1">Weight redistributed (+{weightPct - baseWeightPct}%) to cover locked signal</p>
              )}
            </div>
          );
        })}
      </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default PillarDetail;
