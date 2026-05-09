"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const ResetPassword = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // States for "Forgot Password" (Logged out)
  const [email, setEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  // States for "Change Password" (Logged in)
  const [newPassword, setNewPassword] = useState("");
  const [isForgot, setIsForgot] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // If user is signed in, show password change form
    if (session?.user) {
      setIsForgot(false);
    }
  }, [session]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Correct Supabase method for sending reset link
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setConfirmationEmail(email);
      setRequestSent(true);
      toast({
        title: "Reset link sent!",
        description: "Check your inbox for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast({
        title: "Missing password",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({
        title: "Password updated!",
        description: "Your password has been changed successfully.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !requestSent) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Scenario 1: User is logged in -> Change Password Form
  if (session && !isForgot) {
    return (
      <Layout>
        <SEOHead title="Change Password — Giglant" description="Update your Giglant account password." />
        <section className="section-padding">
          <div className="container-tight max-w-md">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
              <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-bold text-foreground">Change Password</h1>
                <p className="mt-2 text-sm text-muted-foreground">Update your account password.</p>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border/40 bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <Button type="submit" disabled={loading} variant="secondary" className="w-full font-semibold">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Password
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Scenario 2: User is logged out -> Forgot Password / Reset Request Form
  return (
    <Layout>
      <SEOHead title="Reset Password — Giglant" description="Reset your Giglant account password." />
      <section className="section-padding">
        <div className="container-tight max-w-md">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
            {requestSent ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Check Your Inbox</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We've sent a confirmation link to <strong>{confirmationEmail}</strong>.
                  Please check your inbox (and spam folder).
                </p>
                <Button 
                  onClick={() => { setRequestSent(false); setEmail(""); }}
                  className="mt-4 w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                  Send Again
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h1 className="font-display text-3xl font-bold text-foreground">Reset Your Password</h1>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    variant="secondary"
                    className="w-full font-semibold"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="mt-4 text-sm text-muted-foreground">
                    Already have an account? 
                    <a href="/login" className="text-primary hover:underline">
                      Sign In
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;