import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks screen views and AI coach interactions for the rewards system.
 * Each unique page navigation counts as 1 interaction.
 * Call trackInteraction() manually for AI coach prompts.
 */
export function useInteractionTracker() {
  const location = useLocation();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;
    trackInteraction();
  }, [location.pathname]);
}

export async function trackInteraction(): Promise<{ count: number; reward: boolean; milestone_reached?: boolean } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc("increment_interaction", {
    p_user_id: user.id,
  });

  if (error) {
    console.error("Failed to track interaction:", error);
    return null;
  }

  return data as { count: number; reward: boolean; milestone_reached?: boolean };
}
