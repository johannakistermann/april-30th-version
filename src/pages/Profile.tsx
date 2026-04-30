import { ArrowLeft, Watch, Upload, CreditCard, LogOut, ChevronRight, User, Stethoscope, Users, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import { usePractitionerRole } from "@/hooks/usePractitionerRole";
import { toast } from "@/hooks/use-toast";
import { useTier, TIER_LABEL } from "@/lib/subscription/mockTier";

const MENU_ITEMS = [
  { label: "Connect GEM Wearable", icon: Watch, desc: "Pair via Bluetooth", action: true },
  { label: "Upload Blood Labs", icon: Upload, desc: "PDF or photo of lab results", action: true },
  { label: "Subscription", icon: CreditCard, desc: "Free Trial · 23 days left", action: true },
  { label: "Export My Data", icon: Upload, desc: "GDPR/CCPA compliant", action: true },
];

const Profile = () => {
  const navigate = useNavigate();
  const { isPractitioner, loading: roleLoading, togglePractitioner } = usePractitionerRole();
  const { tier } = useTier();

  const handleTogglePractitioner = async () => {
    const wasAlreadyPractitioner = isPractitioner;
    const error = await togglePractitioner();
    if (error) {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    } else if (!wasAlreadyPractitioner) {
      toast({ title: "Practitioner mode enabled!", description: "You can now manage clients." });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-6 flex items-center gap-3">
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/home")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">Profile & Settings</h1>
      </div>

      {/* User card */}
      <div className="px-6 mb-6">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-display font-semibold">Alex Johnson</p>
            <p className="text-xs text-muted-foreground">alex@email.com</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] bg-element-wood/20 text-element-wood px-2 py-0.5 rounded-full">🌿 Wood</span>
              <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full">⏳ -3.2y</span>
              <button
                onClick={() => navigate("/subscription")}
                className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-display font-medium hover:bg-primary/25"
              >
                {TIER_LABEL[tier]}
              </button>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Stats row */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Scans", value: "34" },
            { label: "Streak", value: "7d" },
            { label: "Member", value: "6w" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-3 text-center">
              <p className="text-lg font-display font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-6 space-y-2">
        {MENU_ITEMS.map((item) => {
          const onClick = item.label === "Subscription" ? () => navigate("/subscription") : undefined;
          return (
            <button
              key={item.label}
              onClick={onClick}
              className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.label === "Subscription" ? `Current: ${TIER_LABEL[tier]} · Mock` : item.desc}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {/* Role-based navigation */}
      <div className="px-6 mt-4 space-y-2">
        {isPractitioner ? (
          <button
            onClick={() => navigate("/clients")}
            className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">My Clients</p>
              <p className="text-[10px] text-muted-foreground">Manage your connected clients</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/my-practitioner")}
            className="glass-card p-4 w-full flex items-center gap-3 text-left hover:border-primary/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">My Practitioner</p>
              <p className="text-[10px] text-muted-foreground">View or find a coach</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Practitioner Toggle */}
      <div className="px-6 mt-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">I am a Practitioner</p>
            <p className="text-[10px] text-muted-foreground">Enable to manage clients</p>
          </div>
          <Switch
            checked={isPractitioner}
            onCheckedChange={handleTogglePractitioner}
            disabled={roleLoading}
          />
        </div>
      </div>

      {/* Sign out */}
      <div className="px-6 mt-6">
        <Button
          variant="ghost"
          className="w-full text-destructive text-sm"
          onClick={async () => {
            localStorage.removeItem("dev-bypass-auth");
            await supabase.auth.signOut();
            navigate("/onboarding");
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Pricing info */}
      <div className="px-6 mt-4">
        <div className="glass-card p-4 border-primary/10 text-center">
          <p className="text-xs text-muted-foreground">Free Trial · 23 days remaining</p>
          <p className="text-xs text-primary mt-1 font-display">$24/month after trial · Cancel anytime</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
