"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus, FolderOpen, Clock, ChevronRight, Loader2, Search, Lock, AlertCircle, Sparkles, RefreshCw, Archive } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { isProjectLocked } from "@/components/workspace/types";

const Dashboard = () => {
  const { user, session, profile, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProjects = useCallback(async (silent = false) => {
    if (!user) return;
    
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setProjects(data);
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching projects:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else if (!authLoading && !session) {
      setLoading(false);
    }
  }, [user, authLoading, session, fetchProjects]);

  if (authLoading && projects.length === 0) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!session && !authLoading) return <Navigate to="/login" replace />;

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase()))
  );

  const isPro = profile?.plan_type === 'pro';
  const totalCreated = profile?.total_projects_created || 0;
  const lifetimeLimitReached = !isPro && totalCreated >= 1;

  return (
    <Layout>
      <SEOHead title="Dashboard — Giglant" description="Manage your freelance projects and client deliveries." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-foreground">My Projects</h1>
                {isPro && (
                  <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white">
                    <Sparkles size={10} /> PRO UNLIMITED
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">
                {isPro 
                  ? "You have unlimited workspaces for your business." 
                  : `Free Plan: ${totalCreated}/1 lifetime project created.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchProjects(true)} 
                disabled={isRefreshing}
                className="text-muted-foreground"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              {!isPro && (
                <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
                  <Link to="/pricing"><Sparkles className="mr-2 h-4 w-4" /> Upgrade to Pro</Link>
                </Button>
              )}
              <Button asChild size="lg" className="shadow-lg shadow-primary/20" disabled={lifetimeLimitReached}>
                {lifetimeLimitReached ? (
                  <Link to="/pricing"><Lock className="mr-2 h-5 w-5" /> Limit Reached</Link>
                ) : (
                  <Link to="/projects/new"><Plus className="mr-2 h-5 w-5" /> New Project</Link>
                )}
              </Button>
            </div>
          </div>

          {lifetimeLimitReached && (
            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Lifetime Limit Reached</p>
                <p className="text-xs text-amber-700">Free accounts are limited to 1 lifetime project creation. Upgrade to Pro for unlimited projects and 60-day active windows.</p>
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

          {loading && projects.length === 0 ? (
            <div className="flex py-20 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid gap-4">
              {filteredProjects.map((project) => {
                const isLocked = isProjectLocked(project, isPro ? 'pro' : 'free');

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
                          {isLocked && (
                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">LOCKED</span>
                          )}
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
              <Button asChild className="mt-6" variant="outline" disabled={lifetimeLimitReached}>
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