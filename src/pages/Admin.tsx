"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Edit, Trash2, Loader2, ArrowLeft, FileText, Eye, 
  MessageSquare, Search, Send, User, Bug, Lightbulb, 
  MessageCircle, ChevronDown, ChevronUp, LayoutDashboard,
  CheckCircle2, Clock, History, Save, ImageIcon, Bold, Italic, Heading2, Link2, List, Layout as LayoutIcon
} from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getBlogPosts, deleteBlogPost, saveBlogPost, getBlogPostById } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
  const [activeTab, setActiveTab] = useState<"blogs" | "messages">("blogs");
  const [view, setView] = useState<"list" | "write">("list");
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Blog State
  const [posts, setPosts] = useState<any[]>([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Writer State
  const contentRef = useRef<HTMLTextAreaElement>(null);
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

  // Support State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const isOwner = profile?.is_admin || user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    if (isOwner && activeTab === "blogs" && view === "list") {
      fetchPosts();
    }
  }, [isOwner, activeTab, view]);

  const fetchPosts = async () => {
    try {
      setBlogLoading(true);
      const data = await getBlogPosts();
      setPosts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBlogLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteBlogPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Post deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  // Writer Logic
  const handleStartWrite = async (postId?: string) => {
    if (postId) {
      setBlogLoading(true);
      try {
        const data = await getBlogPostById(postId);
        setEditingPostId(postId);
        setTitle(data.title);
        setSlug(data.slug);
        setCategory(data.category);
        setContent(data.content);
        setExcerpt(data.excerpt || "");
        setMetaTitle(data.meta_title || "");
        setMetaDescription(data.meta_description || "");
        setCoverImageUrl(data.cover_image_url || "");
        setPublished(data.published || false);
        setView("write");
      } catch {
        toast({ title: "Post not found", variant: "destructive" });
      }
      setBlogLoading(false);
    } else {
      setEditingPostId(null);
      setTitle("");
      setSlug("");
      setCategory("editing-tips");
      setContent("");
      setExcerpt("");
      setMetaTitle("");
      setMetaDescription("");
      setCoverImageUrl("");
      setPublished(false);
      setView("write");
    }
  };

  const generateSlug = useCallback((text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPostId) setSlug(generateSlug(val));
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

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      const imgTag = `\n<img src="${url}" alt="image" style="max-width:100%;border-radius:1rem;margin:2rem 0" />\n`;
      setContent(prev => prev + imgTag);
    }
  };

  const handleSaveBlog = async (pub: boolean) => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast({ title: "Missing fields", description: "Title, slug, and content are required.", variant: "destructive" });
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
    if (editingPostId) postData.id = editingPostId;

    try {
      await saveBlogPost(postData);
      toast({ title: pub ? "Published!" : "Saved as draft" });
      setView("list");
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  // Support Logic
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["admin_support_tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: isOwner && activeTab === "messages",
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, reply }: { ticketId: string; reply: string }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ 
          reply, 
          status: 'replied',
          is_read_by_user: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_support_tickets"] });
      toast({ title: "Reply sent successfully!" });
      setReplyText("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to send reply", description: error.message, variant: "destructive" });
    }
  });

  const handleReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ ticketId, reply: replyText.trim() });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4 text-red-500" />;
      case 'feedback': return <Lightbulb className="h-4 w-4 text-amber-500" />;
      default: return <MessageCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredTickets = tickets?.filter(t => {
    const matchesFilter = filter === "all" || t.type === filter || (filter === "pending" && !t.reply);
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                         t.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (authLoading) {
    return <Layout><div className="flex py-24 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!isOwner) {
    return <NotFound />;
  }

  return (
    <Layout>
      <SEOHead title="Admin Dashboard — Giglant" description="Manage blogs and support tickets." />
      <section className="section-padding">
        <div className="container-tight">
          {view === "list" ? (
            <>
              <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                  <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
                </div>
                <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
                  <button 
                    onClick={() => setActiveTab("blogs")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      activeTab === "blogs" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <FileText size={16} /> Blogs
                  </button>
                  <button 
                    onClick={() => setActiveTab("messages")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      activeTab === "messages" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <MessageSquare size={16} /> Messages
                  </button>
                </div>
              </div>

              {activeTab === "blogs" ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">Manage Blog Posts</h2>
                    <Button onClick={() => handleStartWrite()}><Plus className="mr-2 h-4 w-4" /> New Post</Button>
                  </div>
                  {blogLoading ? (
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
                            <Button variant="ghost" size="icon" asChild title="View">
                              <Link to={`/blog/${post.category}/${post.slug}`}><Eye size={18} /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleStartWrite(post.id)} title="Edit">
                              <Edit size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBlog(post.id)} className="text-destructive hover:bg-destructive/10" title="Delete">
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {posts.length === 0 && (
                        <div className="py-20 text-center border border-dashed rounded-2xl">
                          <p className="text-muted-foreground">No posts found.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="font-display text-xl font-bold">User Messages</h2>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search tickets..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                      <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="all">All Types</option>
                        <option value="pending">Pending Only</option>
                        <option value="bug">Bugs</option>
                        <option value="feedback">Feedback</option>
                        <option value="contact">Contact</option>
                      </select>
                    </div>
                  </div>

                  {ticketsLoading ? (
                    <div className="flex py-12 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTickets?.map((ticket) => (
                        <div 
                          key={ticket.id}
                          className={cn(
                            "overflow-hidden rounded-xl border transition-all duration-200",
                            expandedId === ticket.id ? "border-primary ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/50",
                            !ticket.reply && "border-amber-200 bg-amber-50/30"
                          )}
                        >
                          <button
                            onClick={() => {
                              setExpandedId(expandedId === ticket.id ? null : ticket.id);
                              if (ticket.reply) setReplyText(ticket.reply);
                              else setReplyText("");
                            }}
                            className="flex w-full items-center justify-between p-5 text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                {getTypeIcon(ticket.type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                                  {!ticket.reply ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                                      Pending
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                      Replied
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  From: {ticket.profiles?.first_name || 'User'} • {format(new Date(ticket.created_at), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            {expandedId === ticket.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>

                          {expandedId === ticket.id && (
                            <div className="border-t border-border bg-muted/30 p-5">
                              <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <User size={14} className="text-muted-foreground" />
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User Message</h4>
                                </div>
                                <div className="rounded-lg bg-background p-4 text-sm text-foreground shadow-sm">
                                  {ticket.message}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <MessageSquare size={14} className="text-primary" />
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Admin Reply</h4>
                                </div>
                                <Textarea 
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Type your response here..."
                                  className="min-h-[120px] bg-background"
                                />
                                <div className="flex justify-end">
                                  <Button 
                                    onClick={() => handleReply(ticket.id)}
                                    disabled={replyMutation.isPending || !replyText.trim()}
                                    className="gap-2"
                                  >
                                    {replyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    {ticket.reply ? "Update Reply" : "Send Reply"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {filteredTickets?.length === 0 && (
                        <div className="py-20 text-center border border-dashed rounded-2xl">
                          <p className="text-muted-foreground">No messages found.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => setView("list")} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">{editingPostId ? "Edit Post" : "New Post"}</h1>
                    <p className="text-xs text-muted-foreground">Drafting as {user?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPreview(!preview)}>
                    {preview ? <FileText className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {preview ? "Edit" : "Preview"}
                  </Button>
                  <Button variant="outline" onClick={() => handleSaveBlog(false)} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" /> Save Draft
                  </Button>
                  <Button onClick={() => handleSaveBlog(true)} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Publish
                  </Button>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {preview ? (
                    <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
                      {coverImageUrl && <img src={coverImageUrl} alt={title} className="w-full rounded-2xl mb-8 max-h-96 object-cover" />}
                      <div className="mb-4 flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {categories.find(c => c.slug === category)?.name}
                        </span>
                      </div>
                      <h1 className="font-display text-4xl font-bold text-foreground">{title || "Untitled Post"}</h1>
                      <div
                        className="mt-10 prose prose-sm max-w-none text-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content || "<p className='text-muted-foreground italic'>No content yet...</p>" }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-border bg-card p-6">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Post Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="Enter a catchy title..."
                          className="w-full bg-transparent text-3xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>

                      <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content</label>
                          <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
                            <button onClick={() => insertFormat("<strong>", "</strong>")} className="p-1.5 rounded hover:bg-secondary" title="Bold"><Bold className="h-4 w-4" /></button>
                            <button onClick={() => insertFormat("<em>", "</em>")} className="p-1.5 rounded hover:bg-secondary" title="Italic"><Italic className="h-4 w-4" /></button>
                            <button onClick={() => insertFormat("<h2>", "</h2>")} className="p-1.5 rounded hover:bg-secondary" title="Heading"><Heading2 className="h-4 w-4" /></button>
                            <button onClick={() => insertFormat("<a href='#' target='_blank'>", "</a>")} className="p-1.5 rounded hover:bg-secondary" title="Link"><Link2 className="h-4 w-4" /></button>
                            <button onClick={insertImage} className="p-1.5 rounded hover:bg-secondary" title="Image"><ImageIcon className="h-4 w-4" /></button>
                            <button onClick={() => insertFormat("<ul>\n  <li>", "</li>\n</ul>")} className="p-1.5 rounded hover:bg-secondary" title="List"><List className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <textarea
                          ref={contentRef}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Start writing your masterpiece..."
                          rows={25}
                          className="w-full bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none resize-y font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-display text-sm font-bold text-foreground flex items-center gap-2">
                      <LayoutIcon className="h-4 w-4 text-primary" /> Post Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL Slug</label>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cover Image URL</label>
                        <input
                          type="text"
                          value={coverImageUrl}
                          onChange={(e) => setCoverImageUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" /> SEO Settings
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Meta Title</label>
                        <input
                          type="text"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          placeholder="SEO Title"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Meta Description</label>
                        <textarea
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value)}
                          placeholder="SEO Description"
                          rows={3}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Excerpt</label>
                        <textarea
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder="Post summary"
                          rows={3}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Admin;