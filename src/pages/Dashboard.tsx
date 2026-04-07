"use client";

import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus, FolderOpen, Clock, ChevronRight, Loader2, Search } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const Dashboard = () => {
  const { user, session, loading: authLoading } = useAuth();
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

    if (!error) setProjects(data || []);
    setLoading(false);
  };

  if (authLoading) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!session) return <Navigate to="/login" replace />;

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout>
      <SEOHead title="Dashboard — Giglant" description="Manage your freelance projects and client deliveries." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">My Projects</h1>
              <p className="text-muted-foreground">Manage your active workspaces and client feedback.</p>
            </div>
            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
              <Link to="/projects/new"><Plus className="mr-2 h-5 w-5" /> New Project</Link>
            </Button>
          </div>

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
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <FolderOpen size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{project.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(project.created_at).toLocaleDateString()}</span>
                        {project.client_name && <span className="rounded-full bg-secondary px-2 py-0.5">Client: {project.client_name}</span>}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FolderOpen size={32} />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">No projects found</h2>
              <p className="mt-2 text-muted-foreground">Create your first project to start managing your workflow.</p>
              <Button asChild className="mt-6" variant="outline">
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