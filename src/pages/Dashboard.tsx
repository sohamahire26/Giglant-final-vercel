"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { 
  Plus, FolderOpen, Clock, ChevronRight, Loader2, Search, 
  Lock, AlertCircle, Sparkles, RefreshCw, Archive, 
  MessageSquare, Reply, CheckCircle2, Trash2, ExternalLink
} from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { getSupportMessages, updateSupportMessage, deleteSupportMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const OWNER_EMAIL = "Sohamahire26@gmail.com";

const Dashboard = () => {
  const { user, session, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  
  // Admin Reply State
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");

  const isAdmin = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const fetchData = useCallback(async (silent = false) => {
    if (!user) return;
    
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [projectsRes, supportRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        getSupportMessages()
      ]);

      if (projectsRes.error) throw projectsRes.error;

      if (projectsRes.data) {
        setProjects(projectsRes.data);
      }
      
      if (supportRes) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        // Filter: Admin sees all recent, Users see only their own recent
        const filtered = supportRes.filter((m: any) => {
          const created = new Date(m.created_at);
          const isRecent = created >= sevenDaysAgo;
          if (!isRecent) return false;
          
          if (isAdmin) return true;
          return m.user_id === user.id;
        });
        
        setSupportMessages(filtered);
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else if (!authLoading && !session) {
      setLoading(false);
    }
  }, [user, authLoading, session, fetchData]);

  const handleReply = async (id: string) => {
    if (!adminReply.trim()) return;
    try {
      await updateSupportMessage(id, { 
        admin_reply: adminReply.trim(), 
        status: 'replied',
        updated_at: new Date().toISOString()
      });
      toast({ title: "Reply sent successfully" });
      setReplyingTo(null);
      setAdminReply("");
      fetchData(true);
    } catch (err: any) {
      toast({ title: "Failed to reply", description: err.message, variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateSupportMessage(id, { 
        status,
        updated_at: new Date().toISOString(),
        viewed_at: status === 'viewed' ? new Date().toISOString() : null
      });
      toast({ title: `Status updated to ${status}` });
      fetchData(true);
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteSupportMessage(id);
      setSupportMessages(prev => prev.filter(m => m.id !== id));
      toast({ title: "Message deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

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
  const activeProjectsCount = projects.filter(p => {
    const created = new Date(p.created_at).getTime();
    const now = new Date().getTime();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  const projectLimitReached = !isPro && activeProjectsCount >= 1;
  const unreadSupport = supportMessages.filter(m => m.status === 'replied' && m.user_id === user?.id).length;
  const adminNewTickets = supportMessages.filter(m => m.status === 'new').length;

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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchData(true)} 
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

          {/* Support Tickets Section */}
          {supportMessages.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {isAdmin ? "Support Management" : "My Support Tickets"}
                  {isAdmin && adminNewTickets > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                      {adminNewTickets} NEW
                    </span>
                  )}
                  {!isAdmin && unreadSupport > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                      NEW REPLY
                    </span>
                  )}
                </h2>
                <Link to="/contact" className="text-xs font-semibold text-primary hover:underline">
                  {isAdmin ? "Admin Panel" : "View History"}
                </Link>
              </div>
              <div className="grid gap-4">
                {supportMessages.slice(0, isAdmin ? 5 : 3).map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col rounded-2xl border p-5 transition-all ${
                      msg.status === 'new' ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          msg.status === 'new' ? 'bg-amber-500 text-white' : 
                          msg.status === 'replied' ? 'bg-blue-500 text-white' : 
                          'bg-gray-500 text-white'
                        }`}>
                          {msg.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                        {isAdmin && (
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            User: {msg.user_id.substring(0, 8)}
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(msg.id, 'viewed')} title="Mark Viewed">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteMessage(msg.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-foreground mb-1">{msg.subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{msg.message}</p>

                    {msg.admin_reply && (
                      <div className="mb-4 rounded-xl bg-muted/30 p-3 border border-border/50">
                        <p className="text-[10px] font-bold uppercase text-primary mb-1 flex items-center gap-1">
                          <Reply size={10} /> {isAdmin ? "Your Reply" : "Giglant Support Reply"}
                        </p>
                        <p className="text-sm italic text-foreground/80">"{msg.admin_reply}"</p>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="mt-2">
                        {replyingTo === msg.id ? (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <Textarea 
                              value={adminReply} 
                              onChange={e => setAdminReply(e.target.value)} 
                              placeholder="Type your reply..." 
                              className="min-h-[80px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleReply(msg.id)}>Send Reply</Button>
                              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => { setReplyingTo(msg.id); setAdminReply(msg.admin_reply || ""); }}>
                            <Reply className="mr-2 h-3.5 w-3.5" /> {msg.admin_reply ? "Edit Reply" : "Reply"}
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {!isAdmin && !msg.admin_reply && (
                      <p className="text-[10px] text-muted-foreground italic">Waiting for support response...</p>
                    )}
                  </div>
                ))}
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
                const created = new Date(project.created_at).getTime();
                const now = new Date().getTime();
                const diffDays = (now - created) / (1000 * 60 * 60 * 24);
                
                const isPro = profile?.plan_type === 'pro';
                const expiryDays = isPro ? 90 : 30;
                const isExpired = diffDays > expiryDays;
                const isLocked = !isPro && diffDays > 7 && !isExpired;

                return (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className={`group flex items-center justify-between rounded-2xl border p-5 transition-all ${
                      isExpired 
                        ? "border-border bg-muted/50 opacity-60 grayscale" 
                        : isLocked
                        ? "border-amber-500/20 bg-amber-500/5"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                        isExpired
                          ? "bg-muted text-muted-foreground"
                          : isLocked 
                          ? "bg-amber-500/20 text-amber-600" 
                          : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                      }`}>
                        {isExpired ? <Archive size={24} /> : isLocked ? <Lock size={24} /> : <FolderOpen size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-foreground">{project.name}</h3>
                          {isExpired ? (
                            <span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">EXPIRED</span>
                          ) : isLocked ? (
                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">LOCKED</span>
                          ) : null}
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