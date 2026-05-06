import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const NUTRIENTS = [
  { name: "Vitamin D", status: "low", source: "Lab Confirmed", color: "text-destructive" },
  { name: "Magnesium", status: "possible low", source: "TCM Pattern", color: "text-warning" },
  { name: "B12", status: "adequate", source: "Lab Confirmed", color: "text-success" },
  { name: "Iron", status: "possible low", source: "Tongue + Voice", color: "text-warning" },
  { name: "Zinc", status: "adequate", source: "Lab Confirmed", color: "text-success" },
  { name: "Omega-3", status: "low", source: "Lab Confirmed", color: "text-destructive" },
];

const DIETARY = [
  "Warming foods — soups, ginger, turmeric (Wood constitution)",
  "Reduce cold/raw foods which tax Spleen energy",
  "Bitter greens to support Liver detox pathways",
  "Fermented foods for gut-immune axis support",
];

const SUPPLEMENTS = [
  { name: "ESR Infoceutical", type: "E4L", desc: "Energetic stress release for Wood types", tag: "Primary" },
  { name: "Liver Driver Infoceutical", type: "E4L", desc: "Supports liver qi flow", tag: "Primary" },
  { name: "Vitamin D3 + K2", type: "PRL", desc: "Address confirmed deficiency", tag: "Secondary" },
];

const Nutrition = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">Nutrition</h1>
      </div>

      {/* Nutrient Map */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-display font-semibold mb-3">Nutrient Map</h2>
        <div className="grid grid-cols-2 gap-2">
          {NUTRIENTS.map((n) => (
            <div key={n.name} className="glass-card p-3">
              <p className="text-sm font-medium">{n.name}</p>
              <p className={`text-xs font-display font-medium mt-0.5 capitalize ${n.color}`}>{n.status}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{n.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Recommendations */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-display font-semibold mb-3">Dietary Guidance</h2>
        <div className="glass-card p-4 space-y-3">
          {DIETARY.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-primary text-sm mt-0.5">•</span>
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supplements */}
      <div className="px-6">
        <h2 className="text-sm font-display font-semibold mb-1">Recommended for Your Goals</h2>
        <p className="text-[10px] text-muted-foreground mb-3">Based on your constitution and current scores</p>
        <div className="space-y-3">
          {SUPPLEMENTS.map((s, i) => (
            <div key={i} className="glass-card p-4 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.tag === "Primary" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {s.tag}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl">
                <ShoppingBag className="w-3 h-3 mr-1" /> View
              </Button>
            </div>
          ))}
        </div>
      </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default Nutrition;
