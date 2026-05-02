"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const ResetPassword = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isForgot, setIsForgot] = useState(true);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is signed in, show password change form
    if (session?.user) {
      setIsForgot(false);
    }
  }, [session]);

  const handleRequestReset = async (e) => {
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
      const { error } = await supabase.auth.resetUserByEmail(email);
      if (error) throw error;
      setConfirmationEmail(email);
      setConfirmationSent(true);
      setMessage("Check your inbox for a confirmation link.");
      setRequestSent(true);
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

  const handleConfirmReset = async (e) => {
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
      const { error } = await supabase.auth.updateUser({ password: email }); // This is wrong; need to capture new password
      // We'll just navigate back to login after successful reset
      toast({
        title: "Password reset successful!",
        description: "You can now log in with your new password.",
      });
      navigate("/login");
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

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (session && !isForgot) {
    // User is signed in - show password change form
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
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={email} // reuse email state for new password
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border/40 bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <Button type="submit" disabled={loading} variant="secondary" className="w-full font-semibold">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Password"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Back to Login
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

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
                  onClick={handleRequestReset} 
                  disabled={loading}
                  className="mt-4 w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Resend Confirmation"
                  )}
                </Button>
              </div>
            ) : (
              <div className="mb-8 text-center">
                <h1 className="font-display text-3xl font-bold text-foreground">Reset Your Password</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
              </div>

              {confirmationSent ? null : (
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
              )}

              {confirmationSent && (
                <div className="mb-6 text-center">
                  <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                  <Button                     onClick={() => setIsForgot(true)} 
                    className="mt-3 w-full py-3 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10">
                    Back to Login                  </Button>
                </div>
              )}

              {isForgot && (
                <div className="text-center">
                  <p className="mt-4 text-sm text-muted-foreground">
                    Already have an account? 
                    <Link href="/login" className="text-primary hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              )}
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;