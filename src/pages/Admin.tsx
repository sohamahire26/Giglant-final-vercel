"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  Plus, Edit, Trash2, Loader2, ArrowLeft, FileText, Eye, 
  MessageSquare, Tag, Reply, CheckCircle2, Clock, Save, 
  Bold, Italic, Heading2, Link2, List, ImageIcon, Search,
  LayoutDashboard, ShieldCheck, AlertCircle, RefreshCw
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

const OWNER_EMAIL = "Sohamahire26@gmail.com";

const categories = [
  { slug: "editing-tips", name: "Editing Tips" },
  { slug: "freelance-tips", name: "Freelance Tips" },
  { slug: "client-workflow", name: "Client Workflow" },
  { slug: "file-management", name: "File Management" },
  { slug: "productivity", name: "Productivity" },
  { slug: "tools", name: "Tools" },
];

const Admin = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"blog" | "support">("blog");
  const [view, setView] = useState<"list" | "edit">("list");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Blog Editor State
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("editing-tips");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Support State
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");

  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const fetchData = useCallback(async () => {
    if (!isOwner) return;
    
    setLoading(true);
    try {
      if (activeTab === "blog") {
        const data = await getBlogPosts();
        setPosts(data || []);
      } else {
        const data = await getSupportMessages();
        
        if (data && data.length > 0) {
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          
          // Identify messages older than 7 days for deletion
          const toDelete = data.filter((m: any) => new Date(m.created_at) < sevenDaysAgo);

          if (toDelete.length > 0) {
            console.log(`[Admin] Deleting ${toDelete.length} expired messages...`);
            await Promise.all(toDelete.map((m: any) => deleteSupportMessage(m.id)));
            // Only show messages that are NOT expired
            setMessages(data.filter((m: any) => new Date(m.created_at) >= sevenDaysAgo));
          } else {
            setMessages(data);
          }
        } else {
          setMessages([]);
        }
      }
    } catch (err: any) {
      console.error("[Admin] Error fetching data:", err);
      toast({
        title: "Fetch Error",
        description: err.message || "Could not load data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, isOwner, toast]);

  useEffect(() => {
    if (isOwner) {
      fetchData();
    }
  }, [isOwner, fetchData]);

  // Blog Logic
  const handleEditPost = async (id: string) => {
    setLoading(true);
    try {
      const data = await getBlogPostById(id);
      setEditId(id);
      setTitle(data.title);
      setSlug(data.slug);
      setCategory(data.category);
      setContent(data.content);
      setExcerpt(data.excerpt || "");
      setMetaTitle(data.meta_title || "");
      setMetaDescription(data.meta_description || "");
      setCoverImageUrl(data.cover_image_url || "");
      setPublished(data.published || false);
      setView("edit");
    } catch {
      toast({ title: "Post not found", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleNewPost = () => {
    setEditId(null);
    setTitle("");
    setSlug("");
    setCategory("editing-tips");
    setContent("");
    setExcerpt("");
    setMetaTitle("");
    setMetaDescription("");
    setCoverImageUrl("");
    setPublished(false);
    setView("edit");
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteBlogPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Post deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
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
      excerpt: excerpt.trim() || content.trim().replace(/<[^>]*>/g, "").substring(0, 160),
      meta_title: metaTitle.trim() || `${title} — Giglant Blog`,
      meta_description: metaDescription.trim() || excerpt.trim() || content.trim().replace(/<[^>]*>/g, "").substring(0, 160),
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

  const insertFormat = (before: string, after: string = "") => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${before}${selected || "text"}${after || before}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + (selected.length || 4));
    }, 0);
  };

  // Support Logic
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

  const handleTagStatus = async (id: string, status: string) => {
    try {
      await updateSupportMessage(id, { 
        status,
        updated_at: new Date().toISOString(),
        viewed_at: status === 'viewed' ? new Date().toISOString() : null
      });
      toast({ title: `Tagged as ${status}` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteSupportMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast({ title: "Message deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  if (authLoading) return <Layout><div className="flex py-24 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!isOwner) return <NotFound />;

  return (
    <Layout>
      <SEOHead title="Admin Dashboard — Giglant" description="Manage blog posts and support messages." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, Soham</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "blog" ? "default" : "outline"} 
                onClick={() => { setActiveTab("blog"); setView("list"); }}
              >
                <FileText className="mr-2 h-4 w-4" /> Blog
              </Button>
              <Button 
                variant={activeTab === "support" ? "default" : "outline"} 
                onClick={() => { setActiveTab("support"); setView("list"); }}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Support
              </Button>
              <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {activeTab === "blog" ? (
            view === "list" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">Blog Posts</h2>
                  <Button onClick={handleNewPost}><Plus className="mr-2 h-4 w-4" /> New Post</Button>
                </div>
                {loading ? (
                  <div className="flex py-12 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="grid gap-4">
                    {posts.map(post => (
                      <div key={post.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-xs text-muted-foreground">{post.category} • {new Date(post.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild><Link to={`/blog/${post.category}/${post.slug}`}><Eye size={18} /></Link></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditPost(post.id)}><Edit size={18} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)} className="text-destructive hover:bg-destructive/10"><Trash2 size={18} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setView("list")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setPreview(!preview)}>{preview ? "Edit" : "Preview"}</Button>
                    <Button variant="outline" onClick={() => handleSavePost(false)} disabled={saving}>Save Draft</Button>
                    <Button onClick={() => handleSavePost(true)} disabled={saving}>Publish</Button>
                  </div>
                </div>
                {preview ? (
                  <div className="rounded-3xl border border-border bg-card p-8">
                    {coverImageUrl && <img src={coverImageUrl} className="w-full rounded-2xl mb-8 max-h-96 object-cover" />}
                    <h1 className="font-display text-4xl font-bold">{title || "Untitled"}</h1>
                    <div className="mt-10 prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
                ) : (
                  <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="rounded-2xl border border-border bg-card p-6">
                        <Input value={title} onChange={e => { setTitle(e.target.value); if(!editId) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }} placeholder="Title" className="text-2xl font-bold border-none p-0 focus-visible:ring-0" />
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="mb-4 flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => insertFormat("<strong>", "</strong>")}><Bold size={16} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => insertFormat("<em>", "</em>")}><Italic size={16} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => insertFormat("<h2>", "</h2>")}><Heading2 size={16} /></Button>
                        </div>
                        <Textarea ref={contentRef} value={content} onChange={e => setContent(e.target.value)} placeholder="Content..." rows={20} className="font-mono" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                        <h3 className="font-bold">Settings</h3>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 rounded border bg-background">
                          {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                        </select>
                        <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Slug" />
                        <Input value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="Cover Image URL" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Support Messages</h2>
                <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-600">
                  <Clock className="h-3 w-3" /> 7-DAY AUTO-DELETE ACTIVE
                </div>
              </div>
              {loading ? (
                <div className="flex py-12 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="grid gap-6">
                  {messages.map(msg => (
                    <div key={msg.id} className={`rounded-2xl border p-6 transition-all ${msg.status === 'new' ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            msg.type === 'bug' ? 'bg-red-500/10 text-red-600' : 
                            msg.type === 'feedback' ? 'bg-blue-500/10 text-blue-600' : 
                            'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {msg.type}
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            msg.status === 'new' ? 'bg-amber-500 text-white' : 
                            msg.status === 'replied' ? 'bg-blue-500 text-white' : 
                            'bg-gray-500 text-white'
                          }`}>
                            {msg.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleTagStatus(msg.id, 'viewed')} title="Mark as Viewed">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteMessage(msg.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{msg.subject}</h3>
                      <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{msg.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(msg.created_at).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><FileText size={12} /> User ID: {msg.user_id.substring(0, 8)}...</span>
                      </div>

                      {msg.admin_reply && (
                        <div className="mb-6 rounded-xl bg-muted/50 p-4 border border-border">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                            <Reply size={10} /> Your Reply
                          </p>
                          <p className="text-sm italic">{msg.admin_reply}</p>
                        </div>
                      )}

                      {replyingTo === msg.id ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                          <Textarea 
                            value={adminReply} 
                            onChange={e => setAdminReply(e.target.value)} 
                            placeholder="Type your reply..." 
                            className="min-h-[100px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReply(msg.id)}>Send Reply</Button>
                            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setReplyingTo(msg.id)}>
                          <Reply className="mr-2 h-4 w-4" /> {msg.admin_reply ? "Update Reply" : "Reply to User"}
                        </Button>
                      )}
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="py-20 text-center border border-dashed rounded-2xl">
                      <p className="text-muted-foreground">No support messages found.</p>
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

export default Admin;