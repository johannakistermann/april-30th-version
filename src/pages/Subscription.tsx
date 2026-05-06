import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, Users, Zap } from "lucide-react";
import { useTier, setTier as setTierFn, type Tier, TIER_LABEL } from "@/lib/subscription/mockTier";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const PLANS: { id: Tier; name: string; price: string; tagline: string; features: string[]; icon: any; accent: string }[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    tagline: "Try the Field System",
    features: ["Guest Scan only", "No saved history", "No recommendations"],
    icon: Sparkles,
    accent: "muted-foreground",
  },
  {
    id: "consumer",
    name: "Consumer",
    price: "$24/mo",
    tagline: "Weekly insights & coach",
    features: [
      "Unlimited Weekly Scans",
      "5 weekly Infoceutical recommendations",
      "AI Coach (Aria) with lab uploads",
      "Full pillar history & trends",
    ],
    icon: Zap,
    accent: "primary",
  },
  {
    id: "practitioner",
    name: "Practitioner",
    price: "$97/mo",
    tagline: "Run your practice",
    features: [
      "Everything in Consumer",
      "82-candidate signature pool",
      "Client management console",
      "Manual recommendation overrides",
      "Revenue share on client purchases",
    ],
    icon: Users,
    accent: "success",
  },
];

const Subscription = () => {
  const navigate = useNavigate();
  const { tier } = useTier();

  const select = (id: Tier) => {
    setTierFn(id);
    toast({
      title: "Mock tier change — no payment processed",
      description: `You are now on the ${TIER_LABEL[id]} plan (demo only).`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-12 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">Choose your plan</h1>
      </div>

      <div className="mx-6 mb-4 glass-card p-3 border-warning/30 flex items-center gap-2">
        <span className="text-base">🧪</span>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Demo billing — Stripe not connected. Selecting a plan only updates the mock tier locally.
        </p>
      </div>

      <div className="px-6 space-y-3">
        {PLANS.map((p) => {
          const isCurrent = tier === p.id;
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              className={`glass-card p-5 ${isCurrent ? `border-${p.accent}/40` : ""}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-${p.accent}/10 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 text-${p.accent}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-display font-bold">{p.name}</p>
                    {isCurrent && (
                      <span className="text-[9px] uppercase tracking-wider bg-primary/15 text-primary px-1.5 py-0.5 rounded font-display">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.tagline}</p>
                </div>
                <p className="text-base font-display font-bold">{p.price}</p>
              </div>

              <ul className="space-y-1.5 mb-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-foreground/80">
                    <Check className={`w-3 h-3 text-${p.accent} mt-0.5 flex-shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                onClick={() => select(p.id)}
                className={`w-full py-2.5 rounded-xl text-sm font-display font-medium transition-colors ${
                  isCurrent
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                }`}
              >
                {isCurrent ? "Current plan" : `Select ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default Subscription;
