// Dev-only floating toggle for the mock subscription tier.
import { useState } from "react";
import { CreditCard } from "lucide-react";
import { useTier, setTier as setTierFn, type Tier, TIER_LABEL } from "@/lib/subscription/mockTier";

const TIERS: Tier[] = ["free", "consumer", "practitioner"];

const DevTierToggle = () => {
  const { tier } = useTier();
  const [open, setOpen] = useState(false);

  if (!import.meta.env.DEV && localStorage.getItem("dev-bypass-auth") !== "true") return null;

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {open && (
        <div className="glass-card p-2 mb-2 space-y-1">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => { setTierFn(t); setOpen(false); }}
              className={`block w-full text-left px-3 py-1.5 text-xs rounded-lg ${
                tier === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {TIER_LABEL[t]}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        title={`Dev tier: ${TIER_LABEL[tier]}`}
        className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-lg"
      >
        <CreditCard className="w-4 h-4 text-primary" />
      </button>
    </div>
  );
};

export default DevTierToggle;
