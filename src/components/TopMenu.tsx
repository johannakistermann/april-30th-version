import { useLocation, useNavigate } from "react-router-dom";
import { Scan, Shield, Stethoscope, Home, User } from "lucide-react";
import { usePractitionerRole } from "@/hooks/usePractitionerRole";

export type AppMode = "home" | "gem" | "mihealth" | "scan" | "learn" | "correct" | "protect" | "shop" | "clients" | "profile";

const CENTER_ITEMS: { mode: AppMode; label: string; path: string }[] = [
  { mode: "scan", label: "Detect", path: "/dashboard" },
  { mode: "correct", label: "Correct", path: "/correct" },
  { mode: "protect", label: "Protect", path: "/protect" },
];

export function getAppMode(pathname: string): AppMode | null {
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/clients")) return "clients";
  if (pathname.startsWith("/correct")) return "correct";
  if (pathname.startsWith("/protect")) return "protect";
  if (pathname.startsWith("/gem")) return "gem";
  if (pathname.startsWith("/mihealth")) return "mihealth";
  if (pathname.startsWith("/learn")) return "learn";
  if (pathname.startsWith("/leaderboards")) return "home";
  if (pathname.startsWith("/shop")) return "shop";
  if (pathname.startsWith("/mirror-check") || pathname.startsWith("/deep-scan") || pathname.startsWith("/bookings") || pathname.startsWith("/results") || pathname.startsWith("/dashboard")) return "scan";
  return null;
}

function isDetectFamily(mode: AppMode | null) {
  return mode === "scan" || mode === "gem";
}

function isCorrectFamily(mode: AppMode | null) {
  return mode === "correct" || mode === "mihealth";
}

const TopMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentMode = getAppMode(location.pathname);
  const { isPractitioner } = usePractitionerRole();

  const centerItems = [
    ...CENTER_ITEMS,
    ...(isPractitioner ? [{ mode: "clients" as AppMode, label: "My Clients", path: "/clients" }] : []),
  ];

  const isHomeActive = currentMode === "home";
  const isProfileActive = currentMode === "profile";

  return (
    <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
      <div className="w-full max-w-5xl mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between">
          {/* Left — Home */}
          <button
            onClick={() => navigate("/home")}
            className={`flex items-center gap-1.5 px-3 py-3 transition-colors flex-shrink-0 ${
              isHomeActive ? "text-primary" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-display font-medium">Home</span>
          </button>

          {/* Center — Detect, Correct, Protect */}
          <nav className="flex items-center gap-0.5">
            {centerItems.map((item) => {
              const familyCheck = item.mode === "scan" ? isDetectFamily : item.mode === "correct" ? isCorrectFamily : () => false;
              const isActive = (item.mode === "scan" || item.mode === "correct")
                ? familyCheck(currentMode)
                : currentMode === item.mode;

              return (
                <button
                  key={item.mode}
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center justify-center px-3 py-3 md:px-4 transition-colors whitespace-nowrap ${
                    isActive ? "text-primary" : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <span className="text-xs md:text-sm font-display font-medium">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 md:w-full h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right — Profile */}
          <button
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-1.5 px-3 py-3 transition-colors flex-shrink-0 ${
              isProfileActive ? "text-primary" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-display font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
