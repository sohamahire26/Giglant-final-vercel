import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { getBlogPost } from "@/lib/api";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string;
  meta_title: string | null;
  meta_description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

const BlogPost = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBlogPost(category || "", slug || "");
        setPost(data as Post);
      } catch {
        setPost(null);
      }
      setLoading(false);
    };
    load();
  }, [category, slug]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <SEOHead title={`${slug?.replace(/-/g, " ") || "Blog Post"} — Giglant Blog`} description="Blog post on Giglant." />
        <section className="section-padding">
          <div className="container-tight max-w-3xl">
            <Link to={`/blog/${category}`} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">Post not found</h1>
              <p className="mt-2 text-muted-foreground">This post may not exist or hasn't been published yet.</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={post.meta_title || `${post.title} — Giglant Blog`}
        description={post.meta_description || post.excerpt || post.content.replace(/<[^>]*>/g, "").substring(0, 160)}
      />
      <section className="section-padding">
        <div className="container-tight max-w-3xl">
          <Link to={`/blog/${category}`} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to {category?.replace(/-/g, " ")}
          </Link>
          <article>
            {post.cover_image_url && (
              <img src={post.cover_image_url} alt={post.title} className="mb-6 w-full rounded-2xl object-cover" />
            )}
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{post.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div
              className="mt-8 prose max-w-none text-foreground text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
