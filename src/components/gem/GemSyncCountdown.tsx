import { useState, useEffect } from "react";

interface GemSyncCountdownProps {
  onComplete: () => void;
}

const GemSyncCountdown = ({ onComplete }: GemSyncCountdownProps) => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center animate-pulse">
        <span className="text-4xl font-display font-bold text-primary">{count}</span>
      </div>
      <p className="text-sm font-display font-medium text-muted-foreground">
        Syncing to GEM...
      </p>
      <div className="flex gap-2">
        {[5, 4, 3, 2, 1].map((n) => (
          <div
            key={n}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              n > count ? "bg-primary scale-110" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default GemSyncCountdown;
