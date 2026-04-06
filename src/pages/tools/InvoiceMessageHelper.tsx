import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";

const invoiceTemplates = [
  { label: "Invoice Attached", generate: (client: string, amount: string, project: string) =>
    `Hi ${client || "there"},\n\nPlease find the invoice for ${project || "the project"} attached${amount ? ` — total amount: ${amount}` : ""}.\n\nPayment is due within 14 days. Please let me know if you have any questions.\n\nThank you!\n\nBest regards` },
  { label: "Payment Reminder", generate: (client: string, amount: string, project: string) =>
    `Hi ${client || "there"},\n\nJust a friendly reminder that the invoice for ${project || "the project"}${amount ? ` (${amount})` : ""} is still pending.\n\nWould you be able to process the payment at your earliest convenience? If it's already been sent, please disregard this message.\n\nThank you!\n\nBest regards` },
  { label: "Final Reminder", generate: (client: string, amount: string, project: string) =>
    `Hi ${client || "there"},\n\nI wanted to follow up regarding the outstanding invoice for ${project || "the project"}${amount ? ` (${amount})` : ""}.\n\nCould you please confirm when the payment will be processed? I'd really appreciate an update.\n\nThank you for your attention to this.\n\nBest regards` },
];

const faq = [
  { question: "How does the Invoice Message Helper improve my freelancer workflow?", answer: "It generates professional invoice messages and payment reminders so you can communicate about money without the awkwardness — essential for any freelancer workflow." },
  { question: "Can I customize the text for my video editing workflow clients?", answer: "Yes! The generated message is fully editable before you copy it. Personalize it for your specific client delivery workflow." },
  { question: "Is my data stored?", answer: "No. Everything runs in your browser. Nothing is saved or sent — your freelancer workflow stays private." },
  { question: "What message types are available?", answer: "Initial invoice, gentle payment reminder, and final follow-up — covering the complete payment cycle in your freelancer workflow and post production workflow." },
];

const InvoiceMessageHelper = () => {
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [project, setProject] = useState("");
  const [selected, setSelected] = useState(0);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => setOutput(invoiceTemplates[selected].generate(client, amount, project));
  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <Layout>
      <SEOHead
        title="Invoice Message Helper — Payment Messages for Freelancer Workflow | Giglant"
        description="Generate professional invoice messages and payment reminders for your freelancer workflow. Free tool for video editing workflow professionals to create polished payment communications."
      />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Invoice Message Helper</h1>
            <p className="mt-4 text-lg text-muted-foreground">Create invoice messages and payment reminders in seconds for your freelancer workflow.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Client Name</label>
                <input type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="John" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Project Name</label>
                <input type="text" value={project} onChange={(e) => setProject(e.target.value)} placeholder="Logo Design" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Amount (optional)</label>
                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$500" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Message Type</label>
              <div className="flex flex-wrap gap-2">
                {invoiceTemplates.map((t, i) => (
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
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">About Invoice Message Helper — Freelancer Workflow</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
              <p>Sending invoices and chasing payments is one of the least fun parts of any freelancer workflow. The Invoice Message Helper generates polished, professional messages so you can focus on your video editing workflow instead of writing payment emails.</p>
              <h3 className="font-display text-lg font-semibold text-foreground">Features for Your Freelancer Workflow</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Initial invoice, gentle reminder, and final follow-up for your post production workflow</li>
                <li>Personalized with client, project, and amount details</li>
                <li>Fully editable output for your client delivery workflow</li>
                <li>One-click copy — seamless content workflow integration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <FAQSection title="Invoice Message FAQ — Freelancer Workflow" items={faq} />
    </Layout>
  );
};

export default InvoiceMessageHelper;
