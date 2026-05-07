import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Zap,
  Heart,
  Brain,
  Gauge,
  LineChart,
  History,
  LayoutGrid,
  AlertTriangle,
  GraduationCap,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

type Zone = "success" | "warning" | "destructive";

const PILLARS: {
  id: string;
  name: string;
  score: number;
  zone: Zone;
  delta: number;
  spark: number[];
  route: string;
}[] = [
  { id: "energy", name: "Energy", score: 75, zone: "success", delta: 2, spark: [55, 58, 62, 66, 70, 75], route: "/detect/pillar/energy" },
  { id: "recovery", name: "Recovery", score: 70, zone: "warning", delta: -3, spark: [60, 65, 72, 76, 73, 70], route: "/detect/pillar/recovery" },
  { id: "stress-nervous", name: "Stress & NS", score: 65, zone: "warning", delta: 2, spark: [50, 52, 55, 58, 62, 65], route: "/detect/pillar/stress-nervous" },
  { id: "control", name: "Control", score: 68, zone: "warning", delta: -1, spark: [60, 64, 70, 73, 71, 68], route: "/detect/pillar/control" },
];

const captureModalities: { label: string; ok: boolean }[] = [
  { label: "Voice", ok: true },
  { label: "Breath", ok: true },
  { label: "Face", ok: true },
  { label: "Tongue", ok: false },
  { label: "GEM", ok: true },
];

type Rec = {
  id: string;
  name: string;
  witness: string;
  confidence: "High" | "Medium";
};
const recs: Rec[] = [
  { id: "kidney-driver", name: "Kidney Driver", witness: "Voice + face corroborated · new this week", confidence: "High" },
  { id: "liver-driver", name: "Liver Driver", witness: "Voice + tongue + face flagged · was #1", confidence: "High" },
  { id: "emotional-stress-relief", name: "Emotional stress relief", witness: "Voice + HRV signals", confidence: "Medium" },
  { id: "heart-meridian", name: "Heart meridian", witness: "Voice patterns this week", confidence: "Medium" },
  { id: "stomach-driver", name: "Stomach Driver", witness: "Tongue + voice signals", confidence: "Medium" },
];

function Sparkline({ values, zone }: { values: number[]; zone: Zone }) {
  const w = 80;
  const h = 24;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        fill="none"
        stroke={`hsl(var(--${zone}))`}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

function ActionPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-display font-medium text-primary bg-primary/10 rounded-full px-2.5 py-1">
      {label}
      <ChevronRight className="w-3 h-3" />
    </span>
  );
}

