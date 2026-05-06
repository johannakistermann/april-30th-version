import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, MessageSquare, Check, Minus, ChevronDown } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const PURPLE = "hsl(270 60% 70%)";

const data = {
  week: 6,
  score: 70,
  zone: "AMBER",
  delta: 2,
  constitutional: {
    score: 68,
    weight: 60,
    features: [
      { label: "Tongue body color", value: "Light red", detected: true },
      { label: "Tongue cracking (centre)", value: "Present", detected: true },
      { label: "Tongue swelling", value: "Mild", detected: true },
      { label: "Teeth marks", value: "None", detected: false },
      { label: "Nasolabial fold depth", value: "Above age norm", detected: true },
      { label: "Vertical liver line", value: "Present", detected: true },
      { label: "Earlobe Frank's sign", value: "Absent", detected: false },
      { label: "FaceAge delta", value: "+2.1 yrs", detected: true },
    ],
  },
  crossModal: {
    score: 73,
    weight: 40,
    patterns: [
      { label: "Constitutional blood/qi deficiency", tongue: true, face: false },
      { label: "Chronic liver pattern", tongue: true, face: true },
      { label: "Source/constitutional depletion", tongue: true, face: true },
      { label: "Glycation/pancreas pattern", tongue: true, face: false },
      { label: "Vascular constitutional pattern", tongue: true, face: true },
    ],
  },
  clusters: [
    { id: "vitality-constitution", name: "Vitality & Constitution", weight: 25, score: 78, eds: "Source · Imprinter", witnesses: 4, zone: "green" as const },
    { id: "digestion-metabolism", name: "Digestion & Metabolism", weight: 30, score: 62, eds: "Pancreas · Stomach", witnesses: 5, zone: "amber" as const },
    { id: "detox-elimination", name: "Detox & Elimination", weight: 25, score: 58, eds: "Liver · Kidney", witnesses: 6, zone: "amber" as const },
    { id: "immunity-defence", name: "Immunity & Defence", weight: 20, score: 80, eds: "Immune · Thymus", witnesses: 3, zone: "green" as const },
  ],
};

const zoneClass = (z: "green" | "amber" | "red") =>
  z === "green" ? "text-success" : z === "amber" ? "text-warning" : "text-destructive";

const Indicator = ({ on }: { on: boolean }) =>
  on ? <Check className="w-3.5 h-3.5 text-success" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground" />;

const ControlPillarDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Header nav */}
        <div className="px-6 pt-12 pb-3 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" aria-label="Back to Detect">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">Vitality Pillar · Week {data.week}</p>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-semibold">Control</h1>
              <span
                className="px-1.5 py-0.5 rounded-md text-[9px] font-display font-semibold"
                style={{ background: "hsl(270 60% 70% / 0.15)", color: PURPLE }}
              >→ Information</span>
            </div>
          </div>
        </div>

        {/* Score hero */}
        <div className="px-6 pb-4">
          <div className="glass-card p-5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-display font-bold">{data.score}</span>
              <span className="text-xs font-display font-semibold text-warning tracking-wide">{data.zone}</span>
            </div>
            <span className="text-xs font-display font-medium text-success">▲ +{data.delta} vs week {data.week - 1}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-3">
            Control measures how clearly your body's signaling system is operating. It has two layers: an overall coherence score (which feeds Vitality) and four focus areas (which drive your recommendations).
          </p>
        </div>

        {/* Section 1 — Headline Layer */}
        <div className="px-6 mb-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">Headline Score · Control = Information</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Built from absolute, slowly-changing structural patterns in your tongue and face. This is what feeds the Information term in your Vitality equation.
          </p>
        </div>

        {/* Constitutional Pattern card */}
        <div className="px-6 mb-3 mt-3">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: PURPLE }} />
                <h2 className="text-sm font-display font-medium">Constitutional Pattern</h2>
                <span className="text-[10px] text-muted-foreground">({data.constitutional.weight}%)</span>
              </div>
              <span className="text-2xl font-display font-medium" style={{ color: PURPLE }}>{data.constitutional.score}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Reads constitutional and structural signaling patterns from features in your tongue and face that change slowly.
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {data.constitutional.features.map((f) => (
                <div key={f.label} className="flex items-center justify-between border border-border/40 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] text-foreground/90">{f.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{f.value}</span>
                    <Indicator on={f.detected} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cross-Modal Agreement card */}
        <div className="px-6 mb-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: PURPLE }} />
                <h2 className="text-sm font-display font-medium">Cross-Modal Agreement</h2>
                <span className="text-[10px] text-muted-foreground">({data.crossModal.weight}%)</span>
              </div>
              <span className="text-2xl font-display font-medium" style={{ color: PURPLE }}>{data.crossModal.score}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              How much your tongue and face are telling the same story across constitutional patterns. Coherent signaling shows up as agreement; noise shows up as disagreement.
            </p>
            <div className="w-full h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${data.crossModal.score}%`, background: PURPLE }} />
            </div>
            <div className="space-y-1.5">
              {data.crossModal.patterns.map((p) => (
                <div key={p.label} className="flex items-center justify-between border border-border/40 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] text-foreground/90 flex-1 min-w-0 truncate">{p.label}</span>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">Tongue <Indicator on={p.tongue} /></span>
                    <span className="flex items-center gap-1">Face <Indicator on={p.face} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2 — Sub-Scores Layer */}
        <div className="px-6 mb-2 mt-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">Four focus areas · Drives your recommendations</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Built from voice resonance — the priorities the system is detecting in your bioenergetic field. These don't roll up into your Control score, but they decide which Infoceuticals you're recommended.
          </p>
        </div>

        <div className="px-6 mb-4 mt-3 space-y-2">
          {data.clusters.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/detect/pillar/control?cluster=${c.id}`)}
              className="w-full glass-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-left hover:border-primary/30"
              aria-label={`${c.name}, score ${c.score}, open detail`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-display font-medium">{c.name}</p>
                  <span className="text-[10px] text-muted-foreground">({c.weight}%)</span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{c.eds} · {c.witnesses} witnesses</p>
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
                Tongue and face structural features are absolute measurements — you either have a deep nasolabial fold or you don't. Voice resonance is a ranking instrument — it tells us which of your bioenergetic systems most needs support this week, but a "high" reading is relative, not a measure of disease. Each layer uses the data shape that fits its job.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Section 4 — Recommendations */}
        <div className="px-6 mb-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-2">Your recs that target Control</p>
          <div className="space-y-1.5">
            {[
              { name: "Liver Driver", rationale: "Targets Detox & Elimination", confidence: "High" },
              { name: "Pancreas", rationale: "Targets Digestion & Metabolism", confidence: "High" },
              { name: "Source", rationale: "Targets Vitality & Constitution", confidence: "Medium" },
            ].map((r) => (
              <div key={r.name} className="bg-card/60 border border-border/60 rounded-xl px-3 py-2.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.rationale}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                  r.confidence === "High" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                }`}>{r.confidence}</span>
              </div>
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--info) / 0.18)" }}>
              <MessageSquare className="w-4 h-4" style={{ color: "hsl(var(--info))" }} />
            </div>
            <span className="flex-1 text-sm font-display font-medium">What does my Control score actually tell me?</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ControlPillarDetail;
