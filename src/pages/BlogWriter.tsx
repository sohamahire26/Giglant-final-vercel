"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Save, Eye, ArrowLeft, Loader2, Lock, ImageIcon, Bold, Italic, Heading2, Link2, List, Layout as LayoutIcon, FileText, Search } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { saveBlogPost, getBlogPostById } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

const OWNER_EMAIL = "Sohamahire26@gmail.com";

const categories = [
  { slug: "editing-tips", name: "Editing Tips" },
  { slug: "freelance-tips", name: "Freelance Tips" },
  { slug: "client-workflow", name: "Client Workflow" },
  { slug: "file-management", name: "File Management" },
  { slug: "productivity", name: "Productivity" },
  { slug: "tools", name: "Tools" },
];

const BlogWriter = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
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
  const [loading, setLoading] = useState(!!editId);
  const [preview, setPreview] = useState(false);

  const isOwner = profile?.is_admin || user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    if (editId && isOwner) {
      const loadPost = async () => {
        try {
          const data = await getBlogPostById(editId);
          setTitle(data.title);
          setSlug(data.slug);
          setCategory(data.category);
          setContent(data.content);
          setExcerpt(data.excerpt || "");
          setMetaTitle(data.meta_title || "");
          setMetaDescription(data.meta_description || "");
          setCoverImageUrl(data.cover_image_url || "");
          setPublished(data.published || false);
        } catch {
          toast({ title: "Post not found", variant: "destructive" });
        }
        setLoading(false);
      };
      loadPost();
    }
  }, [editId, isOwner]);

  const generateSlug = useCallback((text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editId) setSlug(generateSlug(val));
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

  const handleSave = async (pub: boolean) => {
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
    if (editId) postData.id = editId;

    try {
      await saveBlogPost(postData);
      toast({ title: pub ? "Published!" : "Saved as draft", description: `Post "${title}" has been ${pub ? "published" : "saved"}.` });
      if (pub) navigate(`/blog/${category}/${slug}`);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isOwner) {
    return (
      <Layout>
        <SEOHead title="Access Denied — Giglant" description="You do not have permission to access this page." />
        <section className="section-padding">
          <div className="container-tight max-md">
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Lock className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h1 className="font-display text-2xl font-bold text-foreground">Access Denied</h1>
              <p className="mt-2 text-sm text-muted-foreground">Only the site owner can access the blog writer.</p>
              <div className="mt-4 p-3 bg-muted rounded-lg text-[10px] font-mono text-left overflow-hidden">
                Logged in as: {user?.email || "Not logged in"}
              </div>
              <Button onClick={() => navigate("/login")} className="mt-6 w-full">Sign In as Owner</Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="Write Blog Post — Giglant" description="Write and publish blog posts on Giglant." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/blog")} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">{editId ? "Edit Post" : "New Post"}</h1>
                <p className="text-xs text-muted-foreground">Drafting as {user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreview(!preview)}>
                {preview ? <FileText className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {preview ? "Edit" : "Preview"}
              </Button>
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> Save Draft
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
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
              {/* Settings Panel */}
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

              {/* Manual SEO Panel */}
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
      </section>
    </Layout>
  );
};

export default BlogWriter;