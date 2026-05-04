"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Edit, Trash2, Loader2, ArrowLeft, MessageSquare, Reply, 
  CheckCircle2, Clock, ShieldCheck, RefreshCw, Search, Filter,
  User as UserIcon, Mail, AlertCircle, Info
} from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  getBlogPosts, deleteBlogPost, saveBlogPost, getBlogPostById,
  getSupportMessages, updateSupportMessage, deleteSupportMessage 
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import NotFound from "./NotFound";

const Admin = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"blog" | "support">("blog");
  const [view, setView] = useState<"list" | "edit">("list");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("editing-tips");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");

  const isAdmin = profile?.is_admin === true || user?.email?.toLowerCase() === "sohamahire26@gmail.com";

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      if (activeTab === "blog") {
        const data = await getBlogPosts();
        setPosts(data || []);
      } else {
        const data = await getSupportMessages();
        setMessages(data || []);
      }
    } catch (err: any) {
      console.error("[Admin] Fetch error:", err);
      toast({ title: "Error loading data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [activeTab, isAdmin, toast]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  const handleEditPost = async (id: string) => {
    setLoading(true);
    try {
      const data = await getBlogPostById(id);
      setEditId(id);
      setTitle(data.title);
      setSlug(data.slug);
      setCategory(data.category);
      setContent(data.content);
      setCoverImageUrl(data.cover_image_url || "");
      setView("edit");
    } catch {
      toast({ title: "Post not found", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSavePost = async (pub: boolean) => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const postData: any = {
      title: title.trim(),
      slug: slug.trim(),
      category,
      content: content.trim(),
      cover_image_url: coverImageUrl.trim() || null,
      published: pub,
    };
    if (editId) postData.id = editId;
    try {
      await saveBlogPost(postData);
      toast({ title: pub ? "Published!" : "Saved draft" });
      setView("list");
      fetchData();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleReply = async (id: string) => {
    if (!adminReply.trim()) return;
    try {
      await updateSupportMessage(id, { 
        admin_reply: adminReply.trim(), 
        status: 'replied',
        updated_at: new Date().toISOString()
      });
      toast({ title: "Reply sent" });
      setReplyingTo(null);
      setAdminReply("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to reply", description: err.message, variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateSupportMessage(id, { status, updated_at: new Date().toISOString() });
      toast({ title: `Status updated to ${status}` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.subject.toLowerCase().includes(search.toLowerCase()) || 
                         m.message.toLowerCase().includes(search.toLowerCase()) ||
                         (m.profiles?.first_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading) return <Layout><div className="flex py-24 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!isAdmin) return <NotFound />;

  return (
    <Layout>
      <SEOHead title="Admin Dashboard — Giglant" description="Manage blog and support." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-display text-3xl font-bold">Admin Console</h1>
            </div>
            <div className="flex gap-2 p-1 rounded-xl bg-muted border border-border">
              <Button 
                variant={activeTab === "blog" ? "secondary" : "ghost"} 
                className="rounded-lg h-9"
                onClick={() => { setActiveTab("blog"); setView("list"); }}
              >
                Blog Engine
              </Button>
              <Button 
                variant={activeTab === "support" ? "secondary" : "ghost"} 
                className="rounded-lg h-9"
                onClick={() => { setActiveTab("support"); setView("list"); }}
              >
                Support Center
              </Button>
            </div>
          </div>

          {activeTab === "blog" ? (
            view === "list" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Blog Posts
                  </h2>
                  <Button onClick={() => { setEditId(null); setTitle(""); setSlug(""); setContent(""); setView("edit"); }}><Plus className="mr-2 h-4 w-4" /> New Post</Button>
                </div>
                {loading ? <div className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-primary" /></div> : (
                  <div className="grid gap-3">
                    {posts.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 border rounded-xl bg-card shadow-sm hover:border-primary/50 transition-all">
                        <div className="flex flex-col">
                          <span className="font-medium">{p.title}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.category} • {p.published ? "Published" : "Draft"}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditPost(p.id)}><Edit size={18} /></Button>
                          <Button variant="ghost" size="icon" onClick={async () => { if(confirm("Delete this post?")) { await deleteBlogPost(p.id); fetchData(); } }} className="text-destructive"><Trash2 size={18} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setView("list")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to list</Button>
                  <h2 className="text-xl font-bold">{editId ? "Edit Post" : "Create New Post"}</h2>
                </div>
                <div className="grid gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Post Title</label>
                      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., 10 Tips for Better Workflow" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">URL Slug</label>
                      <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g., 10-tips-better-workflow" className="h-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Content (HTML)</label>
                    <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Start writing..." rows={15} className="font-mono text-sm leading-relaxed" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button onClick={() => handleSavePost(false)} variant="outline" disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save as Draft"}
                    </Button>
                    <Button onClick={() => handleSavePost(true)} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Publish Post"}
                    </Button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Support Tickets Center
                </h2>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search tickets..." 
                      className="pl-10 h-10" 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={fetchData} className="shrink-0 h-10 w-10">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "new", "viewed", "replied"].map(status => (
                  <Button 
                    key={status}
                    variant={statusFilter === status ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="rounded-full capitalize px-4"
                  >
                    {status}
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-primary" /></div>
              ) : (
                <div className="grid gap-4">
                  {filteredMessages.map(msg => (
                    <div key={msg.id} className={`p-6 border rounded-2xl transition-all shadow-sm ${msg.status === 'new' ? 'border-primary/20 bg-primary/5' : 'bg-card border-border'}`}>
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            msg.type === 'bug' ? 'bg-red-500/10 text-red-600' : 
                            msg.type === 'feedback' ? 'bg-blue-500/10 text-blue-600' : 
                            'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {msg.type === 'bug' ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                msg.status === 'new' ? 'bg-amber-500 text-white' : 
                                msg.status === 'replied' ? 'bg-blue-500 text-white' : 
                                'bg-gray-500 text-white'
                              }`}>
                                {msg.status}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono uppercase">
                                <Clock size={10} /> {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg leading-tight">{msg.subject}</h3>
                            <div className="flex items-center gap-3 mt-2">
                              {msg.profiles ? (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                                  <UserIcon size={12} className="text-primary" />
                                  <span className="font-semibold text-foreground">{msg.profiles.first_name} {msg.profiles.last_name || ""}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Anonymous User</span>
                              )}
                              <span className="text-xs text-muted-foreground border-l border-border pl-3">Type: <span className="font-bold uppercase text-foreground">{msg.type}</span></span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(msg.id, 'viewed')} title="Mark as Viewed">
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Viewed
                          </Button>
                          <Button variant="ghost" size="icon" onClick={async () => { if(confirm("Permanently delete this ticket?")) { await deleteSupportMessage(msg.id); fetchData(); } }} className="text-destructive hover:bg-destructive/10">
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="rounded-xl bg-muted/30 p-4 border border-border/50 mb-4">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      
                      {msg.admin_reply && (
                        <div className="mb-4 rounded-xl bg-white p-5 border border-primary/20 shadow-sm relative group animate-in zoom-in-95">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">G</div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Your Official Reply</p>
                          </div>
                          <p className="text-sm italic text-foreground/90 leading-relaxed pl-8 border-l-2 border-primary/10">"{msg.admin_reply}"</p>
                          <p className="mt-2 text-[10px] text-muted-foreground pl-8">Replied on {new Date(msg.updated_at).toLocaleString()}</p>
                          
                          <button 
                            onClick={() => { setReplyingTo(msg.id); setAdminReply(msg.admin_reply); }}
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      )}

                      <div className="pt-2">
                        {replyingTo === msg.id ? (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 bg-muted/20 p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-2 mb-2">
                              <Reply className="h-4 w-4 text-primary" />
                              <span className="text-xs font-bold uppercase tracking-wider">Composing Reply</span>
                            </div>
                            <Textarea 
                              value={adminReply} 
                              onChange={e => setAdminReply(e.target.value)} 
                              placeholder="Write your response to the user..." 
                              className="text-sm min-h-[120px] bg-white border-border" 
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleReply(msg.id)} className="px-6">
                                <Send className="h-4 w-4 mr-2" /> Send Reply
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => { setReplyingTo(msg.id); setAdminReply(msg.admin_reply || ""); }} className="rounded-lg">
                            <Reply className="mr-2 h-4 w-4" /> {msg.admin_reply ? "Edit Official Response" : "Respond to Ticket"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredMessages.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Info size={32} />
                      </div>
                      <h2 className="font-display text-xl font-bold text-foreground">No tickets found</h2>
                      <p className="mt-2 text-muted-foreground">Try adjusting your search or filters.</p>
                      {(search || statusFilter !== 'all') && (
                        <Button onClick={() => { setSearch(""); setStatusFilter("all"); }} variant="link" className="mt-2">Clear all filters</Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

const Send = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

export default Admin;