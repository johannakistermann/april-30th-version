import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Clock, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const CYCLES = [
  { name: "Morning Energize", time: "06:00 – 08:00", status: "uploaded", description: "Boosts mitochondrial energy for the day" },
  { name: "Midday Focus", time: "11:00 – 13:00", status: "uploaded", description: "Supports cognitive clarity and stress resilience" },
  { name: "Afternoon Recovery", time: "14:00 – 16:00", status: "pending", description: "Gentle muscle and organ recovery cycle" },
  { name: "Evening Wind-Down", time: "18:00 – 20:00", status: "pending", description: "Prepares nervous system for deep sleep" },
  { name: "Sleep Repair", time: "22:00 – 06:00", status: "pending", description: "Overnight cellular repair and detoxification" },
];

const MiHealthProtect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">miHealth — Protect</h1>
          <p className="text-[10px] text-muted-foreground">Upload cycles to your miHealth device</p>
        </div>
      </div>

      {/* Upload Status */}
      <div className="px-6 mb-6">
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Cycle Upload</p>
            <p className="text-[10px] text-muted-foreground">2 of 5 cycles uploaded</p>
          </div>
          <Button size="sm" className="rounded-xl text-xs">
            <Upload className="w-3 h-3 mr-1" />
            Sync All
          </Button>
        </div>
      </div>

      {/* Cycles */}
      <div className="px-6 space-y-3">
        <h2 className="text-sm font-display font-semibold">Daily Cycles</h2>
        {CYCLES.map((cycle) => (
          <div key={cycle.name} className={`glass-card p-4 ${cycle.status === "uploaded" ? "border-success/20" : ""}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {cycle.status === "uploaded" ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
                <h3 className="text-sm font-display font-medium">{cycle.name}</h3>
              </div>
              <span className="text-[10px] text-muted-foreground">{cycle.time}</span>
            </div>
            <p className="text-[10px] text-muted-foreground ml-6">{cycle.description}</p>
          </div>
        ))}
      </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default MiHealthProtect;
