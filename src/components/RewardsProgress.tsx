import { useEffect, useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MILESTONE = 30;

const RewardsProgress = () => {
  const [count, setCount] = useState(0);
  const [reward, setReward] = useState<{ id: string; status: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("interaction_count")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) setCount(profile.interaction_count);

      const { data: rewards } = await supabase
        .from("rewards")
        .select("id, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (rewards && rewards.length > 0) setReward(rewards[0]);
    };

    load();

    // Listen for realtime updates
    const channel = supabase
      .channel("profile-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload) => {
        if (payload.new && (payload.new as any).user_id === userId) {
          setCount((payload.new as any).interaction_count);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  if (!userId) return null;

  const progress = Math.min(count, MILESTONE);
  const percentage = (progress / MILESTONE) * 100;
  const hasReward = reward?.status === "claimable";

  if (hasReward) {
    return (
      <div className="glass-card p-3 flex items-center gap-3 w-full text-left">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display font-semibold text-primary">$5 Credit Earned! 🎉</p>
          <p className="text-[11px] text-muted-foreground">Reward unlocked</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-display font-medium">Rewards Progress — Earn $5 Shop Credit</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{progress}/{MILESTONE}</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {MILESTONE - progress} more interaction{MILESTONE - progress !== 1 ? "s" : ""} to unlock your reward
      </p>
    </div>
  );
};

export default RewardsProgress;
