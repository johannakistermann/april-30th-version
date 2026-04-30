import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Wind } from "lucide-react";

const TASKS = [
  { label: "Sustained Phonation", icon: Mic, duration: 15, desc: "Hold a steady 'Ahhh' sound for as long as you can" },
  { label: "Breath Count Challenge", icon: Wind, duration: 25, desc: "Count with the beat until you run out of air" },
  { label: "Rainbow Passage (Extended)", icon: Mic, duration: 30, desc: "Read the passage aloud at your natural pace" },
];

const RAINBOW_EXTENDED = `When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon. There is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it.`;

const DeepScan = () => {
  const navigate = useNavigate();
  const [taskIndex, setTaskIndex] = useState(0);
  const [taskElapsed, setTaskElapsed] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const totalDuration = TASKS.reduce((s, t) => s + t.duration, 0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaskElapsed((prev) => {
        const next = prev + 1;
        if (next >= TASKS[taskIndex].duration) {
          if (taskIndex < TASKS.length - 1) {
            setTaskIndex((i) => i + 1);
            return 0;
          } else {
            clearInterval(interval);
            // Record completion of full Weekly Scan
            const prevLast = localStorage.getItem("lastScanDate");
            const prevStreak = parseInt(localStorage.getItem("scanStreak") || "0", 10) || 0;
            const now = new Date();
            let nextStreak = prevStreak + 1;
            if (prevLast) {
              const days = (now.getTime() - new Date(prevLast).getTime()) / (24 * 60 * 60 * 1000);
              if (days > 14) nextStreak = 1;
            } else {
              nextStreak = 1;
            }
            localStorage.setItem("lastScanDate", now.toISOString());
            localStorage.setItem("scanStreak", String(nextStreak));
            const total = parseInt(localStorage.getItem("scanCount") || "0", 10) || 0;
            localStorage.setItem("scanCount", String(total + 1));
            setTimeout(() => navigate("/results-loading"), 500);
            return next;
          }
        }
        return next;
      });
      setTotalElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [taskIndex, navigate]);

  // Breath count beats
  useEffect(() => {
    if (taskIndex === 1) {
      setBreathCount(0);
      const beatInterval = setInterval(() => {
        setBreathCount((c) => c + 1);
      }, 1000);
      return () => clearInterval(beatInterval);
    }
  }, [taskIndex]);

  const task = TASKS[taskIndex];
  const taskProgress = (taskElapsed / task.duration) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Task indicator dots */}
      <div className="flex items-center justify-center gap-2 pt-12 pb-2 px-6">
        {TASKS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < taskIndex ? "w-6 bg-primary" : i === taskIndex ? "w-10 bg-primary" : "w-4 bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mb-4">Deep Scan — Extended Voice Analysis</p>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <div className="glass-card p-8 w-full max-w-sm flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <task.icon className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-display font-semibold">{task.label}</h2>
            <p className="text-sm text-muted-foreground">{task.desc}</p>
          </div>

          {/* Breath Count UI */}
          {taskIndex === 1 && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-6xl font-display font-bold text-primary animate-count-up">
                {breathCount}
              </div>
              <p className="text-xs text-muted-foreground">beats counted</p>
              <div className="w-4 h-4 rounded-full bg-primary animate-breathe" />
            </div>
          )}

          {/* Rainbow passage for extended reading */}
          {taskIndex === 2 && (
            <div className="glass-card p-4 max-h-28 overflow-y-auto">
              <p className="text-xs text-foreground/80 leading-relaxed">{RAINBOW_EXTENDED}</p>
            </div>
          )}

          {/* Task progress */}
          <div className="w-full space-y-2">
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Task {taskIndex + 1}/{TASKS.length}</span>
              <span>{taskElapsed}s / {task.duration}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total progress */}
      <div className="px-6 pb-10">
        <div className="flex justify-between text-xs text-muted-foreground font-display mb-2">
          <span>Deep Scan — Step 2</span>
          <span>~{Math.ceil((totalDuration - totalElapsed) / 60)} min remaining</span>
        </div>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/50 rounded-full transition-all"
            style={{ width: `${(totalElapsed / totalDuration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DeepScan;
