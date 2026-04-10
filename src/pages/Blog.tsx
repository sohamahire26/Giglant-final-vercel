import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { getBlogPosts } from "@/lib/api";

const categories = [
  { name: "Editing Tips", slug: "editing-tips" },
  { name: "Freelance Tips", slug: "freelance-tips" },
  { name: "Client Workflow", slug: "client-workflow" },
  { name: "File Management", slug: "file-management" },
  { name: "Productivity", slug: "productivity" },
  { name: "Tools", slug: "tools" },
];

const BlogIndex = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => getBlogPosts(),
  });

  const featuredPost = posts?.[0];
  const otherPosts = posts?.slice(1) || [];

  return (
    <Layout>
      <SEOHead
        title="Blog — Video Editing Workflow & Freelancer Tips | Giglant"
        description="Read helpful articles about video editing workflow, freelancer workflow, file management, post production workflow, and productivity tips for creators and freelancers."
      />
      <section className="section-padding">
        <div className="container-tight">
          <div className="mb-12 flex flex-col items-center text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Blog</h1>
            <p className="mt-4 text-lg text-muted-foreground">Tips, guides, and resources for your video editing workflow and freelancer workflow.</p>
          </div>

          {/* Category Navigation */}
          <div className="mb-12 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/blog/${cat.slug}`}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-16">
              {/* Featured Post */}
              {featuredPost && (
                <Link
                  to={`/blog/${featuredPost.category}/${featuredPost.slug}`}
                  className="group grid gap-8 overflow-hidden rounded-3xl border border-border bg-card transition-all card-shadow hover:card-shadow-hover md:grid-cols-2"
                >
                  <div className="aspect-[16/10] overflow-hidden md:aspect-auto">
                    <img
                      src={featuredPost.cover_image_url || "/placeholder.svg"}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                        Featured
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(featuredPost.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                      {featuredPost.title}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
                      Read Article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid Section */}
              {otherPosts.length > 0 && (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {otherPosts.map((post: any) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.category}/${post.slug}`}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all card-shadow hover:card-shadow-hover"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.cover_image_url || "/placeholder.svg"}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                            {post.category.replace(/-/g, " ")}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                          Read More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">No posts found</h2>
              <p className="mt-2 text-muted-foreground">Check back soon for new articles.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogIndex;