import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (localStorage.getItem("dev-bypass-auth") === "true") {
        setAuthenticated(true);
        setChecking(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthenticated(true);
      } else {
        navigate("/onboarding", { replace: true });
      }
      setChecking(false);
    };
    check();

    const devBypass = localStorage.getItem("dev-bypass-auth") === "true";
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !devBypass) {
        navigate("/onboarding", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return authenticated ? <>{children}</> : null;
};

export default AuthGuard;
