import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invitationId = searchParams.get("invitation_id");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "auth_required">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const accept = async () => {
      if (!invitationId) {
        setStatus("error");
        setMessage("Invalid invitation link");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("auth_required");
        setMessage("Please sign in or create an account to accept this invitation");
        return;
      }

      // Fetch the invitation using service-side logic
      // Since client can't read invitations (RLS), we check by trying to create the connection
      // We use an RPC or direct insert approach
      
      // First, let's try to create the practitioner_clients row
      // We need the practitioner_id from the invitation - but client can't read it
      // So we'll use a database function for this

      // For now, use a simpler approach: call an edge function or use admin
      // Actually, let's create a simple accept flow using the client
      // The invitation table only allows practitioner to read, so we need a function
      
      try {
        const { data, error } = await supabase.functions.invoke("invite-client", {
          body: { action: "accept", invitation_id: invitationId },
        });

        // The edge function doesn't handle accept yet - let's use a direct approach
        // We'll add accept logic to the edge function
        if (error) throw error;
        
        if (data?.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage("You're now connected with your practitioner!");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Failed to accept invitation");
      }
    };

    accept();
  }, [invitationId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <p className="text-sm text-muted-foreground">Accepting invitation...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-lg font-display font-semibold">Connected!</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button onClick={() => navigate("/dashboard")} className="w-full mt-4">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-lg font-display font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full mt-4">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "auth_required" && (
          <>
            <h2 className="text-lg font-display font-semibold">Sign in Required</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button
              onClick={() => navigate(`/auth?redirect=/accept-invite?invitation_id=${invitationId}`)}
              className="w-full mt-4"
            >
              Sign In / Create Account
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
