import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

type ShiftKind = "rec-reshuffle" | "pillar-dip" | "subcluster" | "acute-flag";
type Magnitude = "routine" | "notable" | "acute";
type Tone = "success" | "warning" | "destructive" | "primary" | "muted";

type ShiftRow = {
  label: string;
  before: string;
  after: string;
  afterTone?: Tone;
  note?: string;
};

type RecRow = {
  rank: number;
  before: string;
  after: string;
  moved?: "new-top" | "demoted" | "stable";
};

type ShiftData = {
  kind: ShiftKind;
  magnitude: Magnitude;
  eyebrow: string;
  headline: string;
  magnitudeCopy: string;
  diff: ShiftRow[];
  why: { lead: string; reassurance: string };
  recs: RecRow[];
  coachPrompt: string;
};

const SHIFT: ShiftData = {
  kind: "rec-reshuffle",
  magnitude: "routine",
  eyebrow: "WEEK 5 → WEEK 6",
  headline: "Recovery softened, top focus shifted to your kidneys",
  magnitudeCopy:
    "A 3-point Recovery dip with one recommendation reshuffle is within normal weekly variation — no need to act differently this week.",
  diff: [
    { label: "Vitality", before: "67", after: "72", afterTone: "success" },
    {
      label: "Recovery",
      before: "73",
      after: "70",
      afterTone: "warning",
      note: "Sleep quality and overnight HRV both softened slightly. Your other three pillars are stable.",
    },
    {
      label: "Top recommendation",
      before: "Liver Driver",
      after: "Kidney Driver",
      afterTone: "primary",
    },
  ],
  why: {
    lead: "Voice resonance picked up stronger kidney patterns this week, and overnight HRV softened — both point toward your nervous system asking for more recovery support.",
    reassurance: "The Liver Driver signal hasn't gone away — it's still your #2 this week.",
  },
  recs: [
    { rank: 1, before: "Liver Driver", after: "Kidney Driver", moved: "new-top" },
    { rank: 2, before: "Kidney Driver", after: "Liver Driver", moved: "demoted" },
    { rank: 3, before: "Stress Adapt", after: "Stress Adapt", moved: "stable" },
    { rank: 4, before: "Cell Charge", after: "Cell Charge", moved: "stable" },
    { rank: 5, before: "Field Reset", after: "Field Reset", moved: "stable" },
  ],
  coachPrompt: "Why did Kidney Driver overtake Liver?",
};

function toneText(t?: Tone) {
  switch (t) {
    case "success":
      return "text-success";
    case "warning":
      return "text-warning";
    case "destructive":
      return "text-destructive";
    case "primary":
      return "text-primary font-medium";
    default:
      return "text-foreground";
  }
}

function magnitudeMeta(m: Magnitude) {
  if (m === "acute")
    return { label: "ACUTE FLAG", pill: "bg-destructive text-destructive-foreground", bar: "bg-destructive", idx: 2 };
  if (m === "notable")
    return { label: "NOTABLE", pill: "bg-warning text-warning-foreground", bar: "bg-warning", idx: 1 };
  return { label: "ROUTINE", pill: "bg-success text-success-foreground", bar: "bg-success", idx: 0 };
}

function SectionHeader({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
        {label}
      </span>
      {action}
    </div>
  );
}

const NotableShift = () => {
  const navigate = useNavigate();
  const meta = magnitudeMeta(SHIFT.magnitude);
  const segLabels: { key: Magnitude; label: string }[] = [
    { key: "routine", label: "Routine" },
    { key: "notable", label: "Notable" },
    { key: "acute", label: "Acute flag" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />

      {/* Back nav bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground active:scale-[0.96] transition-transform"
            aria-label="Back to Latest scan"
          >
            <ChevronLeft className="w-4 h-4" />
            Latest scan
          </button>
          <span className="text-sm font-semibold">Notable shift</span>
          <button
            className="text-muted-foreground active:scale-[0.96] transition-transform"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Headline */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            {SHIFT.eyebrow}
          </div>
          <h1 className="font-display text-[28px] font-medium leading-tight">
            {SHIFT.headline}
          </h1>
        </div>

        {/* Shift magnitude */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
              Shift magnitude
            </span>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${meta.pill}`}>
              {meta.label}
            </span>
          </div>
          <div
            role="img"
            aria-label={`Shift magnitude: ${SHIFT.magnitude}`}
            className="grid grid-cols-3 gap-1 mb-2"
          >
            {segLabels.map((s, i) => (
              <div
                key={s.key}
                className={`h-2 rounded-full ${i === meta.idx ? meta.bar : `${meta.bar}/15`}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1 mb-3">
            {segLabels.map((s, i) => (
              <span
                key={s.key}
                className={`text-[10px] ${
                  i === meta.idx ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {SHIFT.magnitudeCopy}
          </p>
        </div>

        {/* What changed */}
        <div>
          <SectionHeader label="What changed" />
          <div className="glass-card divide-y divide-border overflow-hidden">
            {SHIFT.diff.map((row) => (
              <div key={row.label} className="p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  {row.label}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">
                      Wk 5
                    </div>
                    <div className="font-display text-lg text-foreground/60">{row.before}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">
                      Wk 6
                    </div>
                    <div className={`font-display text-lg ${toneText(row.afterTone)}`}>
                      {row.after}
                    </div>
                  </div>
                </div>
                {row.note && (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{row.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Why this happened */}
        <div>
          <SectionHeader label="Why this happened" />
          <div className="glass-card p-4 flex gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-2 text-sm leading-relaxed">
              <p className="text-muted-foreground">{SHIFT.why.lead}</p>
              <p className="text-foreground">{SHIFT.why.reassurance}</p>
            </div>
          </div>
        </div>

        {/* Recommendations comparison */}
        <div>
          <SectionHeader
            label="Recommendations · Week 5 → Week 6"
            action={
              <button
                onClick={() => navigate("/dashboard")}
                className="text-xs text-primary active:scale-[0.96] transition-transform"
              >
                Latest scan ›
              </button>
            }
          />
          <div className="glass-card divide-y divide-border overflow-hidden">
            {SHIFT.recs.map((r) => {
              const isNewTop = r.moved === "new-top";
              const isStable = r.moved === "stable";
              return (
                <div key={r.rank} className="p-3 flex items-center gap-3">
                  <span className="font-display text-sm text-muted-foreground w-6">
                    #{r.rank}
                  </span>
                  <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-w-0">
                    <span className="text-sm text-muted-foreground truncate">{r.before}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span
                      className={`text-sm truncate ${
                        isNewTop
                          ? "text-foreground font-medium"
                          : isStable
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {r.after}
                    </span>
                  </div>
                  {isNewTop && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                      New #1
                    </span>
                  )}
                  {r.moved === "demoted" && (
                    <span className="text-muted-foreground text-xs" aria-label="Demoted">
                      ↓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coach prompt */}
        <button
          onClick={() => navigate("/ai-coach?context=notable-shift-week-6")}
          className="glass-card p-4 w-full flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
          aria-label={`Ask coach: ${SHIFT.coachPrompt}`}
        >
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              Ask Coach
            </div>
            <div className="text-sm text-foreground">{SHIFT.coachPrompt}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default NotableShift;
