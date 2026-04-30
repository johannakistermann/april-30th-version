// Bottom-of-screen strip showing the current mock hardware session.
import { Activity, X } from "lucide-react";
import { useMockHardware } from "@/lib/hardware/mockHardware";
import { useState } from "react";
import SessionSheet from "./SessionSheet";

const fmt = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const ActiveSessionStrip = () => {
  const { session, remainingMs, progressPct, stopSession, dismissCompleted } = useMockHardware();
  const [open, setOpen] = useState(false);
  if (!session) return null;

  const isCompleted = session.status === "completed";

  return (
    <>
      <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-2 pointer-events-none">
        <button
          onClick={() => (isCompleted ? dismissCompleted() : setOpen(true))}
          className="pointer-events-auto w-full glass-card p-2.5 flex items-center gap-3 border-primary/30 active:scale-[0.99] transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Activity className={`w-4 h-4 text-primary ${!isCompleted ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[11px] font-display font-semibold truncate">{session.programName}</p>
            <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <span className="text-[11px] font-display font-medium text-primary tabular-nums">
            {isCompleted ? "Done" : fmt(remainingMs)}
          </span>
          {isCompleted && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); dismissCompleted(); }}
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
      </div>
      <SessionSheet open={open} onOpenChange={setOpen} />
    </>
  );
};

export default ActiveSessionStrip;
