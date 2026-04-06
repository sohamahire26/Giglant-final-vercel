import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";

const templates = [
  { label: "Final Delivery", generate: (project: string, client: string) =>
    `Hi ${client || "there"},\n\nPlease find the final files for ${project || "the project"} attached.\n\nKindly review and let me know if everything looks good. If there are no changes needed, please confirm so I can close this out.\n\nThank you for the opportunity to work together!\n\nBest regards` },
  { label: "Draft / WIP", generate: (project: string, client: string) =>
    `Hi ${client || "there"},\n\nHere's the current draft for ${project || "the project"}.\n\nPlease review and share your feedback. I'm happy to make any adjustments needed.\n\nLooking forward to your thoughts!\n\nBest regards` },
  { label: "Revision Delivery", generate: (project: string, client: string) =>
    `Hi ${client || "there"},\n\nI've made the requested changes to ${project || "the project"}. Updated files are attached.\n\nPlease review the revisions and let me know if anything else needs adjusting.\n\nBest regards` },
];

const faq = [
  { question: "How does the Delivery Message Generator improve my client delivery workflow?", answer: "It generates professional delivery messages you can send to clients when sharing project files — eliminating the repetitive writing in your freelancer workflow." },
  { question: "Can I customize the messages for my video editing workflow?", answer: "Yes! Enter your project name and client name, and the tool generates a personalized message you can edit further for your specific editing pipeline needs." },
  { question: "Is this free for my freelancer workflow?", answer: "Yes, completely free. No signup needed — just open and streamline your client delivery workflow." },
  { question: "What delivery types does it support?", answer: "Final delivery, draft/WIP, and revision delivery — covering the main stages of any post production workflow and content workflow." },
];

const DeliveryMessageGenerator = () => {
  const [project, setProject] = useState("");
  const [client, setClient] = useState("");
  const [selected, setSelected] = useState(0);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => setOutput(templates[selected].generate(project, client));
  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <Layout>
      <SEOHead
        title="Delivery Message Generator — Client Delivery Workflow Tool | Giglant"
        description="Generate professional file delivery messages for your client delivery workflow. Free tool for freelancer workflow — create perfect delivery emails for video editing and post production projects."
      />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Delivery Message Generator</h1>
            <p className="mt-4 text-lg text-muted-foreground">Generate professional client delivery workflow messages in seconds for your freelancer workflow.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Project Name</label>
                <input type="text" value={project} onChange={(e) => setProject(e.target.value)} placeholder="Brand Redesign" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Client Name</label>
                <input type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="John" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Message Type</label>
              <div className="flex flex-wrap gap-2">
                {templates.map((t, i) => (
                  <button key={t.label} onClick={() => setSelected(i)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selected === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleGenerate} className="mt-4 w-full">Generate Message</Button>
            {output && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Your Message</label>
                  <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <textarea value={output} onChange={(e) => setOutput(e.target.value)}
                  className="h-48 w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground focus:border-primary focus:outline-none resize-none" />
              </div>
            )}
          </div>

          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">About Delivery Message Generator — Client Delivery Workflow</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
              <p>In any freelancer workflow, you send files to clients multiple times per project — drafts, revisions, finals. Writing the same professional message wastes valuable minutes from your editing pipeline.</p>
              <p>The Delivery Message Generator creates polished, ready-to-send messages based on your project details and delivery type — optimizing your client delivery workflow and post production workflow.</p>
              <h3 className="font-display text-lg font-semibold text-foreground">Features for Your Content Workflow</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Multiple templates (final, draft, revision) for your video editing workflow</li>
                <li>Personalized with project & client names</li>
                <li>Editable output for your freelancer workflow</li>
                <li>One-click copy for seamless client delivery workflow</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <FAQSection title="Delivery Message FAQ — Client Delivery Workflow" items={faq} />
    </Layout>
  );
};

export default DeliveryMessageGenerator;
