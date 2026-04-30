import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Scan, Users, Flame, Clock } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const ScanHub = () => {
  const navigate = useNavigate();
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const last = localStorage.getItem("lastScanDate");
    if (last) setLastScanAt(new Date(last));
    const s = parseInt(localStorage.getItem("scanStreak") || "0", 10);
    setStreak(Number.isFinite(s) ? s : 0);
  }, []);

  const startScan = () => {
    navigate("/mirror-check", { state: { deepScan: true } });
  };

  const now = Date.now();
  const msSinceLast = lastScanAt ? now - lastScanAt.getTime() : Infinity;
  const dueNow = msSinceLast >= WEEK_MS;
  const daysUntilNext = dueNow ? 0 : Math.ceil((WEEK_MS - msSinceLast) / (24 * 60 * 60 * 1000));

  const lastLabel = !lastScanAt
    ? "No scans yet"
    : msSinceLast < 60 * 60 * 1000
    ? "Less than an hour ago"
    : msSinceLast < 24 * 60 * 60 * 1000
    ? `${Math.floor(msSinceLast / (60 * 60 * 1000))}h ago`
    : `${Math.floor(msSinceLast / (24 * 60 * 60 * 1000))}d ago`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-lg font-display font-semibold">Weekly Scan</h1>
        <p className="text-xs text-muted-foreground mt-1">
          One full scan a week powers your Vitality Score
        </p>
      </div>

      {/* Hero card */}
      <div className="px-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Scan className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold">
                {dueNow ? "Your scan is ready" : "You're up to date"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Face, tongue, and voice — about 2 minutes. Captures all four pillars at once.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/40 p-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">Last scan</p>
                <p className="text-xs font-display font-semibold">{lastLabel}</p>
              </div>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-warning" />
              <div>
                <p className="text-[10px] text-muted-foreground">Streak</p>
                <p className="text-xs font-display font-semibold">
                  {streak} {streak === 1 ? "week" : "weeks"}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={startScan}
            className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground glow-primary active:scale-[0.98]"
          >
            {dueNow ? "Start Weekly Scan" : "Scan again"}
          </Button>

          {!dueNow && (
            <p className="text-[11px] text-muted-foreground text-center">
              Next scan due in {daysUntilNext} {daysUntilNext === 1 ? "day" : "days"}
            </p>
          )}
        </div>

        {/* Guest scan secondary */}
        <button
          onClick={() => navigate("/guest-scan")}
          className="mt-4 w-full glass-card p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-display font-semibold">Guest Scan</p>
            <p className="text-[11px] text-muted-foreground">
              Quick reading for a friend — no account needed
            </p>
          </div>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ScanHub;
