import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ScanProgress from "@/components/ScanProgress";

const messages = [
  "Analyzing voice patterns...",
  "Processing facial data...",
  "Reading tongue zones...",
  "Calculating energy scores...",
  "Building your health profile...",
];

const ResultsLoading = () => {
  const navigate = useNavigate();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 1500);

    const progTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progTimer);
          clearInterval(msgTimer);
          localStorage.setItem("lastScanDate", new Date().toISOString());
          // Fork destination based on auth state
          supabase.auth.getUser().then(({ data: { user } }) => {
            setTimeout(() => {
              if (user) {
                navigate("/dashboard");
              } else {
                navigate("/auth", { state: { fromScan: true } });
              }
            }, 500);
          });
          return 100;
        }
        return p + 2;
      });
    }, 100);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <ScanProgress currentStep={2} />
      {/* Animated processing rings */}
      <div className="relative w-40 h-40 mb-12">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-200"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-display font-bold text-primary">{Math.round(progress)}%</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground animate-fade-in font-display" key={msgIndex}>
        {messages[msgIndex]}
      </p>

      {progress >= 100 && (
        <p className="text-xs text-muted-foreground mt-4 animate-fade-in">
          Preparing your results…
        </p>
      )}
    </div>
  );
};

export default ResultsLoading;
