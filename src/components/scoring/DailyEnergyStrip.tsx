import type { DailyEnergyPattern } from "@/lib/scoring";

interface Props {
  pattern: DailyEnergyPattern;
  compact?: boolean;
  showLegend?: boolean;
}

const COLORS: Record<string, string> = {
  "flow": "bg-success",
  "fired-up": "bg-warning",
  "recovering": "bg-info",
};

export default function DailyEnergyStrip({ pattern, compact = false, showLegend = true }: Props) {
  if (!pattern.states.length) {
    return (
      <div className="space-y-2">
        <div className="h-3 rounded-md bg-muted/40 border border-dashed border-muted-foreground/20" />
        <p className="text-[10px] text-muted-foreground text-center">Connect GEM to unlock 24h Body State pattern</p>
      </div>
    );
  }
  const tickH = compact ? "h-2" : "h-3";
  return (
    <div className="space-y-2">
      <div className={`flex w-full ${tickH} rounded-md overflow-hidden gap-px bg-background/40`}>
        {pattern.states.map((s, i) => (
          <div key={i} className={`flex-1 ${COLORS[s]}`} />
        ))}
      </div>
      {!compact && (
        <div className="flex justify-between text-[9px] text-muted-foreground font-display">
          <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>12am</span>
        </div>
      )}
      {showLegend && (
        <div className="flex items-center justify-between text-[10px] font-display">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-warning" />
            <span className="text-muted-foreground">Fired Up</span>
            <span className="font-semibold text-foreground">{pattern.firedUpPct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-success" />
            <span className="text-muted-foreground">Flow</span>
            <span className="font-semibold text-foreground">{pattern.flowPct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-info" />
            <span className="text-muted-foreground">Recovering</span>
            <span className="font-semibold text-foreground">{pattern.recoveringPct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
