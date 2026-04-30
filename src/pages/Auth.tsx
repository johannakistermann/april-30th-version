import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Mail } from "lucide-react";


const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-display font-bold tracking-tight">
            THE <span className="text-primary">FIELD</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            No password needed — we'll send you a magic link
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-display font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We sent a sign-in link to <span className="text-foreground font-medium">{email}</span>. Click the link in the email to continue.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-sm text-primary font-medium"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <Button
              onClick={handleGoogle}
              disabled={googleLoading}
              variant="outline"
              className="w-full h-12 font-display font-semibold gap-3"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted border-border/50 h-12"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full h-12 font-display font-semibold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Magic Link"}
              </Button>
            </form>
          </>
        )}

        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground mx-auto">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={() => {
            localStorage.setItem("dev-bypass-auth", "true");
            navigate("/dashboard");
          }}
          className="text-xs text-muted-foreground/40 mx-auto hover:text-muted-foreground"
        >
          Skip to Dashboard (dev)
        </button>
      </div>
    </div>
  );
};

export default Auth;
