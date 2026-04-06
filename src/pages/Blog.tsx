import { Link } from "react-router-dom";
import { ArrowRight, FolderOpen } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";


const categories = [
  { name: "Editing Tips", slug: "editing-tips", description: "Tutorials and tips for video editing workflow and photo editing pipelines." },
  { name: "Freelance Tips", slug: "freelance-tips", description: "Grow your freelance career with practical freelancer workflow advice." },
  { name: "Client Workflow", slug: "client-workflow", description: "Better client delivery workflow strategies to communicate and deliver work." },
  { name: "File Management", slug: "file-management", description: "Organize, rename, and manage your project files in any content workflow." },
  { name: "Productivity", slug: "productivity", description: "Work smarter with tools, habits, and systems for your editing pipeline." },
  { name: "Tools", slug: "tools", description: "Guides and updates about Giglant's free online tools for post production workflow." },
];

const BlogIndex = () => (
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/blog/${cat.slug}`} className="group rounded-2xl border border-border bg-card p-8 transition-all card-shadow hover:card-shadow-hover">
              <FolderOpen className="mb-3 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">{cat.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{cat.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Browse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default BlogIndex;
