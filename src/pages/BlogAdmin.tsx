"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, ArrowLeft, FileText, Eye, MessageSquare, Bug, Lightbulb, User, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { getBlogPosts, deleteBlogPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import NotFound from "./NotFound";

const OWNER_EMAIL = "sohamahire26@gmail.com";

const BlogAdmin = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"blog" | "support">("blog");
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const isOwner = profile?.is_admin || user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    if (isOwner) {
      if (activeTab === "blog") fetchPosts();
      else fetchSupportMessages();
    }
  }, [isOwner, activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getBlogPosts();
      setPosts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*, profiles(first_name, last_name)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setSupportMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteBlogPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Post deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this support message?")) return;
    try {
      const { error } = await supabase.from("support_messages").delete().eq("id", id);
      if (error) throw error;
      setSupportMessages(prev => prev.filter(m => m.id !== id));
      toast({ title: "Message deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  if (authLoading) {
    return <Layout><div className="flex py-24 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!isOwner) {
    return <NotFound />;
  }

  return (
    <Layout>
      <SEOHead title="Admin Dashboard — Giglant" description="Manage blog posts and support requests." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link to="/blog" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex gap-2 rounded-xl border border-border bg-card p-1">
              <button 
                onClick={() => setActiveTab("blog")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === "blog" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Blog Posts
              </button>
              <button 
                onClick={() => setActiveTab("support")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === "support" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Support Messages
              </button>
            </div>
          </div>

          {activeTab === "blog" ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button asChild>
                  <Link to="/blog/write"><Plus className="mr-2 h-4 w-4" /> New Post</Link>
                </Button>
              </div>
              <div className="grid gap-4">
                {posts.map(post => (
                  <div key={post.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
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
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link to={`/blog/write?edit=${post.id}`}><Edit size={18} /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)} className="text-destructive hover:bg-destructive/10" title="Delete">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && !loading && (
                  <div className="py-20 text-center border border-dashed rounded-2xl">
                    <p className="text-muted-foreground">No posts found.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {supportMessages.map(msg => (
                <div key={msg.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        msg.type === 'bug' ? 'bg-red-500/10 text-red-600' : 
                        msg.type === 'suggestion' ? 'bg-blue-500/10 text-blue-600' : 
                        'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {msg.type === 'bug' ? <Bug size={20} /> : msg.type === 'suggestion' ? <Lightbulb size={20} /> : <MessageSquare size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{msg.subject}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <span className={msg.type === 'bug' ? 'text-red-600' : msg.type === 'suggestion' ? 'text-blue-600' : 'text-emerald-600'}>
                            {msg.type}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMessage(msg.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
                    {msg.message}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <User size={14} />
                    <span>User ID: <span className="font-mono text-[10px]">{msg.user_id}</span></span>
                    {msg.profiles && (
                      <span className="ml-2 font-semibold text-foreground">
                        ({msg.profiles.first_name} {msg.profiles.last_name})
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {supportMessages.length === 0 && !loading && (
                <div className="py-20 text-center border border-dashed rounded-2xl">
                  <p className="text-muted-foreground">No support messages yet.</p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex py-12 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogAdmin;