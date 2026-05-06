import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, ChevronRight, MessageSquare, TrendingUp } from "lucide-react";

const TEAL = "hsl(var(--success))";
const PURPLE = "hsl(270 60% 70%)";
const AMBER = "hsl(var(--warning))";

const data = {
  week: 6,
  vitality: 62,
  zone: "AMBER",
  delta: 5,
  voltage: 73,
  efficiency: 85,
  pillars: {
    energy: { label: "Energy", subtitle: "Cellular vitality, daily energy pattern, vascular", score: 75, zone: "green" as const, route: "/detect/pillar/energy" },
    recovery: { label: "Recovery", subtitle: "Sleep, overnight HRV, mitochondrial restoration", score: 70, zone: "amber" as const, route: "/detect/pillar/recovery" },
    stress: { label: "Stress & NS", subtitle: "Autonomic balance, allostatic load, nervous system", score: 65, zone: "amber" as const, route: "/detect/pillar/stress-nervous" },
    detox: { label: "Detox & elimination", subtitle: "From your Bioenergetic Priorities", score: 58, zone: "amber" as const, route: "/detect/pillar/control?cluster=detox" },
  },
  trend: {
    weeks: ["W1", "W2", "W3", "W4", "W5", "W6"],
    vitality:    [55, 58, 60, 57, 57, 62],
    voltage:     [65, 67, 70, 70, 71, 73],
    efficiency:  [80, 82, 83, 81, 80, 85],
  },
};

const zoneClass = (z: "green" | "amber" | "red") =>
  z === "green" ? "text-success" : z === "amber" ? "text-warning" : "text-destructive";

const Circle = ({ value, color, label }: { value: string; color: string; label: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center border-2"
      style={{ borderColor: color, color, background: `${color.replace(")", " / 0.08)").replace("hsl(", "hsl(")}` }}
    >
      <span className="text-base font-display font-semibold">{value}</span>
    </div>
    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
  </div>
);

const PillarRow = ({
  label, subtitle, score, zone, onClick,
}: { label: string; subtitle: string; score: number; zone: "green" | "amber" | "red"; onClick: () => void }) => (
  <button
    onClick={onClick}
    role="button"
    tabIndex={0}
    aria-label={`${label} pillar, score ${score}, open detail`}
    className="w-full glass-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-left hover:border-primary/30"
  >
    <div className="flex-1 min-w-0">
      <p className="text-sm font-display font-medium">{label}</p>
      <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
    </div>
    <span className={`text-base font-display font-semibold ${zoneClass(zone)}`}>{score}</span>
    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
  </button>
);

const TrendChart = () => {
  const W = 320, H = 140, PAD_L = 24, PAD_R = 12, PAD_T = 12, PAD_B = 22;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const yMin = 40, yMax = 100;
  const x = (i: number) => PAD_L + (innerW * i) / (data.trend.weeks.length - 1);
  const y = (v: number) => PAD_T + innerH * (1 - (v - yMin) / (yMax - yMin));
  const path = (vals: number[]) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* gridlines */}
      {[50, 75, 100].map((g) => (
        <line key={g} x1={PAD_L} x2={W - PAD_R} y1={y(g)} y2={y(g)} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2 3" />
      ))}
      {/* lines */}
      <path d={path(data.trend.voltage)} fill="none" stroke={TEAL} strokeWidth={1.5} opacity={0.7} />
      <path d={path(data.trend.efficiency)} fill="none" stroke={PURPLE} strokeWidth={1.5} strokeDasharray="4 3" />
      <path d={path(data.trend.vitality)} fill="none" stroke={AMBER} strokeWidth={2.5} />
      {/* current week marker on vitality */}
      <circle cx={x(data.trend.weeks.length - 1)} cy={y(data.trend.vitality.at(-1)!)} r={4} fill={AMBER} stroke="hsl(var(--background))" strokeWidth={1.5} />
      {/* x labels */}
      {data.trend.weeks.map((w, i) => (
        <text key={w} x={x(i)} y={H - 6} fontSize={9} fill="hsl(var(--muted-foreground))" textAnchor="middle">{w}</text>
      ))}
    </svg>
  );
};

