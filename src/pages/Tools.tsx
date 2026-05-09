import { Link } from "react-router-dom";
import { FileEdit, ArrowRight, Receipt } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";

const tools = [
  { name: "File Renamer", description: "Professional file renaming with auto-detection and numbering. Organize your editing pipeline — stop naming files v1-final-final2.", icon: FileEdit, href: "/tools/file-renamer" },
  { name: "Payment Generator", description: "Create professional payment requests and reminders using deterministic templates. Get paid faster with clear communication.", icon: Receipt, href: "/tools/payment-generator" },
];

const toolsFAQ = [
  { question: "Are these tools really free?", answer: "Yes! Our standalone tools like the File Renamer and Payment Generator are 100% free to use with no limits." },
  { question: "Do I need to upload my files to use the Renamer?", answer: "No. The File Renamer works entirely in your browser. Your files never leave your computer, ensuring total privacy for your client work." },
  { question: "What is the difference between these tools and the Workspace?", answer: "These are quick, standalone utilities. The Workspace is a full project management area where you can save these details and collaborate with clients." },
];

const ToolsPage = () => {
  const toolsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": tools.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": tool.name,
        "description": tool.description,
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web"
      }
    }))
  };

  return (
    <Layout>
      <SEOHead
        title="Free Online Tools for Video Editing Workflow & Freelancers | Giglant"
        description="Browse Giglant's free tools for video editing workflow, freelancer workflow, and post production. Professional file renaming and payment request tools."
        jsonLd={toolsJsonLd}
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
};

export default ToolsPage;