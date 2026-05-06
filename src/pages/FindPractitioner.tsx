import { useState, useEffect } from "react";
import { ArrowLeft, User, Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";

interface PractitionerProfile {
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

const FindPractitioner = () => {
  const navigate = useNavigate();
  const [practitioners, setPractitioners] = useState<PractitionerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const fetchPractitioners = async () => {
      // Get all practitioner user_ids
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "practitioner");

      if (!roles || roles.length === 0) {
        setPractitioners([]);
        setLoading(false);
        return;
      }

      const practitionerIds = roles.map((r) => r.user_id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, bio, avatar_url")
        .in("user_id", practitionerIds);

      setPractitioners(
        (profiles || []).map((p) => ({
          userId: p.user_id,
          displayName: p.display_name,
          bio: (p as any).bio || null,
          avatarUrl: (p as any).avatar_url || null,
        }))
      );
      setLoading(false);
    };
    fetchPractitioners();
  }, []);

  const handleConnect = async (practitionerId: string) => {
    setConnecting(practitionerId);
    try {
      const { data, error } = await supabase.functions.invoke("invite-client", {
        body: { action: "connect", practitioner_id: practitionerId },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        toast({ title: "Connected!", description: "You are now linked with your practitioner." });
        navigate("/my-practitioner");
      }
    } catch (err: any) {
      toast({ title: "Failed to connect", description: err.message, variant: "destructive" });
    } finally {
      setConnecting(null);
    }
  };

  const handleAutoAssign = () => {
    if (practitioners.length === 0) {
      toast({ title: "No practitioners available", variant: "destructive" });
      return;
    }
    // Pick a random practitioner
    const random = practitioners[Math.floor(Math.random() * practitioners.length)];
    handleConnect(random.userId);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold flex-1">Find a Practitioner</h1>
      </div>

      {/* Auto-assign CTA */}
      <div className="px-6 mb-4">
        <button
          onClick={handleAutoAssign}
          disabled={loading || practitioners.length === 0}
          className="glass-card p-4 w-full flex items-center gap-3 text-left border-primary/20 hover:border-primary/40 transition-colors disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-display font-semibold">Auto-assign a Coach</p>
            <p className="text-xs text-muted-foreground">We'll match you with an available practitioner</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-6 mb-3">
        <p className="text-xs text-muted-foreground font-display font-medium uppercase tracking-wider">
          Or browse practitioners
        </p>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-muted-foreground text-sm">Loading...</div>
      ) : practitioners.length === 0 ? (
        <div className="px-6">
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground">No practitioners available at this time</p>
          </div>
        </div>
      ) : (
        <div className="px-6 space-y-2">
          {practitioners.map((p) => (
            <div key={p.userId} className="glass-card p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-semibold">{p.displayName || "Practitioner"}</p>
                {p.bio && <p className="text-xs text-muted-foreground line-clamp-2">{p.bio}</p>}
              </div>
              <Button
                size="sm"
                onClick={() => handleConnect(p.userId)}
                disabled={connecting === p.userId}
              >
                {connecting === p.userId ? "..." : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      )}

      </div>
      <BottomNav />
    </div>
  );
};

export default FindPractitioner;
