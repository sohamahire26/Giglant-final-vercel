"use client";

import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Loader2, FolderPlus, Lock, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

const CreateProject = () => {
  const { user, session, profile, loading: authLoading, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [workType, setWorkType] = useState("general");
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // If profile is missing but user is logged in, try one automatic refresh
  useEffect(() => {
    if (!authLoading && session && !profile && !retrying) {
      setRetrying(true);
      refreshProfile().finally(() => setRetrying(false));
    }
  }, [authLoading, session, profile, refreshProfile, retrying]);

  if (authLoading || retrying) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (!profile) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-bold">Profile Error</h1>
          <p className="text-muted-foreground text-center max-w-xs">We couldn't load your account details. This usually happens right after signing up while your profile is being prepared.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Layout>
    );
  }

  const isPro = profile.plan_type === 'pro';
  const totalCreated = profile.total_projects_created || 0;
  const lifetimeLimitReached = !isPro && totalCreated >= 1;

  const handleCreate = async () => {
    if (lifetimeLimitReached) {
      toast({ 
        title: "Lifetime Limit Reached", 
        description: "Free accounts are limited to 1 lifetime project creation.",
        variant: "destructive" 
      });
      return;
    }

    if (!name.trim()) {
      toast({ title: "Project name is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: name.trim(),
          client_name: clientName.trim() || null,
          description: description.trim() || null,
          work_type: workType,
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ total_projects_created: totalCreated + 1 })
        .eq("id", user?.id);

      if (profileError) {
        console.error("Failed to update creation counter:", profileError);
      }

      await refreshProfile();
      navigate(`/project/${data.id}`, { state: { isNew: true } });
    } catch (err: any) {
      toast({ title: "Failed to create project", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (lifetimeLimitReached) {
    return (
      <Layout>
        <SEOHead title="Limit Reached — Giglant" description="You have reached your lifetime project limit." />
        <section className="section-padding">
          <div className="container-tight max-w-lg">
            <div className="rounded-3xl border border-amber-500/20 bg-card p-12 text-center shadow-xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <Lock size={40} />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Lifetime Limit Reached</h1>
              <p className="mt-4 text-muted-foreground">
                Free accounts are limited to <strong>1 lifetime project creation</strong>. 
                Even if you delete your project or it expires, the limit remains.
              </p>
              <div className="mt-10 space-y-4">
                <Button asChild className="w-full py-8 text-lg font-bold shadow-lg shadow-primary/20">
                  <Link to="/pricing">
                    <Sparkles className="mr-2 h-5 w-5" /> Upgrade to Pro for Unlimited
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full">
                  <Link to="/dashboard">Back to Dashboard</Link>
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
      <SEOHead title="Create Project — Giglant" description="Create a new freelancer project workspace." />
      <section className="section-padding">
        <div className="container-tight max-w-lg">
          <div className="mb-8 text-center">
            <FolderPlus className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Create Project</h1>
            <p className="mt-2 text-muted-foreground">Set up your one-time free workspace</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <div className="rounded-lg bg-primary/5 p-3 text-[11px] text-primary font-medium flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Note: Free accounts get 1 lifetime project creation.
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Project Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Brand Video for Acme Corp"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Client Name <span className="text-muted-foreground">(optional)</span></label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g., Rahul from TechCorp"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Description <span className="text-muted-foreground">(optional)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief project description..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" rows={3} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Work Type</label>
              <div className="flex flex-wrap gap-2">
                {["general", "video", "design", "document", "website"].map(t => (
                  <button key={t} onClick={() => setWorkType(t)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${workType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={loading} className="w-full mt-2">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Project
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CreateProject;