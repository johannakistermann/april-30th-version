import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Focus, Moon, Heart, Leaf, ChevronRight, Play } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const PROGRAM_FOLDERS = [
  {
    name: "Energy",
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    programs: ["Energize", "Creativity", "Chill", "Courage", "EMF"],
  },
  {
    name: "Focus",
    icon: Focus,
    color: "text-info",
    bg: "bg-info/10",
    programs: ["Recharge", "Learning", "Meditate", "Gratitude", "Air Travel"],
  },
  {
    name: "Relax",
    icon: Moon,
    color: "text-success",
    bg: "bg-success/10",
    programs: ["Deep Work", "Sleep", "Connection"],
  },
  {
    name: "Emotions",
    icon: Heart,
    color: "text-element-fire",
    bg: "bg-element-fire/10",
    programs: ["Faith", "Decisiveness"],
  },
  {
    name: "Environment",
    icon: Leaf,
    color: "text-element-wood",
    bg: "bg-element-wood/10",
    programs: ["EMF Shield", "Travel Recovery"],
  },
];

const GemCorrect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold">Correct</h1>
          <p className="text-[10px] text-muted-foreground">GEM Programs · Tap to run</p>
        </div>
      </div>

      {/* Current Program */}
      <div className="px-6 mb-6">
        <div className="glass-card p-4 glow-primary flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Play className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Currently Running</p>
            <p className="text-sm font-display font-semibold">Chill · Energy Folder</p>
            <p className="text-[10px] text-muted-foreground">38 min remaining</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
        </div>
      </div>

      {/* Program Folders */}
      <div className="px-6 space-y-4">
        {PROGRAM_FOLDERS.map((folder) => (
          <div key={folder.name}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${folder.bg} flex items-center justify-center`}>
                <folder.icon className={`w-3.5 h-3.5 ${folder.color}`} />
              </div>
              <h2 className="text-sm font-display font-semibold">{folder.name}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {folder.programs.map((program) => (
                <button
                  key={program}
                  className="glass-card px-4 py-2.5 text-xs font-display font-medium hover:border-primary/30 transition-colors flex items-center gap-2"
                >
                  <Play className="w-3 h-3 text-muted-foreground" />
                  {program}
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

export default GemCorrect;
