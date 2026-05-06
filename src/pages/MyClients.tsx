import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Mail, Clock, CheckCircle2, Users, ChevronRight, XCircle, Watch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import TopMenu from "@/components/TopMenu";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";
import { formatGemSyncLabel } from "@/lib/gem/syncClock";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

interface ClientConnection {
  id: string;
  client_id: string;
  connected_at: string;
  status: string;
  profiles?: { display_name: string | null };
  email?: string;
  last_scan?: string;
  has_gem?: boolean;
  gem_last_sync?: string;
}

interface Invitation {
  id: string;
  client_email: string;
  status: string;
  created_at: string;
}

const SAMPLE_CLIENTS: ClientConnection[] = [
  { id: "s1", client_id: "sc1", connected_at: "2026-01-15", status: "active", profiles: { display_name: "Sarah Chen" }, email: "sarah.chen@email.com", last_scan: "2026-03-12", has_gem: true, gem_last_sync: "2026-03-15T09:30:00" },
  { id: "s2", client_id: "sc2", connected_at: "2026-02-01", status: "active", profiles: { display_name: "Marcus Williams" }, email: "marcus.w@email.com", last_scan: "2026-03-10", has_gem: true, gem_last_sync: "2026-03-14T18:00:00" },
  { id: "s3", client_id: "sc3", connected_at: "2026-01-20", status: "active", profiles: { display_name: "Elena Rodriguez" }, email: "elena.r@email.com", last_scan: "2026-03-08", has_gem: false },
  { id: "s4", client_id: "sc4", connected_at: "2026-02-10", status: "active", profiles: { display_name: "James Park" }, email: "james.park@email.com", last_scan: "2026-03-01", has_gem: true, gem_last_sync: "2026-03-10T12:00:00" },
  { id: "s5", client_id: "sc5", connected_at: "2025-12-05", status: "active", profiles: { display_name: "Aisha Patel" }, email: "aisha.p@email.com", last_scan: "2026-02-25", has_gem: false },
];

const MyClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientConnection[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const devBypass = localStorage.getItem("dev-bypass-auth") === "true";
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !devBypass) return;
    if (!user) { setLoading(false); return; }

    const [clientsRes, invitesRes] = await Promise.all([
      supabase
        .from("practitioner_clients")
        .select("id, client_id, connected_at, status")
        .eq("practitioner_id", user.id),
      supabase
        .from("client_invitations")
        .select("id, client_email, status, created_at")
        .eq("practitioner_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    // Fetch profiles for connected clients
    const allClients = clientsRes.data || [];
    if (allClients.length > 0) {
      const clientIds = allClients.map((c) => c.client_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", clientIds);

      const enriched = allClients.map((c) => ({
        ...c,
        profiles: profiles?.find((p) => p.user_id === c.client_id),
      }));
      setClients(enriched);
    } else {
      setClients([]);
    }

    setInvitations(invitesRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-client", {
        body: { client_email: email.trim() },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        toast({ title: "Invitation sent!", description: `Sent to ${email.trim()}` });
        setEmail("");
        setDialogOpen(false);
        fetchData();
      }
    } catch (err: any) {
      toast({ title: "Failed to send invitation", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const isDevBypass = localStorage.getItem("dev-bypass-auth") === "true";
  const activeClients = clients.filter((c) => c.status === "active");
  const displayClients = activeClients.length > 0 ? activeClients : (isDevBypass ? SAMPLE_CLIENTS : []);
  const endedClients = clients.filter((c) => c.status === "ended");
  const pendingInvites = invitations.filter((i) => i.status === "pending");

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const statusBadge = (status: string) => {
    if (status === "active") return <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full">Active</span>;
    if (status === "ended") return <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Ended</span>;
    return <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Pending</span>;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopMenu />
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-display font-semibold flex-1">My Clients</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <UserPlus className="w-4 h-4" />
          Invite Client
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-muted-foreground text-sm">Loading...</div>
      ) : (
        <div className="px-6 space-y-6">
          {/* Active Clients */}
          <section>
            <h2 className="text-sm font-display font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Clients ({displayClients.length})
            </h2>
            {displayClients.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-muted-foreground">No connected clients yet</p>
                <p className="text-xs text-muted-foreground mt-1">Invite clients to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayClients.map((client) => {
                  const name = client.profiles?.display_name || "Client";
                  return (
                    <div key={client.id} className="glass-card p-4 w-full flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {getInitials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{client.email || "—"}</p>
                        {client.last_scan && (
                          <p className="text-[10px] text-muted-foreground">
                            Last scan: {new Date(client.last_scan).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Watch className="w-3 h-3" style={{ color: client.has_gem ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))' }} />
                          {client.has_gem ? (
                            <span className="text-[10px] text-success">
                              GEM synced {client.gem_last_sync
                                ? new Date(client.gem_last_sync).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                : "—"}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">No GEM</span>
                          )}
                        </div>
                      </div>
                      {statusBadge("active")}
                      <Button size="sm" variant="outline" onClick={() => navigate(`/clients/${client.client_id}`)}>
                        View
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <section>
              <h2 className="text-sm font-display font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Invitations ({pendingInvites.length})
              </h2>
              <div className="space-y-2">
                {pendingInvites.map((inv) => (
                  <div key={inv.id} className="glass-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{inv.client_email}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Sent {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {statusBadge("pending")}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ended (archived) */}
          {endedClients.length > 0 && (
            <section>
              <h2 className="text-sm font-display font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Archived ({endedClients.length})
              </h2>
              <div className="space-y-2 opacity-50">
                {endedClients.map((client) => (
                  <div key={client.id} className="glass-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">{client.profiles?.display_name || "Client"}</p>
                    </div>
                    {statusBadge("ended")}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite a Client</DialogTitle>
            <DialogDescription>
              Enter your client's email address. They'll receive an invitation to connect with you.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            placeholder="client@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={sending}>
              {sending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
      <BottomNav />
    </div>
  );
};

export default MyClients;
