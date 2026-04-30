import { useState, useEffect } from "react";
import { ArrowLeft, User, ChevronRight, UserX, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";

interface PractitionerInfo {
  connectionId: string;
  practitionerId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  connectedAt: string;
}

const MyPractitioner = () => {
  const navigate = useNavigate();
  const [practitioner, setPractitioner] = useState<PractitionerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchPractitioner = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: conn } = await supabase
      .from("practitioner_clients")
      .select("id, practitioner_id, connected_at")
      .eq("client_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!conn) {
      setPractitioner(null);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, bio, avatar_url")
      .eq("user_id", conn.practitioner_id)
      .single();

    setPractitioner({
      connectionId: conn.id,
      practitionerId: conn.practitioner_id,
      displayName: profile?.display_name || null,
      bio: (profile as any)?.bio || null,
      avatarUrl: (profile as any)?.avatar_url || null,
      connectedAt: conn.connected_at,
    });
    setLoading(false);
  };

  useEffect(() => { fetchPractitioner(); }, []);

  const handleDisconnect = async () => {
    if (!practitioner) return;
    setDisconnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-client", {
        body: { action: "disconnect", connection_id: practitioner.connectionId },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        toast({ title: "Disconnected from practitioner" });
        setPractitioner(null);
      }
    } catch (err: any) {
      toast({ title: "Failed to disconnect", description: err.message, variant: "destructive" });
    } finally {
      setDisconnecting(false);
      setDisconnectOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">My Practitioner</h1>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-muted-foreground text-sm">Loading...</div>
      ) : practitioner ? (
        <div className="px-6 space-y-4">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {practitioner.avatarUrl ? (
                <img src={practitioner.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-display font-semibold">{practitioner.displayName || "Practitioner"}</p>
              {practitioner.bio && <p className="text-xs text-muted-foreground mt-0.5">{practitioner.bio}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">
                Connected {new Date(practitioner.connectedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/20 hover:bg-destructive/5"
            onClick={() => setDisconnectOpen(true)}
          >
            <UserX className="w-4 h-4 mr-2" />
            End Relationship
          </Button>
        </div>
      ) : (
        <div className="px-6">
          <div className="glass-card p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-display font-bold">No Practitioner Connected</p>
              <p className="text-xs text-muted-foreground mt-1">Find a coach to guide your health journey</p>
            </div>
            <Button onClick={() => navigate("/find-practitioner")} className="gap-2">
              <Search className="w-4 h-4" />
              Work with a Coach
            </Button>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation */}
      <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>End Relationship</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect from {practitioner?.displayName || "your practitioner"}? They will no longer have access to your FIELD data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default MyPractitioner;
