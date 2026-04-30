import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Scan, Sparkles, BookOpen, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NAV_ITEMS = [
  { path: "/scan", icon: Scan, label: "Scan" },
  { path: "/ai-coach", icon: Sparkles, label: "Coach" },
  { path: "/learn", icon: BookOpen, label: "Learn" },
  { path: "/shop", icon: ShoppingBag, label: "Shop" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const devBypass = localStorage.getItem("dev-bypass-auth") === "true";
    if (devBypass) {
      setIsAuthenticated(true);
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => setIsAuthenticated(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              <span className="text-[10px] font-display">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
