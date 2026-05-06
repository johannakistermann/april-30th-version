import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Scan,
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
} from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

type Zone = "success" | "warning" | "destructive";

const PILLARS: {
  id: string;
  name: string;
  score: number;
  zone: Zone;
  spark: number[];
  route: string;
}[] = [
  { id: "energy", name: "Energy", score: 75, zone: "success", spark: [55, 58, 62, 66, 70, 75], route: "/detect/pillar/energy" },
  { id: "recovery", name: "Recovery", score: 70, zone: "warning", spark: [60, 65, 72, 76, 73, 70], route: "/detect/pillar/recovery" },
  { id: "stress-nervous", name: "Stress & NS", score: 65, zone: "warning", spark: [50, 52, 55, 58, 62, 65], route: "/detect/pillar/stress-nervous" },
  { id: "control", name: "Control", score: 68, zone: "warning", spark: [60, 64, 70, 73, 71, 68], route: "/detect/pillar/control" },
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

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-display font-bold">Detect</h1>
        <p className="text-sm text-muted-foreground mt-1">Tap any card below to dig in</p>
      </div>

      {/* Section 1 — Next scan */}
      <div className="px-6 mb-5">
        <div className="glass-card p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
            Next scan in 4 days
          </p>
          <p className="text-lg font-display font-semibold mt-1">Sunday, 10 May</p>
          <p className="text-xs text-muted-foreground mt-0.5">Last scanned 17 minutes ago</p>
          <button
            onClick={() => navigate("/scan")}
            className="mt-3 w-full bg-primary text-primary-foreground font-display font-medium text-sm py-3 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Scan className="w-4 h-4" />
            Start scan
          </button>
        </div>
      </div>

      {/* Section 2 — Latest scan hero */}
      <div className="px-6 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-2">
          Your latest scan
        </p>
        <button
          role="button"
          tabIndex={0}
          aria-label="Your latest scan, Vitality 62 Amber, opens full scan detail"
          onClick={() => navigate("/detect/latest")}
          className="glass-card p-5 w-full text-left border-primary/40 glow-primary relative active:scale-[0.98] transition-all"
        >
          <span className="absolute top-3 right-3 text-[9px] font-display font-bold tracking-wider text-primary bg-primary/15 px-2 py-1 rounded-full">
            TAP TO OPEN
          </span>

          <div className="flex items-center gap-5">
            {/* Vitality gauge */}
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
              <p className="text-[10px] text-muted-foreground font-display">Week 6 · Sunday</p>
              <p className="text-sm font-display font-semibold mt-0.5">Vitality Score</p>
              <p className="text-xs text-success font-display font-medium mt-0.5">▲ +5 vs last week</p>
            </div>
          </div>

          <p className="text-xs text-foreground/90 mt-4 leading-relaxed">
            <span className="font-display font-bold">Notable shift:</span> Recovery dipped 3 points · top rec changed Liver → Kidney
          </p>

          <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Opens</span>
            {["capture quality", "all 5 recs", "retakes"].map((c) => (
              <span key={c} className="text-[10px] bg-muted/40 text-foreground/80 px-2 py-0.5 rounded-full font-display">
                {c}
              </span>
            ))}
          </div>
        </button>
      </div>

      {/* Section 3 — Explore by pillar */}
      <div className="px-6 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
          Explore by pillar
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Tap any pillar for trends, witnesses, related recs ›
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PILLARS.map((p) => {
            const Icon = p.id === "energy" ? Zap : p.id === "recovery" ? Heart : p.id === "stress-nervous" ? Brain : Gauge;
            return (
              <button
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`${p.name} pillar, score ${p.score} ${p.zone === "success" ? "Green" : "Amber"}, opens ${p.name} detail`}
                onClick={() => navigate(p.route)}
                className={`glass-card p-4 text-left border-${p.zone}/20 hover:border-${p.zone}/40 active:scale-[0.98] transition-all relative`}
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground absolute top-3 right-3" />
                <div className={`w-7 h-7 rounded-lg bg-${p.zone}/10 flex items-center justify-center mb-2`}>
                  <Icon className={`w-3.5 h-3.5 text-${p.zone}`} />
                </div>
                <p className="text-xs font-display font-medium text-muted-foreground">{p.name}</p>
                <p className={`text-2xl font-display font-bold text-${p.zone} mt-0.5`}>{p.score}</p>
                <div className="mt-2">
                  <Sparkline values={p.spark} zone={p.zone} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4 — Explore over time */}
      <div className="px-6 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-3">
          Explore over time
        </p>
        <div className="space-y-2">
          {[
            { icon: LineChart, title: "Trends", subtitle: "Vitality + 4 pillar lines · 6 weeks", route: "/detect/trends" },
            { icon: History, title: "Scan history", subtitle: "All 6 scans · diff view · acute flags", route: "/detect/history" },
            { icon: LayoutGrid, title: "Recommendation archive", subtitle: "What you've been recommended · why", route: "/detect/recs" },
          ].map((row) => (
            <button
              key={row.title}
              role="button"
              tabIndex={0}
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

      {/* Section 5 — Capture quality */}
      <div className="px-6 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-3">
          Capture quality
        </p>
        <div className="space-y-2">
          <button
            role="button"
            tabIndex={0}
            aria-label="Last capture has 1 warning, tongue lighting flagged, opens retake flow"
            onClick={() => navigate("/detect/capture/tongue-retake")}
            className="glass-card p-4 w-full flex items-center gap-3 text-left border-warning/40 hover:border-warning/60 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-display font-semibold">Last capture</p>
                <span className="text-[9px] font-display font-bold tracking-wider text-warning bg-warning/15 px-1.5 py-0.5 rounded-full">
                  1 WARN
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tongue lighting flagged · retake or improve</p>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-display font-medium text-warning bg-warning/15 rounded-full px-2.5 py-1">
              Fix
              <ChevronRight className="w-3 h-3" />
            </span>
          </button>

          <button
            role="button"
            tabIndex={0}
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
      </div>

      {/* Section 6 — Coach prompt */}
      <div className="px-6 mb-6">
        <button
          role="button"
          tabIndex={0}
          aria-label="Ask Coach about any of the above, opens AI Coach"
          onClick={() => navigate("/ai-coach")}
          className="w-full p-3 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-3 text-left hover:bg-primary/10 active:scale-[0.98] transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <p className="flex-1 text-xs font-display font-medium">Ask Coach about any of the above</p>
          <ActionPill label="Ask" />
        </button>
      </div>

      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
