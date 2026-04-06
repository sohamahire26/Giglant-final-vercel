import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";

const formatRevisions = (raw: string): string => {
  const lines = raw.split("\n").filter((l) => l.trim());
  const revisions: string[][] = [];
  let current: string[] = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    const isHeader = /^(revision|round|version|v)\s*\d*/i.test(trimmed);
    if (isHeader && current.length > 0) { revisions.push(current); current = []; }
    const cleaned = trimmed.replace(/^[-•*]\s*/, "").replace(/^\d+[.)]\s*/, "");
    if (cleaned) current.push("- " + cleaned);
  });
  if (current.length > 0) revisions.push(current);
  if (revisions.length === 0) return "";
  return revisions.map((group, i) => `Revision ${i + 1}:\n${group.join("\n")}`).join("\n\n");
};

const faq = [
  { question: "How does the Revision Notes Formatter improve my video editing workflow?", answer: "Paste messy client feedback and the tool organizes it into clean, numbered revision lists — essential for tracking changes in your editing pipeline and post production workflow." },
  { question: "Can it handle multiple rounds of revisions?", answer: "Yes! It automatically detects revision breaks and groups feedback into separate rounds, keeping your freelancer workflow organized across the entire content workflow." },
  { question: "Is my feedback data stored?", answer: "No. Everything is processed in your browser. Nothing is stored or sent to any server — your client delivery workflow stays private." },
  { question: "How does this fit into my editing pipeline?", answer: "Copy client feedback from emails or messages, paste it here, format it instantly, then use the clean list to work through changes systematically in your video editing workflow." },
];

const RevisionNotesFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFormat = () => setOutput(formatRevisions(input));
  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <Layout>
      <SEOHead
        title="Revision Notes Formatter — Clean Up Client Feedback for Video Editing Workflow | Giglant"
        description="Turn messy client revision notes into clean, organized lists for your video editing workflow. Essential post production workflow tool for freelancers in any editing pipeline."
      />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Revision Notes Formatter</h1>
            <p className="mt-4 text-lg text-muted-foreground">Paste messy client feedback. Get clean revision lists for your video editing workflow and post production pipeline.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Raw Feedback</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={"change the color to blue\nfix the logo its too small\nalso update the headline text\n\nround 2\nmake it pop more\nadd more contrast"}
                className="h-64 w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" />
              <Button onClick={handleFormat} className="mt-3 w-full" disabled={!input.trim()}>Format Notes</Button>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Formatted Output</label>
                {output && (
                  <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <div className="h-64 w-full overflow-auto rounded-xl border border-border bg-card p-4 text-sm whitespace-pre-wrap text-foreground">
                {output || <span className="text-muted-foreground">Formatted notes will appear here...</span>}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">About Revision Notes Formatter — Post Production Workflow</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
              <p>Client feedback in your video editing workflow often arrives in scattered emails, chat messages, or voice notes. It's hard to track what needs changing in your editing pipeline and what's already been addressed.</p>
              <p>The Revision Notes Formatter takes your raw, unstructured feedback and converts it into clean, numbered revision lists — making it easy to track changes across multiple revision rounds in your freelancer workflow and client delivery workflow.</p>
              <h3 className="font-display text-lg font-semibold text-foreground">Features for Your Content Workflow</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Auto-detect revision rounds in your post production workflow</li>
                <li>Clean bullet formatting for your editing pipeline</li>
                <li>One-click copy to clipboard for seamless freelancer workflow</li>
                <li>100% browser-based — private file management workflow</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <FAQSection title="Revision Notes FAQ — Video Editing Workflow" items={faq} />
    </Layout>
  );
};

export default RevisionNotesFormatter;
