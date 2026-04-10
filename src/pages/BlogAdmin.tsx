"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, ArrowLeft, LayoutDashboard, FileText, Eye } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { getBlogPosts, deleteBlogPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

const OWNER_EMAIL = "Sohamahire26@gmail.com";

const BlogAdmin = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    if (isOwner) {
      fetchPosts();
    }
  }, [isOwner]);

  const fetchPosts = async () => {
    try {
      const data = await getBlogPosts();
      setPosts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteBlogPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Post deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return <Layout><div className="flex py-24 justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!isOwner) {
    return (
      <Layout>
        <div className="container-tight max-w-md py-24 text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <Button asChild className="mt-4"><Link to="/blog">Back to Blog</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="Blog Admin — Giglant" description="Manage your blog posts." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/blog" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-display text-3xl font-bold">Blog Admin</h1>
            </div>
            <Button asChild>
              <Link to="/blog/write"><Plus className="mr-2 h-4 w-4" /> New Post</Link>
            </Button>
          </div>

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
                    <Link to={`/blog/write?edit=${post.id}`}><Edit size={18} /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive hover:bg-destructive/10" title="Delete">
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
        </div>
      </section>
    </Layout>
  );
};

export default BlogAdmin;