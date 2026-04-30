import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEV_BYPASS_KEY = "dev-bypass-auth";
const DEV_ROLE_KEY = "dev-practitioner-role";

function isDevBypass() {
  return localStorage.getItem(DEV_BYPASS_KEY) === "true";
}

export function usePractitionerRole() {
  const [isPractitioner, setIsPractitioner] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRole = async () => {
    // Dev bypass: use localStorage for role
    if (isDevBypass()) {
      setIsPractitioner(localStorage.getItem(DEV_ROLE_KEY) === "true");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsPractitioner(false);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "practitioner")
      .maybeSingle();

    setIsPractitioner(!!data);
    setLoading(false);
  };

  useEffect(() => {
    checkRole();

    if (!isDevBypass()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        checkRole();
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const togglePractitioner = async (): Promise<{ message: string } | null> => {
    // Dev bypass: toggle localStorage
    if (isDevBypass()) {
      if (isPractitioner) {
        localStorage.removeItem(DEV_ROLE_KEY);
        setIsPractitioner(false);
      } else {
        localStorage.setItem(DEV_ROLE_KEY, "true");
        setIsPractitioner(true);
      }
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { message: "You must be logged in to change roles" };
    }

    if (isPractitioner) {
      return null; // No removal via client
    }

    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "practitioner" });

    if (!error) {
      setIsPractitioner(true);
      return null;
    }
    return { message: error.message };
  };

  return { isPractitioner, loading, togglePractitioner, refetch: checkRole };
}
