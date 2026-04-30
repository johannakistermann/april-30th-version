import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Camera, Mic, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";

const GuestScan = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const duration = 50;

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= duration) {
          clearInterval(interval);
          setTimeout(() => navigate("/guest-results"), 500);
          return duration;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, navigate]);

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full flex flex-col items-center text-center gap-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-display font-bold">Guest Scan</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Give a friend a full reading using their face, voice, and tongue. 
              No account needed — just the "party trick" that drives installs.
            </p>
          </div>
          <Button
            onClick={() => setStarted(true)}
            className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground"
          >
            Start Guest Scan
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground text-sm">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const progress = (elapsed / duration) * 100;
  const stage = elapsed < 15 ? { icon: Camera, label: "Face capture" } : elapsed < 45 ? { icon: Mic, label: "Voice capture" } : { icon: CircleDot, label: "Tongue capture" };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-64 h-64 rounded-full border-2 border-primary/30 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary/15 animate-pulse-ring" />
          <div className="flex flex-col items-center gap-3">
            <stage.icon className="w-10 h-10 text-primary" />
            <p className="text-sm font-display text-foreground">{stage.label}</p>
          </div>
        </div>
      </div>
      <div className="px-6 pb-10 space-y-3">
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Guest Scan</span>
          <span>{elapsed}s / {duration}s</span>
        </div>
      </div>
    </div>
  );
};

export default GuestScan;
