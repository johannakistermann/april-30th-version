import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Heart, Moon, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";

const TABS = ["Energy", "Emotions", "Sleep", "History"] as const;

const GemDetect = () => {
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
          <h1 className="text-lg font-display font-semibold">Detect</h1>
          <p className="text-[10px] text-muted-foreground">GEM · Last reading: 2h ago</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {TABS.map((tab, i) => (
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

      {/* Energy Score Hero */}
      <div className="px-6 mb-6">
        <div className="glass-card p-6 glow-success relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--success))" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.94)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-bold text-success">94</span>
                <span className="text-[10px] text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-display font-semibold">Energy Score</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-xs text-success font-medium">Improving +2%</span>
              </div>
              <p className="text-xs text-muted-foreground">Overall energy levels and vitality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Recommendation */}
      <div className="px-6 mb-6">
        <div className="glass-card p-4 border-success/20">
          <p className="text-xs font-display font-semibold text-success mb-1">Your Energy Score: GO STEADY</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your energy is strong indicating good vitality. Keep your current routine and focus on maintaining consistent sleep and nutrition.
          </p>
        </div>
      </div>

      {/* Sub-metrics */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-display font-semibold mb-3">Key Metrics</h2>
        <div className="space-y-2">
          {[
            { name: "Emotional Strength", score: 34, trend: "down", icon: Heart, color: "text-warning" },
            { name: "Sleep Efficiency", score: 91, trend: "up", icon: Moon, color: "text-success" },
          ].map((metric) => (
            <button
              key={metric.name}
              className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{metric.name}</p>
                <div className="flex items-center gap-1.5">
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : metric.trend === "down" ? (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  ) : (
                    <Minus className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {metric.trend === "up" ? "Improving" : metric.trend === "down" ? "Decreasing" : "Stable"}
                  </span>
                </div>
              </div>
              <span className="text-lg font-display font-bold">{metric.score}%</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Emotional Pattern */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-display font-semibold mb-3">Main Emotional Pattern</h2>
        <div className="glass-card p-5 border-element-fire/20">
          <p className="text-sm font-display font-semibold text-element-fire mb-2">Repressed Grief</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            This pulse reflects suppressed expression — sadness or grief held back. The waveform signals a blockage in the natural flow of emotion.
          </p>
          <div className="flex gap-2">
            {["Heart", "Liver", "Kidney"].map((m) => (
              <span key={m} className="text-[10px] bg-element-fire/10 text-element-fire px-2 py-0.5 rounded-full">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default GemDetect;
