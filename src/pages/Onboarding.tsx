import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, Camera, Mic, CircleDot, Heart, Zap, Brain, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScanProgress from "@/components/ScanProgress";

const VALUE_SLIDES = [
  {
    icon: Camera,
    title: "Face Scan",
    desc: "Your camera reads skin colour changes invisible to the eye — revealing heart rate, stress levels, and biological age.",
  },
  {
    icon: Mic,
    title: "Voice Check",
    desc: "15 seconds of speech reveals cognitive load, emotional state, and nervous system balance through voice biomarkers.",
  },
  {
    icon: CircleDot,
    title: "Tongue Reading",
    desc: "An ancient diagnostic tool backed by modern AI — tongue colour, coating, and vein patterns map to organ health.",
  },
];

const RESULT_PREVIEWS = [
  { icon: Gauge, label: "Control", desc: "Your bioenergetic drivers and how your system regulates itself" },
  { icon: Zap, label: "Energy", desc: "How your body powers through the day" },
  { icon: Heart, label: "Recovery", desc: "How well you're rebuilding between efforts" },
  { icon: Brain, label: "Stress & Nervous System", desc: "Your mental load and stress resilience" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [showSlides, setShowSlides] = useState(false);
  const [howExpanded, setHowExpanded] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  if (showSlides) {
    const slide = VALUE_SLIDES[slideIndex];
    const SlideIcon = slide.icon;
    const isLast = slideIndex === VALUE_SLIDES.length - 1;

    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          <div className="max-w-sm w-full flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <SlideIcon className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-display font-bold">{slide.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{slide.desc}</p>
            </div>
            <div className="flex gap-2">
              {VALUE_SLIDES.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === slideIndex ? "bg-primary w-6" : "bg-muted"}`} />
              ))}
            </div>
            <div className="w-full space-y-2 mt-4">
              {isLast ? (
                <Button
                  onClick={() => setShowSlides(false)}
                  className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground glow-primary"
                >
                  Got it — Let's Scan
                </Button>
              ) : (
                <Button
                  onClick={() => setSlideIndex(slideIndex + 1)}
                  className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              )}
              <Button variant="ghost" onClick={() => setShowSlides(false)} className="w-full text-muted-foreground text-sm">
                Skip
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-60 h-60 rounded-full bg-info/5 blur-3xl" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-sm w-full flex flex-col items-center text-center gap-4">
          {/* Animated rings */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-ring" />
            <div className="absolute inset-2 rounded-full border border-primary/30 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
            <div className="absolute inset-4 rounded-full border border-primary/40 animate-pulse-ring" style={{ animationDelay: "1s" }} />
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Scan className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold leading-tight">
              Your body is talking.
              <br />
              <span className="text-primary">Let's listen.</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A 60-second scan using your camera, voice, and tongue reveals
              your energy, stress, organ health, and biological age.
            </p>
          </div>

          {/* CTA — above the fold */}
          <div className="w-full space-y-2 mt-1">
            <Button
              onClick={() => navigate("/mirror-check")}
              className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 glow-primary active:scale-[0.98]"
            >
              <Scan className="w-5 h-5 mr-2" />
              Start Your Free Scan (~60s)
            </Button>
            <p className="text-xs text-muted-foreground">
              Enter your email after the scan to see your results.
            </p>
          </div>

          {/* How does it work — expandable accordion */}
          <div className="w-full">
            <button
              onClick={() => setHowExpanded(!howExpanded)}
              className="w-full flex items-center justify-between glass-card px-4 py-3 text-left"
            >
              <span className="text-xs text-primary font-display font-semibold">How does it work?</span>
              <ChevronDown className={`w-4 h-4 text-primary transition-transform ${howExpanded ? "rotate-180" : ""}`} />
            </button>
            {howExpanded && (
              <div className="glass-card mt-1 p-4 space-y-3 animate-fade-in">
                {VALUE_SLIDES.map((slide, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <slide.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{slide.title}</p>
                      <p className="text-xs text-muted-foreground">{slide.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* What you'll discover */}
          <div className="w-full glass-card p-4 space-y-3">
            <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">What you'll discover</p>
            {RESULT_PREVIEWS.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <r.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/auth")}
            className="w-full py-3 text-sm border border-border rounded-xl text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
          >
            Already have an account? <span className="text-primary font-semibold">Sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
