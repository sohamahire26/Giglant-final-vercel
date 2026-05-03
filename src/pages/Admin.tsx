"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Edit, Trash2, Loader2, ArrowLeft, FileText, Eye, 
  MessageSquare, Search, Send, User, Bug, Lightbulb, 
  MessageCircle, ChevronDown, ChevronUp, LayoutDashboard,
  CheckCircle2, Clock
} from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getBlogPosts, deleteBlogPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const OWNER_EMAIL = "Sohamahire26@gmail.com";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<"blogs" | "messages">("blogs");
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Blog State
  const [posts, setPosts] = useState<any[]>([]);
  const [blogLoading, setBlogLoading] = useState(true);

  // Support State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const isOwner = profile?.is_admin || user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    if (!authLoading && !isOwner) {
      navigate("/dashboard");
    }
  }, [authLoading, isOwner, navigate]);

  // Fetch Blogs
  useEffect(() => {
    if (isOwner && activeTab === "blogs") {
      fetchPosts();
    }
  }, [isOwner, activeTab]);

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

  // Fetch Support Tickets
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

  if (!isOwner) return null;

  return (
    <Layout>
      <SEOHead title="Admin Dashboard — Giglant" description="Manage blogs and support tickets." />
      <section className="section-padding">
        <div className="container-tight">
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
                <Button asChild>
                  <Link to="/blog/write"><Plus className="mr-2 h-4 w-4" /> New Post</Link>
                </Button>
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
                        <Button variant="ghost" size="icon" asChild title="Edit">
                          <Link to="/blog/write?edit=" + post.id><Edit size={18} /></Link>
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
        </div>
      </section>
    </Layout>
  );
};

export default Admin;