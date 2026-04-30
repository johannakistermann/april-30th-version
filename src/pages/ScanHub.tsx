import { useNavigate } from "react-router-dom";
import { Scan, Activity, Users } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const SCAN_OPTIONS = [
  {
    title: "Mirror Check",
    duration: "~60s",
    description: "Daily 60-second check — face scan, tongue photos & voice recording",
    icon: Scan,
    color: "text-primary",
    bg: "bg-primary/10",
    action: () => ({ path: "/mirror-check", state: {} }),
  },
  {
    title: "Deep Scan",
    duration: "~3 min",
    description: "Full mirror check plus extended voice analysis — sustained phonation, breath count & Rainbow Passage",
    icon: Activity,
    color: "text-info",
    bg: "bg-info/10",
    action: () => ({ path: "/mirror-check", state: { deepScan: true } }),
  },
  {
    title: "Guest Scan",
    duration: "~60s",
    description: "Quick face, tongue & voice scan for a friend — no account needed",
    icon: Users,
    color: "text-success",
    bg: "bg-success/10",
    action: () => ({ path: "/guest-scan", state: {} }),
  },
];

const ScanHub = () => {
  const navigate = useNavigate();

  const handleScan = (option: (typeof SCAN_OPTIONS)[number]) => {
    localStorage.setItem("lastScanDate", new Date().toISOString());
    const { path, state } = option.action();
    navigate(path, { state });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-lg font-display font-semibold">Choose Your Scan</h1>
        <p className="text-xs text-muted-foreground mt-1">Pick the scan that fits your moment</p>
      </div>

      <div className="px-6 space-y-3">
        {SCAN_OPTIONS.map((option) => (
          <button
            key={option.title}
            onClick={() => handleScan(option)}
            className="glass-card p-5 w-full flex items-start gap-4 text-left hover:border-primary/20 transition-colors"
          >
            <div className={`w-12 h-12 rounded-2xl ${option.bg} flex items-center justify-center flex-shrink-0`}>
              <option.icon className={`w-6 h-6 ${option.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-semibold">{option.title}</span>
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{option.duration}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default ScanHub;
