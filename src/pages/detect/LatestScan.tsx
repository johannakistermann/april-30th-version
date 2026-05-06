import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

type Zone = "green" | "amber" | "red";

const zoneText: Record<Zone, string> = {
  green: "text-success",
  amber: "text-warning",
  red: "text-destructive",
};
const zoneStroke: Record<Zone, string> = {
  green: "hsl(var(--success))",
  amber: "hsl(var(--warning))",
  red: "hsl(var(--destructive))",
};

const SectionHeader = ({
  label,
  action,
  onAction,
}: {
  label: string;
  action?: string;
  onAction?: () => void;
}) => (
  <div className="flex items-center justify-between mb-2 px-1">
    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
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
        <span className="text-xs text-muted-foreground">{action} ›</span>
      ))}
  </div>
);

const VitalityGauge = ({ score, zone }: { score: number; zone: Zone }) => {
  const r = 36;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div className="relative w-24 h-24 flex flex-col items-center justify-center">
      <svg viewBox="0 0 88 88" className="w-24 h-24 -rotate-90">
        <circle cx="44" cy="44" r={r} stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
        <circle
          cx="44"
          cy="44"
          r={r}
          stroke={zoneStroke[zone]}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-display font-bold ${zoneText[zone]}`}>{score}</span>
        <span className={`text-[10px] uppercase tracking-wider ${zoneText[zone]}`}>
          {zone === "green" ? "Green" : zone === "amber" ? "Amber" : "Red"}
        </span>
      </div>
    </div>
  );
};

const captureModalities: { label: string; ok: boolean }[] = [
  { label: "Voice", ok: true },
  { label: "Breath", ok: true },
  { label: "Face", ok: true },
  { label: "Tongue", ok: false },
  { label: "GEM", ok: true },
];

type Pillar = {
  id: string;
  name: string;
  score: number;
  zone: Zone;
  delta: number;
};
const pillars: Pillar[] = [
  { id: "energy", name: "Energy", score: 75, zone: "green", delta: 2 },
  { id: "recovery", name: "Recovery", score: 70, zone: "amber", delta: -3 },
  { id: "stress-nervous", name: "Stress & NS", score: 65, zone: "amber", delta: 2 },
  { id: "control", name: "Control", score: 68, zone: "amber", delta: -1 },
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

const LatestScan = () => {
  const navigate = useNavigate();
  const warned = captureModalities.find((m) => !m.ok);

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">

      {/* Back nav bar */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground active:scale-[0.96] transition-transform"
          aria-label="Back to Detect"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Detect</span>
        </button>
        <h1 className="text-base font-display font-medium">Latest scan</h1>
        <button
          className="w-8 h-8 flex items-center justify-center text-muted-foreground active:scale-[0.96] transition-transform"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Page header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-display font-medium">Week 6</h2>
          <span className="text-xs text-muted-foreground">Sun 3 May · 9:42 AM</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Captured 17 min ago · baseline locked</p>
      </div>

      {/* Section 1 — Capture quality */}
      <section className="px-6 mb-5">
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
          <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2">
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <span>{warned.label} lighting was uneven</span>
            </div>
            <button
              onClick={() => navigate("/scan/retake/tongue")}
              className="text-xs text-warning font-medium active:scale-[0.96] transition-transform"
            >
              Retake ›
            </button>
          </div>
        )}
      </section>

      {/* Section 2 — Vitality */}
      <section className="px-6 mb-5">
        <SectionHeader label="Vitality" action="Breakdown" onAction={() => navigate("/detect/latest/vitality")} />
        <div
          role="button"
          tabIndex={0}
          aria-label="Open Vitality breakdown — score 62, amber"
          onClick={() => navigate("/detect/latest/vitality")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/detect/latest/vitality")}
          className="glass-card p-4 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
        >
          <VitalityGauge score={62} zone="amber" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Vitality Score</p>
            <p className="text-sm text-success font-medium mt-0.5">▲ +5 vs week 5</p>
            <p className="text-[11px] text-muted-foreground italic mt-2">
              Voltage × Resistance Efficiency
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </section>

      {/* Section 3 — Pillars */}
      <section className="px-6 mb-5">
        <SectionHeader label="Pillars" action="Tap any pillar" />
        <div className="grid grid-cols-2 gap-3">
          {pillars.map((p) => {
            const positive = p.delta >= 0;
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`${p.name} pillar — score ${p.score}, ${p.zone}, delta ${p.delta}`}
                onClick={() => navigate(`/detect/pillar/${p.id}`)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && navigate(`/detect/pillar/${p.id}`)
                }
                className="glass-card p-3 relative active:scale-[0.98] transition-transform cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground absolute top-2 right-2" />
                <div className="flex items-center justify-between pr-4">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className={`text-lg font-display font-bold ${zoneText[p.zone]}`}>
                    {p.score}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-muted-foreground capitalize">{p.zone}</span>
                  <span
                    className={`text-xs font-medium ${
                      positive ? "text-success" : "text-destructive"
                    }`}
                  >
                    {positive ? "▲" : "▼"} {positive ? "+" : ""}
                    {p.delta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4 — Notable shift */}
      <section className="px-6 mb-5">
        <div
          role="button"
          tabIndex={0}
          aria-label="Open notable shift detail"
          onClick={() => navigate("/detect/latest/notable-shift")}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && navigate("/detect/latest/notable-shift")
          }
          className="glass-card p-4 border-primary/30 bg-primary/5 active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-primary font-medium">
              Notable shift
            </span>
            <span className="text-xs text-primary">More ›</span>
          </div>
          <p className="text-sm leading-relaxed">
            Recovery dipped 3 points and Liver moved out of your top recommendation — Kidney Driver
            took its place.
          </p>
        </div>
      </section>

      {/* Section 5 — Your 5 Infoceuticals */}
      <section className="px-6 mb-5">
        <SectionHeader label="Your 5 Infoceuticals" action="Tap any rec" />
        <div className="space-y-2">
          {recs.map((r, idx) => (
            <div
              key={r.id}
              role="button"
              tabIndex={0}
              aria-label={`Open ${r.name} recommendation detail`}
              onClick={() => navigate(`/detect/rec/${r.id}`)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && navigate(`/detect/rec/${r.id}`)
              }
              className="glass-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
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
            </div>
          ))}
        </div>
      </section>

      {/* Section 6 — Quick actions */}
      <section className="px-6 mb-5">
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
      </section>

      {/* Section 7 — Coach prompt */}
      <section className="px-6 mb-4">
        <div
          role="button"
          tabIndex={0}
          aria-label="Ask Coach about this scan"
          onClick={() => navigate("/ai-coach?context=scan-week-6")}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && navigate("/ai-coach?context=scan-week-6")
          }
          className="glass-card p-3 border-primary/20 bg-primary/5 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm flex-1">Ask Coach about this scan</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default LatestScan;
