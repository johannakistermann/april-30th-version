import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  Mic,
  Wind,
  Smile,
  Activity,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

type CleanModality = {
  id: string;
  name: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const CLEAN: CleanModality[] = [
  { id: "voice", name: "Voice resonance", subtitle: "Quiet environment · clear voice signal", Icon: Mic },
  { id: "breath", name: "Breath capacity", subtitle: "Full inhale captured · steady exhale", Icon: Wind },
  { id: "face", name: "Face sweep", subtitle: "Even lighting · 8 features detected", Icon: Smile },
  { id: "gem", name: "GEM HRV", subtitle: "Continuous overnight tracking · 7h coverage", Icon: Activity },
];

// W1..W6 segments per modality. 'g' clean, 'a' amber, 'r' red. Order: voice, breath, face, tongue, gem.
const HISTORY: ("g" | "a" | "r")[][] = [
  ["g", "g", "g", "g", "g"], // W1
  ["g", "g", "g", "a", "g"], // W2
  ["g", "g", "g", "g", "g"], // W3
  ["g", "g", "g", "g", "g"], // W4
  ["g", "g", "g", "g", "g"], // W5
  ["g", "g", "g", "a", "g"], // W6 (current)
];

function SegColor(s: "g" | "a" | "r") {
  if (s === "g") return "bg-success";
  if (s === "a") return "bg-warning";
  return "bg-destructive";
}

function SectionHeader({ label }: { label: string }) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium block mb-2">
      {label}
    </span>
  );
}

const CaptureDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />

      {/* Back nav bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground active:scale-[0.96] transition-transform"
            aria-label="Back to Latest scan"
          >
            <ChevronLeft className="w-4 h-4" />
            Latest scan
          </button>
          <span className="text-sm font-semibold">Capture quality</span>
          <button
            className="text-muted-foreground active:scale-[0.96] transition-transform"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-6">
        {/* Header */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-display font-medium">
            Week 6 · Captured 17 min ago
          </div>
          <h1 className="font-display text-[32px] font-medium leading-tight mt-1">
            4 of 5 clean
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Most of your capture was strong this week. One modality flagged for retake — your tongue capture had uneven lighting that may slightly reduce confidence on Liver and Stomach Driver recommendations.
          </p>
        </div>

        {/* Per-modality breakdown */}
        <section>
          <SectionHeader label="Per-modality breakdown" />

          {/* Warned card */}
          <div className="glass-card border-l-4 border-l-warning p-4 mb-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tongue capture</span>
                  <span className="text-[10px] font-display font-medium uppercase tracking-wider text-warning bg-warning/15 rounded-full px-2 py-0.5">
                    Warned
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lighting was uneven across the tongue surface
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-md bg-muted/30 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-1">
                What this affects
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tongue features partially feed:{" "}
                <span className="text-foreground font-medium">Pillar 1 Headline Score</span> (Constitutional Pattern),{" "}
                <span className="text-foreground font-medium">Liver Driver</span>,{" "}
                <span className="text-foreground font-medium">Stomach Driver</span>. Confidence on these dropped to Medium for this scan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => navigate("/scan/retake/tongue")}
                className="bg-warning text-warning-foreground text-xs font-medium rounded-md py-2.5 active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-1"
                aria-label="Retake tongue capture now"
              >
                Retake now <ChevronRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => navigate("/detect/practice?modality=tongue")}
                className="border border-border text-xs font-medium rounded-md py-2.5 active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-1"
                aria-label="Open tongue tutorial"
              >
                Tutorial <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Clean modality cards */}
          <div className="space-y-2">
            {CLEAN.map(({ id, name, subtitle, Icon }) => (
              <button
                key={id}
                onClick={() => navigate(`/detect/latest/capture/${id}`)}
                role="button"
                aria-label={`${name}: clean capture, view details`}
                className="glass-card p-3 w-full flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-8 h-8 rounded-md bg-success/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{name}</span>
                    <span className="text-[10px] font-display font-medium uppercase tracking-wider text-success bg-success/15 rounded-full px-2 py-0.5">
                      Clean
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Capture health over time */}
        <section>
          <SectionHeader label="Capture health over time" />
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Clean captures last 6 weeks</span>
              <span className="text-sm font-display font-medium text-success">28 of 30</span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {HISTORY.map((week, idx) => {
                const isCurrent = idx === HISTORY.length - 1;
                return (
                  <div key={idx} className="flex flex-col items-stretch gap-1">
                    <div className="flex flex-col gap-0.5">
                      {week.map((s, i) => (
                        <div key={i} className={`h-2 rounded-sm ${SegColor(s)}`} />
                      ))}
                    </div>
                    <div
                      className={`text-[10px] text-center mt-1 ${
                        isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      W{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mt-4">
              Tongue lighting flagged in{" "}
              <span className="text-warning font-medium">2 of your last 6 scans</span> · worth checking your usual scan environment.
            </p>
          </div>
        </section>

        {/* Practice & tutorials */}
        <button
          onClick={() => navigate("/detect/practice")}
          className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/30 active:scale-[0.98] transition-all"
          aria-label="Open Practice and tutorials"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Practice & tutorials</div>
            <p className="text-xs text-muted-foreground">Get cleaner captures across all 5 modalities</p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-display font-medium text-primary bg-primary/10 rounded-full px-2.5 py-1">
            Open <ChevronRight className="w-3 h-3" />
          </span>
        </button>

        {/* Coach prompt */}
        <button
          onClick={() => navigate("/ai-coach?context=capture-quality-week-6")}
          className="glass-card p-3 w-full flex items-center gap-3 text-left bg-primary/5 border-primary/20 active:scale-[0.98] transition-transform"
          aria-label="Ask coach: should I retake or wait until next week?"
        >
          <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <span className="flex-1 text-xs text-foreground">
            Should I retake or wait until next week?
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default CaptureDetail;
