"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the reset link is valid (session exists from the reset token)
    if (!authLoading && !session) {
      setSessionValid(false);
    }
  }, [session, authLoading]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      navigate("/login");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <SEOHead title="Reset Password — Giglant" description="Securely reset your Giglant account password." />
      <section className="section-padding">
        <div className="container-tight max-w-md">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
            {sessionValid ? (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Lock size={24} />
                  </div>
                  <h1 className="font-display text-3xl font-bold text-foreground">New Password</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Enter a secure new password for your account</p>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-border/40 bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} variant="secondary" className="w-full font-semibold">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Password
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle size={24} />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">Invalid Link</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Button asChild className="mt-6 w-full">
                  <a href="/login">Back to Login</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;