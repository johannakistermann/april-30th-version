import { ArrowLeft, TrendingUp, Trophy, Users, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const LEADERBOARD = [
  { rank: 1, name: "Sarah M.", delta: -5.8, badge: "⏳" },
  { rank: 2, name: "James K.", delta: -4.2, badge: "⏳" },
  { rank: 3, name: "You", delta: -3.2, badge: "⏳", isYou: true },
  { rank: 4, name: "Lisa R.", delta: -2.9, badge: null },
  { rank: 5, name: "Tom W.", delta: -2.1, badge: null },
];

const INTERVENTIONS = [
  { action: "Improve sleep consistency", impact: "-0.8 years potential", pillar: "Energy" },
  { action: "Reduce inflammatory markers", impact: "-0.5 years potential", pillar: "Organs" },
  { action: "Increase HRV through breathwork", impact: "-0.3 years potential", pillar: "Stress" },
];

const Longevity = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">Longevity & Age Reversal</h1>
      </div>

      {/* Hero Delta */}
      <div className="px-6 mb-6">
        <div className="glass-card p-8 text-center glow-success">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-display">Biological Age Delta</p>
          <div className="text-5xl font-display font-bold text-success mb-1">-3.2</div>
          <p className="text-sm text-muted-foreground">years younger than chronological age</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-medium">Improved 0.4 years this month</span>
          </div>
        </div>
      </div>

      {/* What Would Move This */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-display font-semibold mb-3">What Would Move This Fastest</h2>
        <div className="space-y-2">
          {INTERVENTIONS.map((item, i) => (
            <div key={i} className="glass-card p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-display font-bold text-primary">{i + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-xs text-success mt-0.5">{item.impact}</p>
                <p className="text-[10px] text-muted-foreground">{item.pillar} pillar</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Tabs */}
      <div className="px-6">
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-sm font-display font-semibold">Leaderboard</h2>
          <div className="flex gap-2 ml-auto">
            <button className="text-[10px] px-3 py-1 rounded-full bg-primary/10 text-primary font-display">
              <Trophy className="w-3 h-3 inline mr-1" />Global
            </button>
            <button className="text-[10px] px-3 py-1 rounded-full bg-muted text-muted-foreground font-display">
              <Users className="w-3 h-3 inline mr-1" />Friends
            </button>
            <button className="text-[10px] px-3 py-1 rounded-full bg-muted text-muted-foreground font-display">
              <User className="w-3 h-3 inline mr-1" />Personal
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {LEADERBOARD.map((entry) => (
            <div key={entry.rank} className={`glass-card p-3 flex items-center gap-3 ${entry.isYou ? "border-primary/30" : ""}`}>
              <span className={`text-sm font-display font-bold w-6 text-center ${entry.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                {entry.rank}
              </span>
              <div className="flex-1">
                <span className={`text-sm ${entry.isYou ? "font-semibold text-primary" : ""}`}>{entry.name}</span>
              </div>
              <span className="text-sm font-display font-bold text-success">{entry.delta}y</span>
              {entry.badge && <span>{entry.badge}</span>}
            </div>
          ))}
        </div>
      </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default Longevity;
