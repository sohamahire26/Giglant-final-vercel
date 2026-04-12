"use client";

import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PricingPage = () => {
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tierName: string) => {
    if (!session) {
      window.location.href = "/login";
      return;
    }

    if (tierName !== "Pro") return;

    setLoading(tierName);
    console.log("Starting checkout process for Pro...");
    
    try {
      const STORE_ID = "342733";
      const VARIANT_ID = "1519635";

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          variantId: VARIANT_ID,
          storeId: STORE_ID
        }
      });

      if (error) {
        console.error("Function invocation error:", error);
        throw error;
      }

      if (data?.url) {
        console.log("Redirecting to checkout:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error: any) {
      console.error('Checkout error details:', error);
      toast({
        title: "Subscription Error",
        description: error.message || "Could not start checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(null); // Reset loading immediately on error
    } finally {
      // We don't reset loading here if we're redirecting, 
      // but we do it in the catch block for errors.
      // If it's still loading after a few seconds, something is wrong.
      setTimeout(() => setLoading(null), 10000); 
    }
  };

  const tiers = [
    {
      name: "Guest",
      price: "$0",
      description: "Quick tools for one-off tasks.",
      features: [
        "AI File Renamer access",
        "No account required",
        "Browser-based processing",
        "Standard support"
      ],
      cta: "Use Tools",
      href: "/tools",
      variant: "outline" as const,
    },
    {
      name: "Free",
      price: "$0",
      description: "Perfect for single active projects.",
      features: [
        "1 Active Project workspace",
        "7-day project active window",
        "Client review magic link",
        "Timestamped feedback",
        "Revision checklist",
        "AI Delivery assistant"
      ],
      cta: session ? "Current Plan" : "Sign Up Free",
      href: session ? "/dashboard" : "/login",
      variant: (profile?.plan_type === 'free' ? "secondary" : "default") as any,
      highlight: true,
    },
    {
      name: "Pro",
      price: "$5",
      period: "/month",
      description: "Unlimited power for busy freelancers.",
      features: [
        "Unlimited Project workspaces",
        "60-day project active window",
        "Priority AI processing",
        "Advanced AI Invoice assistant",
        "Custom branding (Coming soon)",
        "Priority support"
      ],
      cta: "Upgrade to Pro",
      href: "#",
      variant: "default" as const,
      isPro: true,
    }
  ];

  return (
    <Layout>
      <SEOHead 
        title="Pricing — Giglant Video Editing Workflow Tools" 
        description="Choose the right plan for your freelance workflow. From free AI tools to unlimited project workspaces." 
      />
      <section className="section-padding hero-bg">
        <div className="container-tight">
          <div className="mb-16 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-6xl">Simple, Transparent <span className="text-primary">Pricing</span></h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Start for free and upgrade as your freelance business grows. No hidden fees, just tools that work.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div 
                key={tier.name} 
                className={`relative flex flex-col rounded-3xl border p-8 transition-all ${
                  tier.highlight 
                    ? "border-primary bg-card shadow-xl shadow-primary/5 scale-105 z-10" 
                    : "border-border bg-card/50 backdrop-blur-sm hover:border-primary/50"
                }`}
              >
                {tier.isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> MOST POPULAR
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="font-display text-xl font-bold text-foreground">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="mb-8 space-y-4 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {tier.name === "Pro" ? (
                  <Button 
                    onClick={() => handleSubscribe(tier.name)}
                    variant={tier.variant} 
                    className={`w-full py-6 text-base font-bold ${tier.highlight ? "shadow-lg shadow-primary/20" : ""}`}
                    disabled={loading === tier.name || profile?.plan_type === 'pro'}
                  >
                    {loading === tier.name ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {profile?.plan_type === 'pro' ? "Current Plan" : tier.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    asChild 
                    variant={tier.variant} 
                    className={`w-full py-6 text-base font-bold ${tier.highlight ? "shadow-lg shadow-primary/20" : ""}`}
                    disabled={tier.name === "Free" && profile?.plan_type === 'free'}
                  >
                    <Link to={tier.href}>
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="font-display font-bold">Instant Access</h4>
              <p className="mt-2 text-sm text-muted-foreground">No long forms. Start using tools in seconds.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="font-display font-bold">Secure Payments</h4>
              <p className="mt-2 text-sm text-muted-foreground">Processed securely via Lemon Squeezy.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="font-display font-bold">AI Powered</h4>
              <p className="mt-2 text-sm text-muted-foreground">Smart assistants for every part of your workflow.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PricingPage;