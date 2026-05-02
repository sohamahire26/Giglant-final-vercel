"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/components/AuthProvider";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

const Login = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"login" | "signup">("login");
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignUpSuccess(false);

    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          // Check if error is about invalid credentials
          if (error.message?.includes("Invalid login") || error.message?.includes("invalid email")) {
            toast({
              title: "Invalid password",
              description: "Please check your email and password.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive",
            });
          }
          throw error;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          setSignUpSuccess(true);
          setConfirmationEmail(email);
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
        }
      }
    } catch (error: any) {
      // Error already toasted in the login branch
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!confirmationEmail) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: confirmationEmail,
      });
      if (error) throw error;
      toast({
        title: "Email resent!",
        description: "Check your inbox for the confirmation link.",
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

  return (
    <Layout>
      <SEOHead 
        title={view === "login" ? "Login — Giglant" : "Sign Up — Giglant"} 
        description="Sign in to your Giglant account to manage your freelance projects." 
      />
      <section className="section-padding">
        <div className="container-tight max-w-md">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
            <div className="mb-8 text-center">
              <h1 className="font-display text-3xl font-bold text-foreground">
                {view === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {view === "login" 
                  ? "Sign in to manage your freelance workflow" 
                  : "Join Giglant to streamline your editing pipeline"}
              </p>
            </div>

            {signUpSuccess && (
              <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="text-sm text-emerald-800">
                    <p className="font-bold">Check your inbox! 🎉</p>
                    <p className="mt-1 opacity-90">
                      We've sent a confirmation link to <strong>{confirmationEmail}</strong>. 
                      Please check your inbox (and spam folder).
                    </p>
                    <button 
                      onClick={handleResendConfirmation}
                      disabled={loading}
                      className="mt-2 text-xs font-medium text-emerald-700 hover:underline disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Didn't receive it? Resend email"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Prominent Google Button */}
              <Button 
                onClick={handleGoogleLogin} 
                disabled={loading}
                variant="default"
                className="w-full py-8 text-lg font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200 border border-gray-200 bg-white hover:bg-gray-50"
              >
                {loading ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-gray-600" />
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-gray-700 font-medium">Continue with Google</span>
                  </div>
                )}
              </Button>

              {/* Subtle Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground/60 font-medium tracking-wider">
                    or use email
                  </span>
                </div>
              </div>

              {/* Subtle Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                      Password
                    </Label>
                    {view === "login" && (
                      <Link 
                        to="/reset-password" 
                        className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                      >
                        Forgot?
                      </Link>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {view === "login" ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => {
                    setView(view === "login" ? "signup" : "login");
                    setSignUpSuccess(false);
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {view === "login" 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
            <AlertCircle className="h-3 w-3" />
            <span>Secure authentication powered by Supabase</span>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;