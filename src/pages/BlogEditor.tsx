"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link, Navigate } from "react-router-dom";
import { 
  ArrowLeft, Save, Eye, Layout, Image as ImageIcon, FileText, 
  Globe, Loader2, CheckCircle2, Bold, Italic, Heading2, Heading3, 
  Link as LinkIcon, List, Type, Hash, Sparkles 
} from "lucide-react";
import LayoutComp from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { saveBlogPost, getBlogPostById } from "@/lib/api";

const CATEGORIES = [
  { name: "Editing Tips", slug: "editing-tips" },
  { name: "Freelance Tips", slug: "freelance-tips" },
  { name: "Client Workflow", slug: "client-workflow" },
  { name: "File Management", slug: "file-management" },
  { name: "Productivity", slug: "productivity" },
  { name: "Tools", slug: "tools" },
];

const BlogEditor = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [post, setPost] = useState({
    id: "",
    title: "",
    slug: "",
    category: "editing-tips",
    excerpt: "",
    content: "",
    cover_image_url: "",
    meta_title: "",
    meta_description: "",
    published: false
  });

  const isOwner = profile?.is_admin || user?.email?.toLowerCase() === "sohamahire26@gmail.com";

  useEffect(() => {
    if (editId && isOwner) {
      const loadPost = async () => {
        try {
          const data = await getBlogPostById(editId);
          if (data) setPost(data);
        } catch (err) {
          toast({ title: "Error loading post", variant: "destructive" });
        } finally {
          setFetching(false);
        }
      };
      loadPost();
    }
  }, [editId, isOwner]);

  const handleSave = async () => {
    if (!post.title || !post.slug || !post.content) {
      toast({ title: "Missing required fields", description: "Title, slug, and content are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await saveBlogPost(post);
      toast({ title: "Post saved successfully!" });
      navigate("/blog/admin");
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    if (post.slug) return; // Don't overwrite if already set
    const slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setPost({ ...post, slug });
  };

  const insertTag = (tag: string, closeTag?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = "";
    if (closeTag) {
      newText = `${before}${tag}${selection}${closeTag}${after}`;
    } else {
      newText = `${before}${tag}${after}`;
    }

    setPost({ ...post, content: newText });
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + tag.length + selection.length + (closeTag ? closeTag.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const wordCount = post.content.trim() ? post.content.trim().split(/\s+/).length : 0;
  const readTime = Math.ceil(wordCount / 200);

  if (!isOwner) return <Navigate to="/404" replace />;
  if (fetching) return <LayoutComp><div className="flex py-48 justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></LayoutComp>;

  return (
    <LayoutComp>
      <SEOHead title="Blog Editor — Giglant Admin" description="Write and publish professional blog posts." />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link to="/blog/admin" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-display text-3xl font-bold">{editId ? "Edit Post" : "New Post"}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? <Layout className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {previewMode ? "Editor Mode" : "Live Preview"}
              </Button>
              <Button onClick={handleSave} disabled={loading} className="shadow-lg shadow-primary/20">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {post.published ? "Update & Publish" : "Save Draft"}
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className={`lg:col-span-2 space-y-6 ${previewMode ? "hidden" : "block"}`}>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Post Title</label>
                  <Input 
                    value={post.title} 
                    onChange={e => setPost({...post, title: e.target.value})} 
                    onBlur={generateSlug}
                    placeholder="Enter a catchy title..." 
                    className="text-xl font-bold h-12"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">URL Slug</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        value={post.slug} 
                        onChange={e => setPost({...post, slug: e.target.value})} 
                        placeholder="post-url-slug" 
                        className="pl-9 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                    <select 
                      value={post.category} 
                      onChange={e => setPost({...post, category: e.target.value})}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
                    >
                      {CATEGORIES.map(cat => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Excerpt (Short Summary)</label>
                  <Textarea 
                    value={post.excerpt} 
                    onChange={e => setPost({...post, excerpt: e.target.value})} 
                    placeholder="A brief summary for the blog list page..." 
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTag('<strong>', '</strong>')} title="Bold"><Bold size={16} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTag('<em>', '</em>')} title="Italic"><Italic size={16} /></Button>
                  <div className="mx-1 h-4 w-px bg-border" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTag('<h2>', '</h2>')} title="Heading 2"><Heading2 size={16} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTag('<h3>', '</h3>')} title="Heading 3"><Heading3 size={16} /></Button>
                  <div className="mx-1 h-4 w-px bg-border" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTag('<a href="https://">', '</a>')} title="Link"><LinkIcon size={16} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTag('<img src="https://" alt="description" className="w-full rounded-xl my-8" />')} title="Image"><ImageIcon size={16} /></Button>
                  <div className="mx-1 h-4 w-px bg-border" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} title="List"><List size={16} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTag('<p>', '</p>')} title="Paragraph"><Type size={16} /></Button>
                </div>
                
                <Textarea 
                  ref={textareaRef}
                  value={post.content} 
                  onChange={e => setPost({...post, content: e.target.value})} 
                  placeholder="Write your masterpiece here using HTML tags..." 
                  className="min-h-[600px] border-none font-mono text-sm leading-relaxed focus-visible:ring-0"
                />
                
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <div className="flex gap-4">
                    <span>Words: {wordCount}</span>
                    <span>Read Time: {readTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles size={10} className="text-primary" />
                    <span>Professional Editor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Pane */}
            <div className={`lg:col-span-2 ${previewMode ? "block" : "hidden"}`}>
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm min-h-[700px]">
                {post.cover_image_url && (
                  <div className="mb-8 overflow-hidden rounded-2xl border border-border shadow-lg">
                    <img src={post.cover_image_url} alt="Cover" className="w-full object-cover aspect-video" />
                  </div>
                )}
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    {post.category.replace(/-/g, " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {readTime} min read
                  </span>
                </div>
                <h1 className="font-display text-4xl font-bold text-foreground mb-6 leading-tight">{post.title || "Post Title Preview"}</h1>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed border-l-4 border-primary/20 pl-6">{post.excerpt}</p>
                <article className="prose prose-lg prose-red max-w-none">
                  <div className="blog-content text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content || "<p class='text-muted-foreground italic'>No content yet. Start writing in the editor...</p>" }} />
                </article>
              </div>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-primary" /> Publishing
                    </h3>
                    <div className={`h-2 w-2 rounded-full ${post.published ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition-all hover:bg-secondary/50">
                    <input 
                      type="checkbox" 
                      checked={post.published} 
                      onChange={e => setPost({...post, published: e.target.checked})}
                      className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-sm font-bold">Published</p>
                      <p className="text-[10px] text-muted-foreground">Visible to everyone on the blog</p>
                    </div>
                  </label>
                </div>

                <div className="space-y-4 pt-6 border-t border-border">
                  <h3 className="font-display font-bold flex items-center gap-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-primary" /> Media
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cover Image URL</label>
                    <Input 
                      value={post.cover_image_url} 
                      onChange={e => setPost({...post, cover_image_url: e.target.value})} 
                      placeholder="https://images.unsplash.com/..." 
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-border">
                  <h3 className="font-display font-bold flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" /> SEO Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Title</label>
                      <Input 
                        value={post.meta_title} 
                        onChange={e => setPost({...post, meta_title: e.target.value})} 
                        placeholder="SEO Title (max 60 chars)" 
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Description</label>
                      <Textarea 
                        value={post.meta_description} 
                        onChange={e => setPost({...post, meta_description: e.target.value})} 
                        placeholder="SEO Description (max 160 chars)" 
                        rows={3} 
                        className="text-xs resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-primary/5 p-6 space-y-3">
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Writing Tips
                </h4>
                <ul className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
                  <li>• Use <strong>H2</strong> for main sections and <strong>H3</strong> for sub-sections.</li>
                  <li>• Keep paragraphs short (2-3 sentences) for better readability.</li>
                  <li>• Add <strong>alt text</strong> to images for better SEO and accessibility.</li>
                  <li>• Use <strong>bold</strong> text to highlight key takeaways.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LayoutComp>
  );
};

export default BlogEditor;