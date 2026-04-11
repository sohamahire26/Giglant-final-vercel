"use client";

import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus, FolderOpen, Clock, ChevronRight, Loader2, Search, Lock, AlertCircle, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const Dashboard = () => {
  const { user, session, profile, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error) {
      const now = new Date().getTime();
      const isPro = profile?.plan_type === 'pro';
      const expiryDays = isPro ? 60 : 15;
      const expiryMs = expiryDays * 24 * 60 * 60 * 1000;

      // Filter out projects that have exceeded their deletion window
      const activeProjects = (data || []).filter(p => {
        const created = new Date(p.created_at).getTime();
        return now - created < expiryMs;
      });
      setProjects(activeProjects);
    }
    setLoading(false);
  };

  if (authLoading) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!session) return <Navigate to="/login" replace />;

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase()))
  );

  const isPro = profile?.plan_type === 'pro';
  const projectLimitReached = !isPro && projects.length >= 1;

  return (
    <Layout>
      <SEOHead title="Dashboard — Giglant" description="Manage your freelance projects and client deliveries." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">My Projects</h1>
              <p className="text-muted-foreground">
                {isPro ? "Unlimited workspaces for your business." : "Manage your active workspace."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isPro && (
                <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
                  <Link to="/pricing"><Sparkles className="mr-2 h-4 w-4" /> Upgrade to Pro</Link>
                </Button>
              )}
              <Button asChild size="lg" className="shadow-lg shadow-primary/20" disabled={projectLimitReached}>
                {projectLimitReached ? (
                  <Link to="/pricing"><Lock className="mr-2 h-5 w-5" /> Limit Reached</Link>
                ) : (
                  <Link to="/projects/new"><Plus className="mr-2 h-5 w-5" /> New Project</Link>
                )}
              </Button>
            </div>
          </div>

          {projectLimitReached && (
            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Free Plan Limit Reached</p>
                <p className="text-xs text-amber-700">You can only have 1 active project on the Free plan. Upgrade to Pro for unlimited projects and longer storage.</p>
              </div>
            </div>
          )}

          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none shadow-sm"
            />
          </div>

          {loading ? (
            <div className="flex py-20 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid gap-4">
              {filteredProjects.map((project) => {
                const created = new Date(project.created_at).getTime();
                const now = new Date().getTime();
                const diffDays = (now - created) / (1000 * 60 * 60 * 24);
                const isLocked = !isPro && diffDays > 7;

                return (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className={`group flex items-center justify-between rounded-2xl border p-5 transition-all ${
                      isLocked 
                        ? "border-amber-500/20 bg-amber-500/5 opacity-80" 
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                        isLocked 
                          ? "bg-amber-500/20 text-amber-600" 
                          : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                      }`}>
                        {isLocked ? <Lock size={24} /> : <FolderOpen size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-foreground">{project.name}</h3>
                          {isLocked && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">LOCKED</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(project.created_at).toLocaleDateString()}</span>
                          {project.client_name && <span className="rounded-full bg-secondary px-2 py-0.5">Client: {project.client_name}</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FolderOpen size={32} />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">No projects found</h2>
              <p className="mt-2 text-muted-foreground">Create your first project to start managing your workflow.</p>
              <Button asChild className="mt-6" variant="outline" disabled={projectLimitReached}>
                <Link to="/projects/new">Create Project</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;