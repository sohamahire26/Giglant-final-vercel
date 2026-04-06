import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Save, Eye, ArrowLeft, Loader2, Lock, ImageIcon, Bold, Italic, Heading2, Link2, List } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { saveBlogPost, getBlogPostById } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Admin gate
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("giglant_admin_key") || "");
  const [authenticated, setAuthenticated] = useState(() => !!localStorage.getItem("giglant_admin_key"));

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("editing-tips");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [_published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (editId && authenticated) {
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
  }, [editId, authenticated]);

  const handleAdminLogin = () => {
    if (adminKey.trim()) {
      localStorage.setItem("giglant_admin_key", adminKey.trim());
      setAuthenticated(true);
    }
  };

  const generateSlug = useCallback((text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editId) setSlug(generateSlug(val));
  };

  /* ── Formatting toolbar ── */
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
      const ta = contentRef.current;
      const pos = ta ? ta.selectionStart : content.length;
      const imgTag = `\n<img src="${url}" alt="image" style="max-width:100%;border-radius:8px;margin:1rem 0" />\n`;
      setContent(content.substring(0, pos) + imgTag + content.substring(pos));
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      const ta = contentRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = content.substring(start, end) || "link text";
      const linkTag = `<a href="${url}" target="_blank">${selected}</a>`;
      setContent(content.substring(0, start) + linkTag + content.substring(end));
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
      await saveBlogPost(postData, adminKey);
      toast({ title: pub ? "Published!" : "Saved as draft", description: `Post "${title}" has been ${pub ? "published" : "saved"}.` });
      if (pub) navigate(`/blog/${category}/${slug}`);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  // Admin gate
  if (!authenticated) {
    return (
      <Layout>
        <SEOHead title="Blog Admin — Giglant" description="Admin access for blog management." />
        <section className="section-padding">
          <div className="container-tight max-w-md">
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Lock className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h1 className="font-display text-2xl font-bold text-foreground">Admin Access</h1>
              <p className="mt-2 text-sm text-muted-foreground">Enter your admin key to access the blog editor.</p>
              <div className="mt-6 space-y-3">
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  placeholder="Admin key"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <Button onClick={handleAdminLogin} className="w-full">Unlock Editor</Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="Write Blog Post — Giglant" description="Write and publish blog posts on Giglant." />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <button onClick={() => navigate("/blog")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
                <Eye className="mr-1 h-4 w-4" /> {preview ? "Edit" : "Preview"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving}>
                <Save className="mr-1 h-4 w-4" /> Save Draft
              </Button>
              <Button size="sm" onClick={() => handleSave(true)} disabled={saving}>
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                Publish
              </Button>
            </div>
          </div>

          {preview ? (
            <div className="rounded-2xl border border-border bg-card p-8">
              {coverImageUrl && <img src={coverImageUrl} alt={title} className="w-full rounded-xl mb-6 max-h-80 object-cover" />}
              <h1 className="font-display text-3xl font-bold text-foreground">{title || "Untitled"}</h1>
              <p className="mt-2 text-sm text-muted-foreground">Category: {categories.find(c => c.slug === category)?.name}</p>
              <div
                className="mt-6 prose max-w-none text-foreground text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content || "<p>No content yet.</p>" }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
                <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Your blog post title"
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">URL Slug</label>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                    placeholder="url-slug"
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none font-mono" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none">
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Cover Image URL</label>
                <input type="text" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://your-image-url.com/cover.jpg"
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                {coverImageUrl && <img src={coverImageUrl} alt="Cover preview" className="mt-2 h-32 rounded-lg object-cover" />}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Excerpt</label>
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of the post (shown in listings)"
                  rows={2}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Content</label>
                {/* Formatting toolbar */}
                <div className="flex gap-1 mb-2 p-1 rounded-lg border border-border bg-card">
                  <button onClick={() => insertFormat("<strong>", "</strong>")} className="p-1.5 rounded hover:bg-secondary" title="Bold"><Bold className="h-4 w-4" /></button>
                  <button onClick={() => insertFormat("<em>", "</em>")} className="p-1.5 rounded hover:bg-secondary" title="Italic"><Italic className="h-4 w-4" /></button>
                  <button onClick={() => insertFormat("<h2>", "</h2>")} className="p-1.5 rounded hover:bg-secondary" title="Heading"><Heading2 className="h-4 w-4" /></button>
                  <button onClick={insertLink} className="p-1.5 rounded hover:bg-secondary" title="Insert Link"><Link2 className="h-4 w-4" /></button>
                  <button onClick={insertImage} className="p-1.5 rounded hover:bg-secondary" title="Insert Image"><ImageIcon className="h-4 w-4" /></button>
                  <button onClick={() => insertFormat("<ul>\n  <li>", "</li>\n</ul>")} className="p-1.5 rounded hover:bg-secondary" title="List"><List className="h-4 w-4" /></button>
                </div>
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post here. Use HTML for formatting or use the toolbar above."
                  rows={20}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-y font-mono leading-relaxed"
                />
              </div>

              <details className="rounded-lg border border-border bg-card p-4">
                <summary className="cursor-pointer text-sm font-medium text-foreground">SEO Settings</summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Meta Title</label>
                    <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="SEO title (auto-generated if empty)"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Meta Description</label>
                    <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="SEO description (auto-generated if empty)"
                      rows={2}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" />
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogWriter;
