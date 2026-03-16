import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Briefcase, Loader2 } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function Login() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success", text: string } | null>(null);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: "success", text: "Check your email for the confirmation link." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "An error occurred during authentication." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 shadow-inner">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {isSignUp ? "Create Admin Account" : "Access The Hunt"}
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground/70">
              Personal job tracking pipeline. Provide admin credentials to continue.
            </p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 rounded-lg p-3 text-sm font-medium ${
            message.type === "error"
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-foreground/80">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="h-10 rounded-xl border border-border bg-background/50 px-3 text-[14px] outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-foreground/80">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 rounded-xl border border-border bg-background/50 px-3 text-[14px] outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow mt-2 flex h-10 w-full items-center justify-center rounded-xl bg-primary text-[14px] font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? "Sign Up" : "Log In")}
          </button>
        </form>

        <div className="mt-6 border-t border-border/50 pt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {isSignUp ? "Already have an account? Log in." : "Need an admin account? Sign up."}
          </button>
        </div>
      </div>
    </div>
  );
}
