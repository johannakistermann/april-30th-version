import { ArrowLeft, Trophy, Wind, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const BREATH_LEADERS = [
  { rank: 1, name: "Mike T.", seconds: 52, percentile: "Top 2%" },
  { rank: 2, name: "Anna S.", seconds: 48, percentile: "Top 5%" },
  { rank: 3, name: "You", seconds: 42, percentile: "Top 8%", isYou: true },
  { rank: 4, name: "Chris L.", seconds: 38, percentile: "Top 15%" },
  { rank: 5, name: "Dana P.", seconds: 35, percentile: "Top 20%" },
];

const STREAKS = [
  { name: "You", days: 7, badge: "🔥" },
  { name: "Sarah M.", days: 23, badge: "🏆" },
  { name: "James K.", days: 14, badge: "🔥" },
];

const Leaderboards = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">Leaderboards</h1>
      </div>

      {/* Your badges */}
      <div className="px-6 mb-6">
        <div className="glass-card p-4 flex items-center gap-4 overflow-x-auto">
          {[
            { emoji: "⏳", label: "Time Traveler" },
            { emoji: "🤿", label: "Deep Diver" },
            { emoji: "🔥", label: "7-Day Streak" },
            { emoji: "🌿", label: "Wood Element" },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className="text-2xl">{b.emoji}</span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breath Challenge */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Wind className="w-4 h-4 text-info" />
          <h2 className="text-sm font-display font-semibold">Breath Challenge</h2>
          <span className="text-[10px] text-muted-foreground ml-auto">This week</span>
        </div>

        {/* Your best */}
        <div className="glass-card p-4 mb-3 border-primary/20 text-center">
          <p className="text-xs text-muted-foreground">Your best this week</p>
          <p className="text-3xl font-display font-bold text-primary mt-1">42s</p>
          <p className="text-xs text-success">Top 8% · Deep Diver 🤿</p>
        </div>

        <div className="space-y-2">
          {BREATH_LEADERS.map((entry) => (
            <div key={entry.rank} className={`glass-card p-3 flex items-center gap-3 ${entry.isYou ? "border-primary/30" : ""}`}>
              <span className={`text-sm font-display font-bold w-6 text-center ${entry.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                {entry.rank}
              </span>
              <span className={`text-sm flex-1 ${entry.isYou ? "font-semibold text-primary" : ""}`}>{entry.name}</span>
              <span className="text-sm font-display font-bold">{entry.seconds}s</span>
              <span className="text-[10px] text-muted-foreground w-16 text-right">{entry.percentile}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Flame */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-warning" />
          <h2 className="text-sm font-display font-semibold">Streak Flame</h2>
          <span className="text-[10px] text-muted-foreground ml-auto">Ongoing</span>
        </div>
        <div className="space-y-2">
          {STREAKS.map((s, i) => (
            <div key={i} className="glass-card p-3 flex items-center gap-3">
              <span className="text-lg">{s.badge}</span>
              <span className="text-sm flex-1">{s.name}</span>
              <span className="text-sm font-display font-bold">{s.days} days</span>
            </div>
          ))}
        </div>
      </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default Leaderboards;