const VitalityBreakdown = () => {
  const navigate = useNavigate();
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/detect/latest"));

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Top nav */}
        <div className="px-5 pt-12 pb-3 flex items-center justify-between">
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" aria-label="Back to latest scan">
            <ArrowLeft className="w-4 h-4" />
            <span>Latest scan</span>
          </button>
          <h1 className="text-sm font-display font-semibold absolute left-1/2 -translate-x-1/2">Vitality breakdown</h1>
          <button className="w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center" aria-label="More options">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Vitality score · Week {data.week}</p>
          <div className="flex items-end justify-between mt-2 gap-3">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-display font-bold">{data.vitality}</span>
              <span className="text-xs font-display font-semibold text-warning tracking-wide">{data.zone}</span>
            </div>
            <span className="text-xs font-display font-medium text-success">▲ +{data.delta} vs week {data.week - 1}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-3">
            Your Vitality reflects two things: how much energy your body produces and stores (Voltage), and how efficiently it manages everything in its way (Resistance Efficiency).
          </p>
        </div>

        {/* Section 1 — formula */}
        <div className="px-5 mb-4">
          <div className="glass-card p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium text-center mb-4">How it's computed</p>
            <div className="flex items-center justify-center gap-2">
              <Circle value={String(data.voltage)} color={TEAL} label="Voltage" />
              <span className="text-xl font-display text-muted-foreground pb-5">×</span>
              <Circle value={`${data.efficiency}%`} color={PURPLE} label="Efficiency" />
              <span className="text-xl font-display text-muted-foreground pb-5">=</span>
              <Circle value={String(data.vitality)} color={AMBER} label="Vitality" />
            </div>
          </div>
        </div>

        {/* Section 2 — Voltage */}
        <div className="px-5 mb-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: TEAL }} />
                <h2 className="text-sm font-display font-medium">Voltage</h2>
              </div>
              <span className="text-2xl font-display font-medium" style={{ color: TEAL }}>{data.voltage}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              How much energy your body is producing and storing — your fuel and your repair capacity.
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Fed by 2 pillars</p>
            <div className="space-y-2">
              <PillarRow {...data.pillars.energy} onClick={() => navigate(data.pillars.energy.route)} />
              <PillarRow {...data.pillars.recovery} onClick={() => navigate(data.pillars.recovery.route)} />
            </div>
          </div>
        </div>

        {/* Section 3 — Resistance Efficiency */}
        <div className="px-5 mb-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: PURPLE }} />
                <h2 className="text-sm font-display font-medium">Resistance Efficiency</h2>
              </div>
              <span className="text-2xl font-display font-medium" style={{ color: PURPLE }}>{data.efficiency}%</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              How well your body manages stress, regulates itself, and clears what it doesn't need — the friction it isn't fighting.
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Fed by 2 pillars</p>
            <div className="space-y-2">
              <PillarRow {...data.pillars.stress} onClick={() => navigate(data.pillars.stress.route)} />
              <PillarRow {...data.pillars.detox} onClick={() => navigate(data.pillars.detox.route)} />
            </div>
          </div>
        </div>

        {/* Section 4 — 6-week trend */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">6-week trend</p>
            <button
              onClick={() => navigate("/detect/trends?series=vitality,voltage,efficiency")}
              className="text-xs text-primary hover:underline flex items-center gap-1"
              aria-label="Open in Trends"
            >
              Open in Trends <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="glass-card p-3">
            <TrendChart />
            <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5" style={{ background: AMBER, height: 2.5 }} />
                <span className="text-[10px] text-muted-foreground">Vitality</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-px" style={{ background: TEAL, opacity: 0.7 }} />
                <span className="text-[10px] text-muted-foreground">Voltage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="2"><line x1="0" y1="1" x2="12" y2="1" stroke={PURPLE} strokeDasharray="3 2" /></svg>
                <span className="text-[10px] text-muted-foreground">Efficiency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 — auto insight */}
        <div className="px-5 mb-4">
          <div className="glass-card p-4 border-success/30" style={{ background: "hsl(var(--success) / 0.06)" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp className="w-4 h-4" style={{ color: TEAL }} />
              <p className="text-sm font-display font-semibold">What's driving this week's score</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your Voltage rose to {data.voltage} (Energy is strong, Recovery softened), and your Resistance Efficiency stayed steady at {data.efficiency}%. The Recovery dip is worth watching but didn't outweigh Energy gains — net Vitality up {data.delta} points.
            </p>
          </div>
        </div>

        {/* Section 6 — Coach prompt */}
        <div className="px-5">
          <button
            onClick={() => navigate("/ai-coach?context=vitality-breakdown")}
            role="button"
            tabIndex={0}
            aria-label="Ask Coach about Voltage or Efficiency"
            className="w-full glass-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-left hover:border-primary/30"
            style={{ background: "hsl(var(--info) / 0.08)" }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--info) / 0.18)" }}>
              <MessageSquare className="w-4 h-4" style={{ color: "hsl(var(--info))" }} />
            </div>
            <span className="flex-1 text-sm font-display font-medium">Ask Coach about Voltage or Efficiency</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VitalityBreakdown;
