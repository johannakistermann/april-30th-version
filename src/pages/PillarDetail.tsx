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
  "energy-recovery": {
    name: "Energy & Recovery",
    icon: Zap,
    score: 78,
    trend: "+3",
    zone: "green",
    color: "success",
    question: "How well is my body generating and recovering energy?",
    insight: "Your Recovery Capacity jumped 12 points — your biggest improvement this week.",
    formula: "Energy = (Cellular × 0.25) + (Sleep × 0.30) + (Recovery × 0.15) + (Mito × 0.15) + (Pulse × 0.15)",
    subScores: [
      { name: "Cellular Vitality", score: 72, weight: "25%", trend: "up", confidence: "Medium", locked: false, message: "Upload Phase Angle from clinic for sharper reading" },
      { name: "Sleep Quality", score: 85, weight: "30%", trend: "up", confidence: "High", locked: false, message: null },
      { name: "Recovery Capacity", score: 68, weight: "15%", trend: "flat", confidence: "Medium", locked: false, message: null },
      { name: "Mitochondrial Proxy", score: 74, weight: "15%", trend: "up", confidence: "Low", locked: false, message: "Add wearable for continuous insights" },
      { name: "Pulse Health Index", score: null, weight: "15%", trend: null, confidence: null, locked: true, message: "Connect GEM to unlock pulse quality insights" },
    ],
  },
  "organs-inflammation": {
    name: "Organs & Inflammation",
    icon: Heart,
    score: 62,
    trend: "-2",
    zone: "amber",
    color: "warning",
    question: "How are my core organ systems functioning, and is chronic inflammation present?",
    insight: "Tongue coating density increased — possible digestive heat. Consider cooling foods.",
    formula: "Organs = (Organ Composite × 0.55) + (Inflammatory × 0.25) + (Elimination × 0.20)",
    subScores: [
      { name: "Liver", score: 58, weight: "14%", trend: "down", confidence: "Medium", locked: false, message: "Purple tongue sides + wiry pulse pattern detected" },
      { name: "Kidney", score: 65, weight: "14%", trend: "flat", confidence: "Medium", locked: false, message: "Pale tongue root, low voice F0 noted" },
      { name: "Spleen", score: 52, weight: "14%", trend: "down", confidence: "High", locked: false, message: "Thick coating + tooth marks — Spleen Damp pattern" },
      { name: "Heart", score: 70, weight: "8%", trend: "up", confidence: "Medium", locked: false, message: null },
      { name: "Lung", score: 68, weight: "5%", trend: "flat", confidence: "Medium", locked: false, message: null },
      { name: "Inflammatory Load", score: 55, weight: "25%", trend: "down", confidence: "Low", locked: false, message: "Upload hsCRP labs for precision" },
      { name: "Elimination Capacity", score: 62, weight: "20%", trend: "flat", confidence: "Low", locked: false, message: "Based on Liver + Kidney composite" },
    ],
  },
  "stress-nervous": {
    name: "Stress & Nervous System",
    icon: Brain,
    score: 71,
    trend: "+5",
    zone: "amber",
    color: "warning",
    question: "How balanced is my autonomic nervous system, and what's my current stress load?",
    insight: "Voice stress markers are improving — your breathwork practice is showing results.",
    formula: "Stress = (Autonomic × 0.35) + (Vagal × 0.25) + (Emotional × 0.25) + (HPA × 0.15)",
    subScores: [
      { name: "Autonomic Balance", score: 68, weight: "35%", trend: "up", confidence: "Low", locked: false, message: "Connect wearable for LF/HF ratio and diurnal HRV" },
      { name: "Vagal Tone", score: 75, weight: "25%", trend: "up", confidence: "Medium", locked: false, message: "Voice HNR improved — sustained phonation +2s" },
      { name: "Emotional State", score: 72, weight: "25%", trend: "up", confidence: "High", locked: false, message: null },
      { name: "HPA Axis Proxy", score: 65, weight: "15%", trend: "flat", confidence: "Low", locked: false, message: "Morning/evening HRV differential needs wearable data" },
    ],
  },
  "metabolic-cv": {
    name: "Metabolic & Cardiovascular",
    icon: Gauge,
    score: 55,
    trend: "+1",
    zone: "amber",
    color: "warning",
    question: "How efficiently is my body processing fuel and how healthy is my circulatory system?",
    insight: "This pillar benefits most from lab data. Upload blood labs to unlock 55% of locked sub-scores.",
    formula: "MetaCV = (Glycaemic × 0.30) + (Vascular × 0.25) + (Lipid × 0.25) + (CV Fitness × 0.20)",
    subScores: [
      { name: "Glycaemic Resilience", score: null, weight: "30%", trend: null, confidence: null, locked: true, message: "Upload fasting glucose, HbA1c, or insulin labs to unlock" },
      { name: "Vascular Health", score: 58, weight: "25%", trend: "up", confidence: "Low", locked: false, message: "RHR + rPPG only — connect GEM for Pulse Wave Velocity" },
      { name: "Lipid / Metabolic", score: null, weight: "25%", trend: null, confidence: null, locked: true, message: "Upload cholesterol, LDL, HDL, triglyceride labs to unlock" },
      { name: "CV Fitness", score: 52, weight: "20%", trend: "flat", confidence: "Medium", locked: false, message: "Based on Breath Count + symptom data" },
    ],
  },
};

const PILLAR_NAV = [
  { id: "energy-recovery", label: "Energy", icon: Zap },
  { id: "organs-inflammation", label: "Organs", icon: Heart },
  { id: "stress-nervous", label: "Stress", icon: Brain },
  { id: "metabolic-cv", label: "Metabolic", icon: Gauge },
];

const PillarDetail = () => {
  const navigate = useNavigate();
  const { pillarId } = useParams<{ pillarId: string }>();
  const pillar = PILLAR_DATA[pillarId || "energy-recovery"] || PILLAR_DATA["energy-recovery"];

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
          const isActive = p.id === (pillarId || "energy-recovery");
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
