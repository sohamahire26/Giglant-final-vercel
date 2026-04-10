import { Link } from "react-router-dom";
import { FileEdit, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";

const tools = [
  { name: "File Renamer", description: "Smart file renaming with auto-detection and numbering. Organize your editing pipeline — stop naming files v1-final-final2.", icon: FileEdit, href: "/tools/file-renamer" },
];

const toolsFAQ = [
  { question: "Is the File Renamer tool free?", answer: "Yes! The File Renamer is completely free to use with no limits. Built for real video editing workflow and freelancer workflow needs." },
  { question: "Does the tool work offline?", answer: "The File Renamer works entirely in your browser and doesn't require an internet connection once loaded." },
  { question: "What workflows does this tool support?", answer: "It supports video editing workflow, freelancer workflow, file management workflow, post production workflow, and content workflow optimization." },
];

const ToolsPage = () => (
  <Layout>
    <SEOHead
      title="Free Online Tools for Video Editing Workflow & Freelancers | Giglant"
      description="Browse Giglant's free tools for video editing workflow, freelancer workflow, and post production. Smart file renaming to streamline your editing pipeline."
    />
    <section className="section-padding">
      <div className="container-tight">
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">All Tools for Your Editing Pipeline</h1>
          <p className="mt-4 text-lg text-muted-foreground">Free tools built for real video editing workflow, freelancer workflow, and post production needs.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.name} to={tool.href} className="group flex flex-col rounded-2xl border border-border bg-card p-8 transition-all card-shadow hover:card-shadow-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <tool.icon className="h-6 w-6" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground">{tool.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Use Tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
    <FAQSection title="Tools FAQ — Video Editing Workflow" items={toolsFAQ} />
  </Layout>
);

export default ToolsPage;