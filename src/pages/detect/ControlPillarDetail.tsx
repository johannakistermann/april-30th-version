import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, MessageSquare, ChevronDown, MoreVertical, Gauge, Zap, Heart, Brain } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const PILLAR_NAV = [
  { id: "control", label: "Control", icon: Gauge },
  { id: "energy", label: "Energy", icon: Zap },
  { id: "recovery", label: "Recovery", icon: Heart },
  { id: "stress-nervous", label: "Stress", icon: Brain },
] as const;

const PURPLE = "hsl(270 60% 70%)";

type Impact = "none" | "neutral" | "small" | "moderate";

const data = {
  week: 6,
  score: 70,
  zone: "AMBER",
  delta: 2,
  constitutional: {
    score: 68,
    weight: 60,
    features: [
      { label: "Tongue body color", value: "Light red", impact: "neutral" as Impact },
      { label: "Tongue cracking pattern", value: "Centre crack present", impact: "moderate" as Impact },
      { label: "Tongue swelling by zone", value: "Tip + edges clear", impact: "none" as Impact },
      { label: "Teeth marks", value: "Slight", impact: "small" as Impact },
      { label: "Nasolabial fold depth", value: "Within range", impact: "none" as Impact },
      { label: "Vertical liver line", value: "Faint", impact: "moderate" as Impact },
      { label: "Earlobe Frank's sign", value: "Absent", impact: "none" as Impact },
      { label: "FaceAge delta", value: "+1 year", impact: "small" as Impact },
    ],
  },
  crossModal: {
    score: 73,
    weight: 40,
    patterns: [
      { label: "Constitutional blood/qi deficiency", tongue: "yes", face: "yes" },
      { label: "Chronic liver pattern", tongue: "yes", face: "yes" },
      { label: "Source / constitutional depletion", tongue: "yes", face: "neutral" },
      { label: "Glycation / pancreas pattern", tongue: "yes", face: "yes" },
      { label: "Vascular constitutional pattern", tongue: "yes", face: "yes" },
    ] as { label: string; tongue: WitnessState; face: WitnessState }[],
  },
  clusters: [
    { id: "vitality-constitution", name: "Vitality & Constitution", weight: 25, score: 78, eds: "ED1, ED2", witnesses: 4, zone: "green" as const },
    { id: "digestion-metabolism", name: "Digestion & Metabolism", weight: 30, score: 62, eds: "ED8, ED11, ED15", witnesses: 6, zone: "amber" as const },
    { id: "detox-elimination", name: "Detox & Elimination", weight: 25, score: 58, eds: "ED11, ED12, ED10", witnesses: 5, zone: "amber" as const },
    { id: "immunity-defence", name: "Immunity & Defence", weight: 20, score: 80, eds: "ED13, ED14", witnesses: 3, zone: "green" as const },
  ],
  recs: [
    { id: "liver-driver", position: 1, name: "Liver Driver", why: "Targets Detox & Elimination — your lowest Control sub-score this week", confidence: "High" as const },
    { id: "pancreas", position: 2, name: "Pancreas", why: "Targets Digestion & Metabolism — second-priority sub-cluster", confidence: "High" as const },
    { id: "source", position: 3, name: "Source", why: "Supports Vitality & Constitution as a constitutional foundation", confidence: "Medium" as const },
  ],
};

type WitnessState = "yes" | "neutral" | "no";

const zoneClass = (z: "green" | "amber" | "red") =>
  z === "green" ? "text-success" : z === "amber" ? "text-warning" : "text-destructive";

const WitnessChip = ({ state }: { state: WitnessState }) => {
  if (state === "yes") return <span className="text-success font-semibold">✓</span>;
  if (state === "no") return <span className="text-destructive font-semibold">✗</span>;
  return <span className="text-muted-foreground">—</span>;
};

