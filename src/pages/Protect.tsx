import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Gem, Zap, Play, Activity, Heart, Brain, Leaf, Focus, Sparkles, ChevronDown, Moon } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { useMockHardware, type DeviceKind } from "@/lib/hardware/mockHardware";

const CORRECT_FOLDERS = [
  {
    name: "Rehab",
    icon: Activity,
    color: "text-primary",
    bg: "bg-primary/10",
    programs: ["Acute Pain", "Chronic Pain", "Recovery", "Sports Injury", "Post-Surgery"],
  },
  {
    name: "Wellness",
    icon: Heart,
    color: "text-success",
    bg: "bg-success/10",
    programs: ["Immune Boost", "Detox", "Sleep", "Stress Relief"],
  },
  {
    name: "Organs & Systems",
    icon: Brain,
    color: "text-info",
    bg: "bg-info/10",
    programs: ["Heart / Circulation", "Liver / Gallbladder", "Kidney / Bladder", "Lung / Colon", "Brain / Nervous System"],
  },
  {
    name: "Environment",
    icon: Leaf,
    color: "text-element-wood",
    bg: "bg-element-wood/10",
    programs: ["EMF Protection", "Pollution Detox", "Travel Recovery"],
  },
  {
    name: "Mind",
    icon: Focus,
    color: "text-accent-foreground",
    bg: "bg-accent/50",
    programs: ["Focus", "Meditation", "Creativity", "Learning"],
  },
  {
    name: "Transformations",
    icon: Sparkles,
    color: "text-element-fire",
    bg: "bg-element-fire/10",
    programs: ["Courage", "Gratitude", "Faith", "Connection"],
  },
];

const GEM_FOLDERS = [
  {
    name: "Energy",
    icon: Zap,
    color: "text-element-fire",
    bg: "bg-element-fire/10",
    programs: ["Energize", "Recharge"],
  },
  {
    name: "Focus",
    icon: Focus,
    color: "text-accent-foreground",
    bg: "bg-accent/50",
    programs: ["Creativity", "Deep Work", "Learning"],
  },
  {
    name: "Relax",
    icon: Moon,
    color: "text-info",
    bg: "bg-info/10",
    programs: ["Chill", "Meditate", "Sleep"],
  },
  {
    name: "Emotions",
    icon: Heart,
    color: "text-success",
    bg: "bg-success/10",
    programs: ["Faith", "Connection", "Gentleness", "Decisiveness", "Trust", "Presence", "Focus", "Relaxation", "Openness", "Joy", "Awareness", "Courage"],
  },
  {
    name: "Environment",
    icon: Leaf,
    color: "text-element-wood",
    bg: "bg-element-wood/10",
    programs: ["Air Travel", "EMF"],
  },
];
type Source = "phone" | "gem" | "mihealth";

const Protect = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState<Source>("phone");
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const { startProgram } = useMockHardware();

  const toggleFolder = (name: string) => {
    setExpandedFolder((prev) => (prev === name ? null : name));
  };

  const launchProgram = (programName: string) => {
    const device: DeviceKind = source === "mihealth" ? "mihealth" : "gem";
    startProgram(device, programName, 30);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />

      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">Correct</h1>
          <p className="text-[10px] text-muted-foreground font-display">
            On-demand individual biosignatures at your fingertips
          </p>
        </div>
      </div>

      {/* Phone / GEM / miHealth toggle */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: "phone" as Source, icon: Smartphone, label: "Phone" },
            { key: "gem" as Source, icon: Gem, label: "GEM" },
            { key: "mihealth" as Source, icon: Zap, label: "miHealth" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setSource(tab.key); setExpandedFolder(null); }}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-display font-medium transition-colors ${
                source === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "glass-card text-foreground/70 hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Folder Structure */}
      <div className="px-6 space-y-3">
        <h2 className="text-sm font-display font-bold mb-1">Choose Program</h2>
        {(source === "gem" ? GEM_FOLDERS : CORRECT_FOLDERS).map((folder) => {
          const isOpen = expandedFolder === folder.name;
          return (
            <div key={folder.name}>
              <button
                onClick={() => toggleFolder(folder.name)}
                className="w-full glass-card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl ${folder.bg} flex items-center justify-center`}>
                  <folder.icon className={`w-4 h-4 ${folder.color}`} />
                </div>
                <span className="text-sm font-display font-semibold flex-1 text-left">{folder.name}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="mt-2 ml-4 flex flex-wrap gap-2">
                  {folder.programs.map((program) => (
                    <button
                      key={program}
                      onClick={() => launchProgram(program)}
                      className="glass-card px-4 py-2.5 text-xs font-display font-medium hover:border-primary/30 transition-colors flex items-center gap-2 active:scale-[0.98]"
                    >
                      <Play className="w-3 h-3 text-primary" />
                      {program}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default Protect;
