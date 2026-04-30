// Bottom sheet showing live mock hardware session details.
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMockHardware } from "@/lib/hardware/mockHardware";
import { Battery, Signal, StopCircle, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const SessionSheet = ({ open, onOpenChange }: Props) => {
  const { session, remainingMs, progressPct, battery, signal, stopSession } = useMockHardware();

  if (!session) return null;

  const deviceLabel = session.device === "gem" ? "GEM" : "miHealth";
  const isCompleted = session.status === "completed";
  const statusLabel =
    session.status === "connecting" ? "Connecting…" :
    session.status === "broadcasting" ? "Broadcasting" :
    "Completed";

  // ring math
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progressPct / 100);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            {deviceLabel} Session
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-8 space-y-5">
          {/* Device telemetry */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Battery className="w-4 h-4" />
              <span>{battery}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Signal className="w-4 h-4" />
              <span>{signal}/4</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-display font-medium ${
              isCompleted ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
            }`}>
              {statusLabel}
            </span>
          </div>

          {/* Progress ring */}
          <div className="flex items-center justify-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="70" cy="70" r={r} fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-bold tabular-nums">{fmt(remainingMs)}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">remaining</span>
              </div>
            </div>
          </div>

          {/* Program info */}
          <div className="text-center space-y-1">
            <p className="text-base font-display font-semibold">{session.programName}</p>
            <p className="text-[11px] text-muted-foreground font-mono">
              Broadcasting code: {session.programCode}
            </p>
          </div>

          {/* Controls */}
          <Button
            variant={isCompleted ? "default" : "destructive"}
            className="w-full"
            onClick={() => { stopSession(); onOpenChange(false); }}
          >
            <StopCircle className="w-4 h-4 mr-2" />
            {isCompleted ? "Close" : "Stop session"}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            🧪 Simulated hardware — BLE/WiFi protocols not yet implemented.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SessionSheet;