function SectionHeader({
  label,
  action,
  onAction,
}: {
  label: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
        {label}
      </span>
      {action &&
        (onAction ? (
          <button
            onClick={onAction}
            className="text-xs text-primary active:scale-[0.96] transition-transform"
          >
            {action} ›
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">{action}</span>
        ))}
    </div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const warned = captureModalities.find((m) => !m.ok);

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-display font-bold">Detect</h1>
          <span className="text-xs text-muted-foreground">Week 6 · Sun 3 May · 9:42 AM</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Captured 17 min ago · baseline locked</p>
      </div>

      {/* Section 1 — Vitality hero */}
      <div className="px-6 mb-5">
        <button
          aria-label="Open Vitality breakdown — score 62 Amber"
          onClick={() => navigate("/detect/latest/vitality")}
          className="glass-card p-5 w-full text-left border-primary/40 glow-primary relative active:scale-[0.98] transition-all"
        >
          <span className="absolute top-3 right-3 text-[9px] font-display font-bold tracking-wider text-primary bg-primary/15 px-2 py-1 rounded-full">
            BREAKDOWN
          </span>

          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--warning))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.62)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-bold text-warning leading-none">62</span>
                <span className="text-[9px] text-warning font-display">Amber</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-semibold">Vitality Score</p>
              <p className="text-xs text-success font-display font-medium mt-0.5">▲ +5 vs last week</p>
              <p className="text-[10px] text-muted-foreground italic mt-1.5">
                Information × Voltage / Resistance
              </p>
            </div>
          </div>
        </button>

        {/* Notable shift */}
        <button
          aria-label="Open notable shift detail"
          onClick={() => navigate("/detect/latest/notable-shift")}
          className="glass-card p-3 w-full text-left mt-2 border-primary/30 bg-primary/5 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-primary font-display font-medium">
              Notable shift
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-xs leading-relaxed">
            Recovery dipped 3 points · top rec changed Liver → Kidney.
          </p>
        </button>
      </div>

      {/* Section 2 — Capture quality */}
      <div className="px-6 mb-5">
        <SectionHeader label="Capture quality" action="Details" onAction={() => navigate("/detect/latest/capture")} />
        <div className="grid grid-cols-5 gap-2">
          {captureModalities.map((m) => (
            <div
              key={m.label}
              className={`glass-card p-2 flex flex-col items-center gap-1 ${
                m.ok ? "" : "border-warning/40 bg-warning/5"
              }`}
            >
              {m.ok ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning" />
              )}
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
        {warned && (
          <button
            onClick={() => navigate("/scan/retake/tongue")}
            aria-label={`${warned.label} lighting flagged, retake`}
            className="mt-2 w-full flex items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <span>{warned.label} lighting was uneven</span>
            </div>
            <span className="text-xs text-warning font-medium">Retake ›</span>
          </button>
        )}
      </div>

      {/* Section 3 — Explore by pillar */}
      <div className="px-6 mb-5">
        <SectionHeader label="Explore by pillar" action="Tap any pillar" />
        <div className="grid grid-cols-2 gap-3">
          {PILLARS.map((p) => {
            const Icon = p.id === "energy" ? Zap : p.id === "recovery" ? Heart : p.id === "stress-nervous" ? Brain : Gauge;
            const positive = p.delta >= 0;
            return (
              <button
                key={p.id}
                aria-label={`${p.name} pillar, score ${p.score}, delta ${p.delta}, opens ${p.name} detail`}
                onClick={() => navigate(p.route)}
                className={`glass-card p-4 text-left border-${p.zone}/20 hover:border-${p.zone}/40 active:scale-[0.98] transition-all relative`}
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground absolute top-3 right-3" />
                <div className={`w-7 h-7 rounded-lg bg-${p.zone}/10 flex items-center justify-center mb-2`}>
                  <Icon className={`w-3.5 h-3.5 text-${p.zone}`} />
                </div>
                <p className="text-xs font-display font-medium text-muted-foreground">{p.name}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className={`text-2xl font-display font-bold text-${p.zone}`}>{p.score}</p>
                  <span className={`text-[11px] font-medium ${positive ? "text-success" : "text-destructive"}`}>
                    {positive ? "▲ +" : "▼ "}{p.delta}
                  </span>
                </div>
                <div className="mt-2">
                  <Sparkline values={p.spark} zone={p.zone} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4 — Your 5 Infoceuticals */}
      <div className="px-6 mb-5">
        <SectionHeader label="Your 5 Infoceuticals" action="Tap any rec" />
        <div className="space-y-2">
          {recs.map((r, idx) => (
            <button
              key={r.id}
              aria-label={`Open ${r.name} recommendation detail`}
              onClick={() => navigate(`/detect/rec/${r.id}`)}
              className="glass-card p-3 w-full flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <span className="text-sm text-muted-foreground font-display w-5 shrink-0">
                {idx + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{r.witness}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
                  r.confidence === "High"
                    ? "bg-success/15 text-success"
                    : "bg-warning/15 text-warning"
                }`}
              >
                {r.confidence}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Section 5 — Explore over time */}
      <div className="px-6 mb-5">
        <SectionHeader label="Explore over time" />
        <div className="space-y-2">
          {[
            { icon: LineChart, title: "Trends", subtitle: "Vitality + 4 pillar lines · 6 weeks", route: "/detect/trends" },
            { icon: History, title: "Scan history", subtitle: "All 6 scans · diff view · acute flags", route: "/detect/history" },
            { icon: LayoutGrid, title: "Recommendation archive", subtitle: "What you've been recommended · why", route: "/detect/recs" },
          ].map((row) => (
            <button
              key={row.title}
              aria-label={`${row.title}, opens ${row.title} screen`}
              onClick={() => navigate(row.route)}
              className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/30 active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center flex-shrink-0">
                <row.icon className="w-4 h-4 text-foreground/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-semibold">{row.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{row.subtitle}</p>
              </div>
              <ActionPill label="Open" />
            </button>
          ))}
        </div>
      </div>

      {/* Section 6 — Quick actions */}
      <div className="px-6 mb-5">
        <SectionHeader label="Quick actions" />
        <div className="glass-card divide-y divide-border overflow-hidden">
          {[
            { label: "Compare to last week", to: "/detect/history/diff" },
            { label: "View on Trends chart", to: "/detect/trends?highlight=current" },
            { label: "Share with practitioner", to: "/share/scan/current" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.to)}
              aria-label={a.label}
              className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-muted/30 transition-colors"
            >
              <span className="text-sm">{a.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Section 7 — Practice & tutorials */}
      <div className="px-6 mb-5">
        <button
          aria-label="Practice and tutorials, opens tutorials screen"
          onClick={() => navigate("/detect/practice")}
          className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/30 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-foreground/80" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-semibold">Practice & tutorials</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Get cleaner captures · 5 modality guides</p>
          </div>
          <ActionPill label="Open" />
        </button>
      </div>

      {/* Section 8 — Coach prompt */}
      <div className="px-6 mb-6">
        <button
          aria-label="Ask Coach about this scan, opens AI Coach"
          onClick={() => navigate("/ai-coach?context=scan-week-6")}
          className="w-full p-3 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-3 text-left hover:bg-primary/10 active:scale-[0.98] transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <p className="flex-1 text-xs font-display font-medium">Ask Coach about this scan</p>
          <ActionPill label="Ask" />
        </button>
      </div>

      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
