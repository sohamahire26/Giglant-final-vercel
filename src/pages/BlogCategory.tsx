import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { getBlogPosts } from "@/lib/api";

const categoryInfo: Record<string, { name: string; description: string }> = {
  "editing-tips": { name: "Editing Tips", description: "Tutorials and tips for video editing workflow and photo editing pipelines." },
  "freelance-tips": { name: "Freelance Tips", description: "Grow your freelance career with practical freelancer workflow advice." },
  "client-workflow": { name: "Client Workflow", description: "Better client delivery workflow strategies to communicate and deliver work." },
  "file-management": { name: "File Management", description: "Organize, rename, and manage your project files in any content workflow." },
  "productivity": { name: "Productivity", description: "Work smarter with tools, habits, and systems for your editing pipeline." },
  "tools": { name: "Tools", description: "Guides and updates about Giglant's free online tools for post production workflow." },
};

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  cover_image_url: string | null;
}

const BlogCategory = () => {
  const { category } = useParams<{ category: string }>();
  const info = categoryInfo[category || ""] || { name: "Category", description: "" };
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBlogPosts(category);
        setPosts((data || []) as Post[]);
      } catch {
        setPosts([]);
      }
      setLoading(false);
    };
    load();
  }, [category]);

  return (
    <Layout>
      <SEOHead
        title={`${info.name} — Video Editing Workflow Blog | Giglant`}
        description={info.description}
      />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-6">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">{info.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{info.description}</p>

          {loading ? (
            <div className="mt-12 text-center text-muted-foreground">Loading posts...</div>
          ) : posts.length > 0 ? (
            <div className="mt-12 space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${category}/${post.slug}`}
                  className="block rounded-2xl border border-border bg-card p-6 transition-all card-shadow hover:card-shadow-hover"
                >
                  <h2 className="font-display text-xl font-semibold text-foreground">{post.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">No posts yet</h2>
              <p className="mt-2 text-muted-foreground">Check back soon for new content in this category.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogCategory;
