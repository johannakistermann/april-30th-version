import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Settings, Bluetooth, Battery, Wifi, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const CYCLE_ITEMS = [
  { time: "3:00 PM", tcm: "Faith 2", pulse: "Scan Item", circadian: "N/A" },
  { time: "4:00 PM", tcm: "Courage 1", pulse: "Scan Item", circadian: "N/A" },
  { time: "5:00 PM", tcm: "Courage 1", pulse: "Scan Item", circadian: "N/A" },
  { time: "6:00 PM", tcm: "Courage 2", pulse: "Scan Item", circadian: "Chill" },
  { time: "7:00 PM", tcm: "Courage 2", pulse: "Scan Item", circadian: "Chill" },
];

const GemProtect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">Protect</h1>
          <p className="text-[10px] text-muted-foreground">24hr Cycle & Device Settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {["24hr Cycle", "Settings"].map((tab, i) => (
            <button
              key={tab}
              className={`flex-1 text-xs font-display py-2 rounded-lg transition-colors ${
                i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cycle Info */}
      <div className="px-6 mb-4">
        <div className="glass-card p-4 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs font-display font-semibold">Automatic 24hr Cycle</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The 24hr Cycle runs automatically in the background. Once a program completes, the next cycle begins automatically.
          </p>
        </div>
      </div>

      {/* Cycle Table */}
      <div className="px-6 mb-6">
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-4 gap-0 text-[10px] font-display font-semibold text-muted-foreground p-3 border-b border-border/50">
            <span>Time</span>
            <span>TCM</span>
            <span>Pulse</span>
            <span>Circadian</span>
          </div>
          {CYCLE_ITEMS.map((item, i) => (
            <div key={i} className="grid grid-cols-4 gap-0 text-xs p-3 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground">{item.time}</span>
              <span className="font-medium">{item.tcm}</span>
              <span className="text-muted-foreground">{item.pulse}</span>
              <span className={item.circadian !== "N/A" ? "text-primary font-medium" : "text-muted-foreground"}>
                {item.circadian}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Device Status */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-display font-semibold mb-3">Active Device</h2>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Bluetooth className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Jo's GEM</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-success flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Connected
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Battery className="w-3 h-3" /> 70%
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 space-y-2">
        {[
          { label: "Add New Device", desc: "Pair GEM, miHealth, or Lightbed" },
          { label: "Update Firmware", desc: "Your device is up to date" },
          { label: "Notification Lights", desc: "Do not disturb mode" },
        ].map((action) => (
          <button key={action.label} className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/20 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-[10px] text-muted-foreground">{action.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default GemProtect;
