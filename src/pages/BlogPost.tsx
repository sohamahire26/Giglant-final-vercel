import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Loader2, Clock, Share2, Bookmark } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { getBlogPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BlogPost = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const { toast } = useToast();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", category, slug],
    queryFn: () => getBlogPost(category || "", slug || ""),
    enabled: !!category && !!slug,
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share this article with your network." });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-48">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <SEOHead title="Post Not Found — Giglant" description="The requested blog post could not be found." />
        <section className="section-padding">
          <div className="container-tight max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-muted p-6">
                <Loader2 className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Post not found</h1>
            <p className="mt-4 text-muted-foreground">The article you're looking for might have been moved or deleted.</p>
            <Button asChild className="mt-8">
              <Link to="/blog">Back to Blog</Link>
            </Button>
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
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-card pt-12 pb-24 md:pt-20">
        <div className="container-tight max-w-4xl">
          <Link to={`/blog/${category}`} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to {category?.replace(/-/g, " ")}
          </Link>
          
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              {post.category.replace(/-/g, " ")}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {Math.ceil(post.content.split(" ").length / 200)} min read
            </div>
          </div>
          
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          
          <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="mt-10 flex items-center justify-between border-t border-border pt-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">G</div>
              <div>
                <p className="text-sm font-bold text-foreground">Giglant Team</p>
                <p className="text-xs text-muted-foreground">Workflow Experts</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding pt-0">
        <div className="container-tight max-w-4xl">
          {post.cover_image_url && (
            <div className="-mt-12 mb-16 overflow-hidden rounded-3xl border border-border shadow-2xl">
              <img src={post.cover_image_url} alt={post.title} className="w-full object-cover" />
            </div>
          )}
          
          <article className="prose prose-lg prose-red max-w-none">
            <div
              className="blog-content text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
          
          {/* Footer CTA */}
          <div className="mt-24 rounded-3xl bg-foreground p-12 text-center text-background">
            <h2 className="font-display text-3xl font-bold">Enjoyed this article?</h2>
            <p className="mt-4 text-lg text-background/70">Check out our free tools to optimize your video editing workflow.</p>
            <Button asChild variant="hero" className="mt-8">
              <Link to="/tools">Explore Tools</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;