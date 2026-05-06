"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Plus, Edit, Trash2, Loader2, ArrowLeft, FileText, Eye, 
  MessageSquare, Reply, CheckCircle2, Clock, Save, 
  Bold, Italic, Heading2, ShieldCheck, RefreshCw
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
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"blog" | "support">("blog");
  const [view, setView] = useState<"list" | "edit">("list");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const { toast } = useToast();

  // Blog Editor State
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("editing-tips");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
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
        if (data) {
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          
          // Auto-delete expired messages from DB
          const expired = data.filter((m: any) => new Date(m.created_at) < sevenDaysAgo);
          if (expired.length > 0) {
            await Promise.all(expired.map((m: any) => deleteSupportMessage(m.id)));
          }
          
          // Show only non-expired messages
          setMessages(data.filter((m: any) => new Date(m.created_at) >= sevenDaysAgo));
        }
      }
    } catch (err: any) {
      console.error("[Admin] Fetch error:", err);
      toast({ title: "Error loading data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [activeTab, isOwner, toast]);

  useEffect(() => {
    if (isOwner) fetchData();
  }, [isOwner, fetchData]);

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

  if (authLoading) return <Layout><div className="flex py-24 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!isOwner) return <NotFound />;

  return (
    <Layout>
      <SEOHead title="Admin Dashboard — Giglant" description="Manage blog and support." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-display text-3xl font-bold">Admin</h1>
            </div>
            <div className="flex gap-2">
              <Button variant={activeTab === "blog" ? "default" : "outline"} onClick={() => { setActiveTab("blog"); setView("list"); }}>Blog</Button>
              <Button variant={activeTab === "support" ? "default" : "outline"} onClick={() => { setActiveTab("support"); setView("list"); }}>Support</Button>
            </div>
          </div>

          {activeTab === "blog" ? (
            view === "list" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Posts</h2>
                  <Button onClick={() => { setEditId(null); setTitle(""); setSlug(""); setContent(""); setView("edit"); }}><Plus className="mr-2 h-4 w-4" /> New</Button>
                </div>
                {loading ? <Loader2 className="mx-auto animate-spin" /> : (
                  <div className="grid gap-3">
                    {posts.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                        <span>{p.title}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditPost(p.id)}><Edit size={18} /></Button>
                          <Button variant="ghost" size="icon" onClick={async () => { if(confirm("Delete?")) { await deleteBlogPost(p.id); fetchData(); } }}><Trash2 size={18} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setView("list")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
                <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content (HTML allowed)" rows={15} />
                <div className="flex gap-2">
                  <Button onClick={() => handleSavePost(false)} variant="outline">Save Draft</Button>
                  <Button onClick={() => handleSavePost(true)}>Publish</Button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Support Messages</h2>
                <Button variant="ghost" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
              </div>
              {loading ? <Loader2 className="mx-auto animate-spin" /> : (
                <div className="grid gap-4">
                  {messages.map(msg => (
                    <div key={msg.id} className="p-6 border rounded-2xl bg-card">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold uppercase px-2 py-1 bg-primary/10 text-primary rounded">{msg.status}</span>
                        <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <h3 className="font-bold">{msg.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{msg.message}</p>
                      {msg.admin_reply && <div className="mt-4 p-3 bg-muted rounded-lg text-sm italic">Reply: {msg.admin_reply}</div>}
                      <div className="mt-4">
                        {replyingTo === msg.id ? (
                          <div className="space-y-2">
                            <Textarea value={adminReply} onChange={e => setAdminReply(e.target.value)} placeholder="Your reply..." />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleReply(msg.id)}>Send</Button>
                              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setReplyingTo(msg.id)}>Reply</Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="text-center py-10 text-muted-foreground">No recent messages.</p>}
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