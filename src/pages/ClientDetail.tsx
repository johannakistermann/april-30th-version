import { useState, useEffect } from "react";
import { ArrowLeft, User, UserX, Activity, Heart, Brain, Flame } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";

const MOCK_PILLARS = [
  { name: "Energy", score: 78, icon: Flame, color: "text-success" },
  { name: "Organs", score: 62, icon: Heart, color: "text-warning" },
  { name: "Stress", score: 71, icon: Brain, color: "text-warning" },
  { name: "Metabolic", score: 55, icon: Activity, color: "text-warning" },
];

const ClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<{ displayName: string | null; avatarUrl: string | null; connectedAt: string; connectionId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conn } = await supabase
        .from("practitioner_clients")
        .select("id, client_id, connected_at, status")
        .eq("practitioner_id", user.id)
        .eq("client_id", clientId)
        .eq("status", "active")
        .maybeSingle();

      if (!conn) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", clientId)
        .single();

      setClient({
        displayName: profile?.display_name || null,
        avatarUrl: (profile as any)?.avatar_url || null,
        connectedAt: conn.connected_at,
        connectionId: conn.id,
      });
      setLoading(false);
    };
    fetchClient();
  }, [clientId]);

  const handleRemove = async () => {
    if (!client) return;
    setRemoving(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-client", {
        body: { action: "disconnect", connection_id: client.connectionId },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        toast({ title: "Client removed" });
        navigate("/clients");
      }
    } catch (err: any) {
      toast({ title: "Failed to remove client", description: err.message, variant: "destructive" });
    } finally {
      setRemoving(false);
      setRemoveOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold">Client Detail</h1>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-muted-foreground text-sm">Loading...</div>
      ) : !client ? (
        <div className="px-6">
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Client not found or connection ended</p>
          </div>
        </div>
      ) : (
        <div className="px-6 space-y-4">
          {/* Client info */}
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {client.avatarUrl ? (
                <img src={client.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-display font-semibold">{client.displayName || "Client"}</p>
              <p className="text-[10px] text-muted-foreground">
                Connected {new Date(client.connectedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Health Pillars (read-only mock data) */}
          <div>
            <p className="text-xs text-muted-foreground font-display font-medium uppercase tracking-wider mb-3">
              Health Summary
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_PILLARS.map((pillar) => (
                <div key={pillar.name} className="glass-card p-4 text-center">
                  <pillar.icon className={`w-5 h-5 mx-auto mb-1 ${pillar.color}`} />
                  <p className="text-lg font-display font-bold">{pillar.score}</p>
                  <p className="text-[10px] text-muted-foreground">{pillar.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Remove client */}
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/20 hover:bg-destructive/5"
            onClick={() => setRemoveOpen(true)}
          >
            <UserX className="w-4 h-4 mr-2" />
            Remove Client
          </Button>
        </div>
      )}

      {/* Remove Confirmation */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {client?.displayName || "this client"}? You will lose access to their FIELD data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removing}>
              {removing ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default ClientDetail;
