import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GuestResults = () => {
  const navigate = useNavigate();

  const predictions = [
    { question: "Do you get afternoon energy crashes?", correct: true, pattern: "Spleen Damp" },
    { question: "Do you wake between 1–3am?", correct: true, pattern: "Liver Qi Stagnation" },
    { question: "Do you bruise easily?", correct: false, pattern: "Spleen Qi Def" },
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-12 flex flex-col">
      <div className="max-w-sm mx-auto w-full flex flex-col gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold">
            We predicted <span className="text-primary">2/3</span> correctly
          </h1>
          <p className="text-sm text-muted-foreground">From your tongue and voice alone</p>
        </div>

        <div className="space-y-3">
          {predictions.map((p, i) => (
            <div key={i} className="glass-card p-4 flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${p.correct ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                {p.correct ? "✓" : "✗"}
              </div>
              <div>
                <p className="text-sm font-medium">{p.question}</p>
                <p className="text-xs text-muted-foreground mt-1">Pattern: {p.pattern}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Constitution preview */}
        <div className="glass-card p-6 text-center space-y-3 border-primary/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Element</p>
          <p className="text-4xl">🌿</p>
          <p className="text-lg font-display font-semibold text-element-wood">Wood Type</p>
          <p className="text-xs text-muted-foreground">Vision & Drive · Shadow: Frustration</p>
        </div>

        <Button
          onClick={() => navigate("/onboarding")}
          className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground"
        >
          Get Your Full Reading
        </Button>
        <p className="text-xs text-muted-foreground text-center">Download THE FIELD for complete insights</p>
      </div>
    </div>
  );
};

export default GuestResults;
