import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Check } from "lucide-react";

const PRACTICAL_ADVICE = [
  { icon: "🚶", text: "Walk 20 min after meals to support blood sugar and digestion" },
  { icon: "🫁", text: "Practice 4-7-8 breathing before bed to calm the nervous system" },
  { icon: "🍵", text: "Drink warm ginger + lemon water in the morning to support Spleen Qi" },
  { icon: "🛌", text: "Aim for lights-out by 10:30pm — Liver detox peaks at 1am" },
  { icon: "🥗", text: "Eat warm, cooked foods and reduce raw/cold meals for 2 weeks" },
];

const SUGGESTED_PROMPTS = [
  "What does Liver Qi Stagnation mean for me?",
  "How can I improve my metabolic health?",
  "What foods support my Spleen?",
  "Explain my stress markers",
];

const CoachAvatar = () => (
  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
    <Sparkles className="w-3.5 h-3.5 text-primary" />
  </div>
);

const HealthSummary = ({ onAskCoach, onPopulateInput }: { onAskCoach: (q: string) => void; onPopulateInput: (q: string) => void }) => {
  const [checked, setChecked] = useState<boolean[]>(new Array(PRACTICAL_ADVICE.length).fill(false));

  const toggleCheck = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  return (
    <div className="space-y-4">
      {/* Greeting bubble */}
      <div className="flex items-start gap-2.5">
        <CoachAvatar />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">Aria</p>
          <div className="max-w-[85%] bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
            <p className="text-sm leading-relaxed">
              Good morning Johanna 👋 I've reviewed your latest scan. Here's what I'd prioritise today.
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Today, 9:41 AM</p>
        </div>
      </div>

      {/* Tasks bubble */}
      <div className="flex items-start gap-2.5">
        <CoachAvatar />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">Aria</p>
          <div className="max-w-[85%] bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3 space-y-3">
            <h3 className="text-sm font-semibold font-display">🎯 What You Can Do Today</h3>
            <div className="space-y-2.5">
              {PRACTICAL_ADVICE.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 cursor-pointer"
                  onClick={() => toggleCheck(i)}
                >
                  <span className="text-sm flex-shrink-0">{item.icon}</span>
                  <p className={`text-[11px] leading-relaxed flex-1 transition-all ${checked[i] ? "line-through text-muted-foreground/50" : "text-muted-foreground"}`}>
                    {item.text}
                  </p>
                  <button
                    className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
                      checked[i]
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {checked[i] && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Today, 9:41 AM</p>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="space-y-2 pt-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium px-1">Suggested</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onPopulateInput(prompt)}
              className="flex-shrink-0 border border-border/50 rounded-full px-3.5 py-2 text-xs text-foreground hover:border-primary/30 transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthSummary;
