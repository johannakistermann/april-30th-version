import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, TrendingUp, TrendingDown, Minus, Info, Zap, Heart, Brain, Gauge } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const PILLAR_DATA: Record<string, {
  name: string;
  icon: any;
  score: number;
  trend: string;
  zone: string;
  color: string;
  question: string;
  insight: string;
  formula: string;
  subScores: Array<{
    name: string; score: number | null; weight: string; trend: string | null;
    confidence: string | null; locked: boolean; message: string | null;
  }>;
}> = {
  "control": {
    name: "Control",
    icon: Gauge,
    score: 78,
    trend: "+3",
    zone: "green",
    color: "success",
    question: "Which bioenergetic drivers are setting the priorities for your system?",
    insight: "Your top-ranked Energetic Drivers point to Source and Polarity — foundational regulators are active.",
    formula: "Control = ranked signature across Energetic Drivers (relative ranking, not absolute score)",
    subScores: [
      { name: "Driver Signature Strength", score: 74, weight: "60%", trend: "up", confidence: "Medium", locked: false, message: "Top 5 drivers identified from voice + tongue + face" },
      { name: "Integrator Alignment", score: 80, weight: "40%", trend: "up", confidence: "Medium", locked: false, message: "Energetic Integrators tracking with drivers" },
    ],
  },
  "energy": {
    name: "Energy",
    icon: Zap,
    score: 62,
    trend: "-2",
    zone: "amber",
    color: "warning",
    question: "How well is your body generating and using energy day to day?",
    insight: "Daily Energy Pattern leans toward Recovering — your system is asking for fuel and rest.",
    formula: "Energy = (Cellular × 0.30) + (Daily Energy Pattern × 0.30) + (Mito Proxy × 0.20) + (Pulse × 0.20)",
    subScores: [
      { name: "Cellular Vitality", score: 72, weight: "30%", trend: "up", confidence: "Medium", locked: false, message: "Tongue body colour + face tone witnesses" },
      { name: "Daily Energy Pattern", score: 58, weight: "30%", trend: "down", confidence: "Medium", locked: false, message: "From GEM Body State Engine: Fired Up / Flow / Recovering" },
      { name: "Mitochondrial Proxy", score: 64, weight: "20%", trend: "flat", confidence: "Low", locked: false, message: "Add wearable for continuous insights" },
      { name: "Pulse Health Index", score: null, weight: "20%", trend: null, confidence: null, locked: true, message: "Connect GEM to unlock pulse quality insights" },
    ],
  },
  "recovery": {
    name: "Recovery",
    icon: Heart,
    score: 55,
    trend: "+1",
    zone: "amber",
    color: "warning",
    question: "How well is your body rebuilding and clearing load between efforts?",
    insight: "Sleep quality strong, but recovery capacity lagging — overnight HRV trending down.",
    formula: "Recovery = (Sleep × 0.40) + (Recovery Capacity × 0.35) + (Elimination × 0.25)",
    subScores: [
      { name: "Sleep Quality", score: 78, weight: "40%", trend: "up", confidence: "High", locked: false, message: null },
      { name: "Recovery Capacity", score: 48, weight: "35%", trend: "down", confidence: "Medium", locked: false, message: "Voice fatigue markers + face tone" },
      { name: "Elimination Capacity", score: 50, weight: "25%", trend: "flat", confidence: "Low", locked: false, message: "Tongue coating density witness" },
    ],
  },
  "stress-nervous": {
    name: "Stress & Nervous System",
    icon: Brain,
    score: 71,
    trend: "+5",
    zone: "amber",
    color: "warning",
    question: "How balanced is your autonomic nervous system, and what's your current stress load?",
    insight: "Voice stress markers are improving — your breathwork practice is showing results.",
    formula: "Stress = (Autonomic × 0.35) + (Vagal × 0.25) + (Emotional × 0.25) + (HPA × 0.15)",
    subScores: [
      { name: "Autonomic Balance", score: 68, weight: "35%", trend: "up", confidence: "Low", locked: false, message: "Connect wearable for LF/HF ratio and diurnal HRV" },
      { name: "Vagal Tone", score: 75, weight: "25%", trend: "up", confidence: "Medium", locked: false, message: "Voice HNR improved — sustained phonation +2s" },
      { name: "Emotional State", score: 72, weight: "25%", trend: "up", confidence: "High", locked: false, message: null },
      { name: "HPA Axis Proxy", score: 65, weight: "15%", trend: "flat", confidence: "Low", locked: false, message: "Morning/evening HRV differential needs wearable data" },
    ],
  },
};

const PILLAR_NAV = [
  { id: "control", label: "Control", icon: Gauge },
  { id: "energy", label: "Energy", icon: Zap },
  { id: "recovery", label: "Recovery", icon: Heart },
  { id: "stress-nervous", label: "Stress", icon: Brain },
];

const PillarDetail = () => {
  const navigate = useNavigate();
  const { pillarId } = useParams<{ pillarId: string }>();
  const pillar = PILLAR_DATA[pillarId || "control"] || PILLAR_DATA["control"];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">{pillar.name}</h1>
          <p className="text-xs text-muted-foreground">Updated 2h ago</p>
        </div>
      </div>

      {/* Pillar Switcher */}
      <div className="px-6 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {PILLAR_NAV.map((p) => {
          const isActive = p.id === (pillarId || "control");
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/pillar/${p.id}`)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
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
      <div className="px-6 mb-6">
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={`hsl(var(--${pillar.color}))`} strokeWidth="6" strokeLinecap="round"
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
              <span className={`text-xs bg-${pillar.color}/20 text-${pillar.color} px-2 py-0.5 rounded-full font-medium capitalize`}>
                {pillar.zone} Zone
              </span>
              <span className={`text-xs ${pillar.trend.startsWith("+") ? "text-success" : "text-destructive"} flex items-center gap-0.5`}>
                {pillar.trend.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {pillar.trend}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Confidence: Medium</p>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="px-6 mb-4">
        <div className={`glass-card p-3 border-${pillar.color}/20 flex items-center gap-2`}>
          <Info className={`w-4 h-4 text-${pillar.color} flex-shrink-0`} />
          <p className="text-xs text-muted-foreground">{pillar.insight}</p>
        </div>
      </div>


      {/* Sub-scores */}
      <div className="px-6 space-y-3">
        <h2 className="text-sm font-display font-semibold">Sub-Scores</h2>
        {pillar.subScores.map((sub) => (
          <div key={sub.name} className={`glass-card p-4 ${sub.locked ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {sub.locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className="text-sm font-medium">{sub.name}</span>
                <span className="text-[10px] text-muted-foreground">({sub.weight})</span>
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
            {sub.confidence && !sub.locked && (
              <p className="text-[10px] text-muted-foreground mt-2">Confidence: {sub.confidence}</p>
            )}
            {sub.message && (
              <p className="text-[10px] text-primary mt-1 cursor-pointer hover:underline">{sub.message}</p>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default PillarDetail;
