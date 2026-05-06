import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Hand, Brain, Heart, Bone, Activity } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const BODY_ZONES = [
  { name: "Head & Neck", icon: Brain, protocols: ["Cranial Release", "TMJ Relief", "Sinus Clear"], color: "text-info" },
  { name: "Chest & Heart", icon: Heart, protocols: ["Heart Coherence", "Lung Expansion", "Thymus Boost"], color: "text-destructive" },
  { name: "Spine & Back", icon: Bone, protocols: ["Spinal Flow", "Lower Back Release", "Sacral Balance"], color: "text-warning" },
  { name: "Limbs & Joints", icon: Hand, protocols: ["Joint Mobility", "Muscle Recovery", "Nerve Reset"], color: "text-success" },
  { name: "Abdomen & Organs", icon: Activity, protocols: ["Digestive Reset", "Liver Detox", "Kidney Support"], color: "text-primary" },
];

const MiHealthCorrect = () => {
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
          <h1 className="text-lg font-display font-semibold">miHealth — Correct</h1>
          <p className="text-[10px] text-muted-foreground">Select body zone for PEMF treatment</p>
        </div>
      </div>

      {/* Device Status */}
      <div className="px-6 mb-6">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">miHealth Device</p>
            <p className="text-[10px] text-success">Ready · Battery 87%</p>
          </div>
        </div>
      </div>

      {/* Body Zones */}
      <div className="px-6 space-y-3">
        <h2 className="text-sm font-display font-semibold">Body Zones</h2>
        {BODY_ZONES.map((zone) => (
          <div key={zone.name} className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center`}>
                <zone.icon className={`w-4 h-4 ${zone.color}`} />
              </div>
              <h3 className="text-sm font-display font-medium">{zone.name}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {zone.protocols.map((protocol) => (
                <button key={protocol} className="text-[10px] px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors font-display">
                  {protocol}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default MiHealthCorrect;