const ImpactChip = ({ impact }: { impact: Impact }) => {
  if (impact === "none" || impact === "neutral") {
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium bg-muted text-muted-foreground">
        {impact === "none" ? "none" : "neutral"}
      </span>
    );
  }
  const isModerate = impact === "moderate";
  const cls = isModerate
    ? "bg-destructive/15 text-destructive"
    : "bg-warning/15 text-warning";
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${cls}`}>
      {impact} −
    </span>
  );
};

const ControlPillarDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Top nav bar */}
        <div className="px-6 pt-12 pb-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="flex-1 text-center text-sm font-display font-medium">Pillar</h1>
          <button
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Pillar Switcher */}
        <div className="px-6 mb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {PILLAR_NAV.map((p) => {
            const isActive = p.id === "control";
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => !isActive && navigate(`/pillar/${p.id}`)}
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

        {/* Page header */}
        <div className="px-6 pt-2 pb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">
            Vitality Pillar · Week {data.week}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-2xl font-display font-semibold">Control</h2>
            <span
              className="px-1.5 py-0.5 rounded-md text-[9px] font-display font-semibold"
              style={{ background: "hsl(270 60% 70% / 0.15)", color: PURPLE }}
            >
              → Information
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-display font-bold">{data.score}</span>
              <span className="text-xs font-display font-semibold text-warning tracking-wide">{data.zone}</span>
            </div>
            <span className="text-xs font-display font-medium text-success">
              ▲ +{data.delta} vs week {data.week - 1}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-3">
            Control measures how clearly your body's signaling system is operating. It has two layers: an overall coherence score that feeds Vitality, and four focus areas that drive your weekly recommendations.
          </p>
        </div>

        {/* Section 1 — Headline Layer */}
        <div className="px-6 mb-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
            Headline Score · Feeds your Vitality
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Built from absolute, slowly-changing structural patterns in your tongue and face. Coherent signaling here multiplies your Vitality up to +10%; distorted signaling can pull it down up to −10%.
          </p>
        </div>

        {/* Constitutional Pattern card (non-interactive) */}
        <div className="px-6 mb-3 mt-3">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: PURPLE }} />
                <h3 className="text-sm font-display font-medium">Constitutional Pattern</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                  {data.constitutional.weight}%
                </span>
              </div>
              <span className="text-2xl font-display font-medium" style={{ color: PURPLE }}>
                {data.constitutional.score}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Reads constitutional and structural signaling patterns from features in your tongue and face that change slowly.
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-1.5">
              Features read this scan
            </p>
            <div className="space-y-1">
              {data.constitutional.features.map((f) => (
                <div
                  key={f.label}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border border-border/40 rounded-lg px-2.5 py-1.5"
                >
                  <span className="text-[11px] text-foreground/90 truncate">{f.label}</span>
                  <span className="text-[10px] text-muted-foreground">{f.value}</span>
                  <ImpactChip impact={f.impact} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cross-Modal Agreement card (non-interactive) */}
        <div className="px-6 mb-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: PURPLE }} />
                <h3 className="text-sm font-display font-medium">Cross-Modal Agreement</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                  {data.crossModal.weight}%
                </span>
              </div>
              <span className="text-2xl font-display font-medium" style={{ color: PURPLE }}>
                {data.crossModal.score}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              How much your tongue and face are telling the same story across constitutional patterns. High agreement signals coherent signaling; disagreement signals noise.
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${data.crossModal.score}%`, background: PURPLE }}
                />
              </div>
              <span className="text-[10px] font-display font-medium text-muted-foreground tabular-nums">
                {data.crossModal.score} / 100
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-1.5">
              Patterns checked
            </p>
            <div className="space-y-1">
              {data.crossModal.patterns.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center justify-between border border-border/40 rounded-lg px-2.5 py-1.5 gap-2"
                >
                  <span className="text-[11px] text-foreground/90 flex-1 min-w-0 truncate">{p.label}</span>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">Tongue <WitnessChip state={p.tongue} /></span>
                    <span className="flex items-center gap-1">Face <WitnessChip state={p.face} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2 — Sub-Scores Layer */}
        <div className="px-6 mb-2 mt-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
            Four focus areas · Drives your recommendations
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Built from voice resonance — the priorities the system detected in your bioenergetic field this scan. These don't roll up into your Control score, but they decide which Infoceuticals you receive.
          </p>
        </div>

        <div className="px-6 mb-4 mt-3 space-y-2">
          {data.clusters.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/detect/pillar/control/cluster/${c.id}`)}
              className="w-full glass-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-left hover:border-primary/30"
              aria-label={`${c.name}, score ${c.score}, open detail`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-display font-medium">{c.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                    {c.weight}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {c.eds} · {c.witnesses} witnesses
                </p>
              </div>
              <span className={`text-base font-display font-semibold ${zoneClass(c.zone)}`}>{c.score}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Section 3 — Why two layers? */}
        <div className="px-6 mb-4">
          <Collapsible>
            <CollapsibleTrigger className="w-full glass-card p-3 flex items-center justify-between text-left active:scale-[0.98] transition-transform">
              <span className="text-xs font-display font-medium">Why two layers?</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="glass-card p-3 mt-1.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tongue and face structural features are absolute — you either have a deep nasolabial fold or you don't. Voice resonance is a ranking instrument — it tells us which of your bioenergetic systems most needs support this week, but a "high" reading is relative, not a measure of disease. Each layer uses the kind of data shape that fits its job.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Section 4 — Recommendations targeting Control */}
        <div className="px-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
              Your recs that target Control
            </p>
            <button
              onClick={() => navigate("/detect/latest#recommendations")}
              className="text-[10px] text-primary font-display font-medium"
            >
              All recs ›
            </button>
          </div>
          <div className="space-y-1.5">
            {data.recs.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/detect/rec/${r.id}`)}
                className="w-full bg-card/60 border border-border/60 rounded-xl px-3 py-2.5 flex items-center gap-3 active:scale-[0.98] transition-transform text-left hover:border-primary/30"
                aria-label={`Recommendation ${r.position}: ${r.name}`}
              >
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-display font-semibold text-muted-foreground flex-shrink-0">
                  {r.position}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.why}</p>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    r.confidence === "High" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                  }`}
                >
                  {r.confidence}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Section 5 — Coach prompt */}
        <div className="px-6">
          <button
            onClick={() => navigate("/ai-coach?context=control-pillar")}
            className="w-full glass-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-left hover:border-primary/30"
            style={{ background: "hsl(var(--info) / 0.08)" }}
            aria-label="Ask Coach about Control"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(var(--info) / 0.18)" }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: "hsl(var(--info))" }} />
            </div>
            <span className="flex-1 text-sm font-display font-medium">
              What does my Control score actually tell me?
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ControlPillarDetail;
