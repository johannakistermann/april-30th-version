import { useEffect, useState } from "react";
import { Lock, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getWeeklyRecs, type WeeklyRec } from "@/lib/recommendations/mockRecommendations";
import { useTier } from "@/lib/subscription/mockTier";
import { useNavigate } from "react-router-dom";

const SOURCE_COLOR: Record<WeeklyRec["witnessSource"], string> = {
  voice: "bg-info/15 text-info",
  tongue: "bg-element-fire/15 text-element-fire",
  face: "bg-element-wood/15 text-element-wood",
  hrv: "bg-success/15 text-success",
};

const CONF_DOT: Record<WeeklyRec["confidence"], string> = {
  High: "bg-success",
  Medium: "bg-warning",
  Low: "bg-muted-foreground",
};

interface Props {
  hasScan: boolean;
}

const WeeklyRecsCard = ({ hasScan }: Props) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("guest-anon");
  const { tier } = useTier();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
      else if (localStorage.getItem("dev-bypass-auth") === "true") setUserId("dev-bypass-user");
    });
  }, []);

  const recs = getWeeklyRecs(userId);
  const locked = tier === "free";

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-sm font-display font-semibold">Your 5 Weekly Infoceuticals</p>
        </div>
        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-display">
          Mock
        </span>
      </div>

      {!hasScan ? (
        <div className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Take a Weekly Scan to unlock recommendations.
          </p>
        </div>
      ) : (
        <>
          <div className={`space-y-2 ${locked ? "blur-sm pointer-events-none select-none" : ""}`}>
            {recs.map((r) => (
              <div key={r.id} className="flex items-start gap-2.5 py-2 border-b border-border/30 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium leading-tight">{r.name}</p>
                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${SOURCE_COLOR[r.witnessSource]}`}>
                      {r.witnessSource}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${CONF_DOT[r.confidence]}`} />
                      <span className="text-[9px] text-muted-foreground">{r.confidence}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{r.rationale}</p>
                </div>
                <button
                  disabled
                  className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border/40 rounded-lg px-2 py-1 opacity-50"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            ))}
          </div>
          {locked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs font-display font-semibold mb-1">Upgrade to Consumer</p>
              <p className="text-[10px] text-muted-foreground mb-3">See your 5 weekly recs</p>
              <button
                onClick={() => navigate("/subscription")}
                className="text-xs bg-primary text-primary-foreground px-4 py-1.5 rounded-xl font-display font-medium"
              >
                View plans
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeeklyRecsCard;
