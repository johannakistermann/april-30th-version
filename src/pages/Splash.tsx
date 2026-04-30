import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Splash = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [state, setState] = useState<"loading" | "magic-link" | "welcome-back">("loading");
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    setShow(true);
    const hash = window.location.hash;
    const isMagicLink = hash.includes("access_token") || hash.includes("type=magiclink");

    if (isMagicLink) {
      setState("magic-link");
      setTimeout(() => navigate("/dashboard", { replace: true }), 2500);
    } else {
      const decide = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Returning user — fetch display name
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", user.id)
            .maybeSingle();
          setDisplayName(profile?.display_name || user.email?.split("@")[0] || null);
          setState("welcome-back");
          setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
        } else {
          setTimeout(() => navigate("/onboarding", { replace: true }), 2500);
        }
      };
      decide();
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-80 h-80 rounded-full bg-primary/5 animate-breathe" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-60 h-60 rounded-full bg-primary/10 animate-breathe" style={{ animationDelay: "1s" }} />
      </div>

      <div className={`relative z-10 flex flex-col items-center gap-8 transition-all duration-1000 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {state === "magic-link" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-in zoom-in duration-500">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl font-display font-bold tracking-tight">You're in!</h1>
              <p className="text-sm text-muted-foreground">
                Welcome to <span className="text-primary font-semibold">GEM</span>
              </p>
            </div>
            <p className="text-muted-foreground text-sm mt-4 animate-pulse">Loading your dashboard...</p>
          </>
        )}

        {state === "welcome-back" && (
          <>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground font-display">Welcome back</p>
              <h1 className="text-4xl font-display font-bold tracking-tight">
                {displayName ?? ""}
              </h1>
            </div>
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-2xl font-display font-bold tracking-tight">
                THE <span className="text-primary">FIELD</span>
              </h2>
            </div>
            <p className="text-muted-foreground text-sm mt-2 animate-pulse">Loading your dashboard...</p>
          </>
        )}

        {state === "loading" && (
          <>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-5xl font-display font-bold tracking-tight">
                THE <span className="text-primary">FIELD</span>
              </h1>
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground font-display">
                Functional • Integrated • Energy • Longevity • Diagnostics
              </p>
            </div>
            <p className="text-muted-foreground text-sm mt-4 animate-pulse">Loading...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Splash;
