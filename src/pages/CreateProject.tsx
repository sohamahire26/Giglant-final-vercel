"use client";

import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader2, FolderPlus } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

const CreateProject = () => {
  const { user, session, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [workType, setWorkType] = useState("general");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (authLoading) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!session) return <Navigate to="/login" replace />;

  const handleCreate = async () => {
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
      navigate(`/project/${data.id}`);
    } catch (err: any) {
      toast({ title: "Failed to create project", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Layout>
      <SEOHead title="Create Project — Giglant" description="Create a new freelancer project workspace to manage files, feedback, delivery, and invoices." />
      <section className="section-padding">
        <div className="container-tight max-w-lg">
          <div className="mb-8 text-center">
            <FolderPlus className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Create Project</h1>
            <p className="mt-2 text-muted-foreground">Set up a workspace for your freelance project</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
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