"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { 
  Plus, FolderOpen, Clock, ChevronRight, Loader2, Search, 
  Lock, AlertCircle, Sparkles, RefreshCw, Archive, 
  MessageSquare, Reply, CheckCircle2, Trash2, User, Edit3
} from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { getSupportMessages, updateSupportMessage, deleteSupportMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, session, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");

  const isAdmin = profile?.is_admin === true;

  const fetchData = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [projectsRes, supportRes] = await Promise.all([
        supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        getSupportMessages()
      ]);

      if (projectsRes.error) throw projectsRes.error;
      setProjects(projectsRes.data || []);
      
      if (supportRes) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        // Filter: Only show messages from the last 7 days
        const filtered = supportRes.filter((m: any) => {
          const created = new Date(m.created_at);
          return created >= sevenDaysAgo;
        });
        
        setSupportMessages(filtered);
      }
    } catch (err: any) {
      console.error("[Dashboard] Error:", err);
      if (!silent) toast({ title: "Error loading data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) fetchData();

    const channel = supabase
      .channel('support-realtime-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
        fetchData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchData]);

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
      await updateSupportMessage(id, { status, updated_at: new Date().toISOString() });
      toast({ title: `Status: ${status}` });
      fetchData(true);
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteSupportMessage(id);
      toast({ title: "Message deleted" });
      fetchData(true);
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  if (authLoading) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div></Layout>;
  if (!session) return <Navigate to="/login" replace />;

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase())));
  const isPro = profile?.plan_type === 'pro';

  return (
    <Layout>
      <SEOHead title="Dashboard — Giglant" description="Manage projects and support." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">My Projects</h1>
              <p className="text-muted-foreground">{isPro ? "Unlimited workspaces." : "Manage your active workspace."}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => fetchData(true)} disabled={isRefreshing}><RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /></Button>
              <Button asChild size="lg" className="shadow-lg shadow-primary/20"><Link to="/projects/new"><Plus className="mr-2 h-5 w-5" /> New Project</Link></Button>
            </div>
          </div>

          {/* Support Section */}
          {supportMessages.length > 0 && (
            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {isAdmin ? "Admin Support Center" : "My Support Tickets"}
                </h2>
                <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  <Clock className="h-3 w-3" /> 7-Day History Only
                </div>
              </div>
              <div className="grid gap-4">
                {supportMessages.map(msg => (
                  <div key={msg.id} className={`p-6 border rounded-2xl transition-all shadow-sm ${msg.status === 'new' ? 'border-primary/30 bg-primary/5' : 'bg-card'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          msg.status === 'new' ? 'bg-amber-500 text-white' : 
                          msg.status === 'replied' ? 'bg-blue-500 text-white' : 
                          'bg-gray-500 text-white'
                        }`}>
                          {msg.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={12} /> {new Date(msg.created_at).toLocaleString()}
                        </span>
                        {isAdmin && msg.profiles && (
                          <span className="text-[10px] bg-secondary px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                            <User size={10} /> {msg.profiles.first_name} {msg.profiles.last_name || ""}
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(msg.id, 'viewed')} title="Mark Viewed"><CheckCircle2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteMessage(msg.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-base mb-1">{msg.subject}</h3>
                    <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{msg.message}</p>
                    
                    {msg.admin_reply && (
                      <div className="mt-4 p-4 bg-muted/40 rounded-xl border border-border/50 relative group">
                        <p className="text-[10px] font-bold uppercase text-primary mb-2 flex items-center gap-1">
                          <Reply size={10} /> {isAdmin ? "Your Reply" : "Giglant Support Reply"}
                        </p>
                        <p className="text-sm italic text-foreground/90 leading-relaxed">"{msg.admin_reply}"</p>
                        {isAdmin && (
                          <button 
                            onClick={() => { setReplyingTo(msg.id); setAdminReply(msg.admin_reply); }}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </div>
                    )}

                    {isAdmin && (
                      <div className="mt-4">
                        {replyingTo === msg.id ? (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <Textarea 
                              value={adminReply} 
                              onChange={e => setAdminReply(e.target.value)} 
                              placeholder="Type your reply..." 
                              className="text-sm min-h-[100px] bg-background" 
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleReply(msg.id)}>Send Reply</Button>
                              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => { setReplyingTo(msg.id); setAdminReply(msg.admin_reply || ""); }}>
                            <Reply className="mr-2 h-3 w-3" /> {msg.admin_reply ? "Edit Reply" : "Reply to User"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none shadow-sm" />
          </div>

          <div className="grid gap-4">
            {filteredProjects.map((project) => (
              <Link key={project.id} to={`/project/${project.id}`} className="group flex items-center justify-between rounded-2xl border p-5 bg-card hover:border-primary/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"><FolderOpen size={24} /></div>
                  <div>
                    <h3 className="font-display font-semibold">{project.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(project.created_at).toLocaleDateString()}</span>
                      {project.client_name && <span>Client: {project.client_name}</span>}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </Link>
            ))}
            {filteredProjects.length === 0 && !loading && <div className="text-center py-20 border border-dashed rounded-3xl text-muted-foreground">No projects found.</div>}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;