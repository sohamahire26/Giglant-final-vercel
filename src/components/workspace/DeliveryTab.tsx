"use client";

import { useState } from "react";
import { MessageSquare, Copy, Mail, Info, CheckCircle2, Send, User, Link as LinkIcon, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import type { Project } from "./types";

type DeliveryType = "DRAFT" | "FINAL" | "REVISION";
type MessageTone = "FRIENDLY" | "PROFESSIONAL" | "PREMIUM" | "URGENT";

interface Props {
  project: Project;
}

const TEMPLATES: Record<DeliveryType, string> = {
  DRAFT: `Hi {client_name},

I've shared the initial draft for {company}.

You can review the work here: {review_link}

Let me know your feedback so I can refine it further.

Best,
{your_name}`,
  FINAL: `Hi {client_name},

The final version of {company} is ready.

You can access the final files here: {review_link}

Everything is polished and ready for use. Let me know if you need anything else.

Best regards,
{your_name}`,
  REVISION: `Hi {client_name},

I've made the requested revisions to {company}.

You can see the updates here: {review_link}

Let me know if this aligns with your expectations.

Best,
{your_name}`
};

const DeliveryTab = ({ project }: Props) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    your_name: "",
    client_name: project.client_name || "",
    company: project.name || "",
    review_link: `${window.location.origin}/client/${project.share_token}`,
    delivery_type: "FINAL" as DeliveryType,
    tone: "PROFESSIONAL" as MessageTone
  });

  const [output, setOutput] = useState<{ subject: string; body: string } | null>(null);

  const generateMessage = () => {
    if (!formData.client_name || !formData.company || !formData.review_link) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Client Name, Company, and Review Link.",
        variant: "destructive"
      });
      return;
    }

    let body = TEMPLATES[formData.delivery_type];

    // Apply Tone Modifiers
    if (formData.tone === "FRIENDLY") {
      body = body.replace("Hi {client_name},", "Hi {client_name},\n\nHope you're doing great!");
    } else if (formData.tone === "PREMIUM") {
      body = body.replace("ready", "fully optimized and finalized to a high standard");
      body = body.replace("let me know", "feel free to share any final thoughts");
      body = body.replace("Let me know", "Feel free to share any final thoughts");
    } else if (formData.tone === "URGENT") {
      const closingIndex = body.lastIndexOf("\n\nBest");
      if (closingIndex !== -1) {
        body = body.slice(0, closingIndex) + "\n\nPlease review this at the earliest." + body.slice(closingIndex);
      }
    }

    // Replace Placeholders
    body = body
      .replace(/{client_name}/g, formData.client_name)
      .replace(/{company}/g, formData.company)
      .replace(/{review_link}/g, formData.review_link)
      .replace(/{your_name}/g, formData.your_name || "Me");

    // Clean up extra newlines
    body = body.replace(/\n\n\n/g, "\n\n").trim();

    const subject = `${formData.delivery_type === 'FINAL' ? 'Final Delivery' : formData.delivery_type === 'REVISION' ? 'Revised Files' : 'Initial Draft'}: ${formData.company}`;

    setOutput({ subject, body });
    toast({
      title: "Message Generated",
      description: "Your professional delivery message is ready."
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`
    });
  };

  const openInGmail = () => {
    if (!output) return;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(output.subject)}&body=${encodeURIComponent(output.body)}`;
    window.open(mailtoUrl, "_blank");
  };

  return (
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Delivery Assistant</h1>
        <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
          Craft professional messages to accompany your project deliveries using structured templates.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Message Details</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Your Name" 
                  className="pl-10"
                  value={formData.your_name}
                  onChange={(e) => setFormData({ ...formData, your_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Client Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Rahul" 
                  className="pl-10"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Company Name" 
                  className="pl-10"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Review Link</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="https://..." 
                  className="pl-10"
                  value={formData.review_link}
                  onChange={(e) => setFormData({ ...formData, review_link: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivery Type</label>
            <div className="flex flex-wrap gap-2">
              {(["DRAFT", "FINAL", "REVISION"] as DeliveryType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, delivery_type: type })}
                  className={`rounded-lg px-6 py-2 text-sm font-medium capitalize transition-all ${
                    formData.delivery_type === type 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {type.toLowerCase()}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              <p>
                {formData.delivery_type === "FINAL" && "Use this when the project is complete. It sounds polished, conclusive, and ready for official sign-off."}
                {formData.delivery_type === "DRAFT" && "Perfect for initial concepts or rough cuts to get early feedback."}
                {formData.delivery_type === "REVISION" && "Use this after addressing specific feedback from the client."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Message Tone</label>
            <div className="flex flex-wrap gap-2">
              {(["FRIENDLY", "PROFESSIONAL", "PREMIUM", "URGENT"] as MessageTone[]).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setFormData({ ...formData, tone: tone })}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                    formData.tone === tone 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tone.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generateMessage} className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20">
            Generate Delivery Message
          </Button>
        </div>

        <div className="space-y-6">
          {output ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Generated Message</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(output.body, "Message")}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Message
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-background p-5 shadow-inner">
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                    {output.body}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={openInGmail} className="flex-1 bg-[#EA4335] hover:bg-[#d33426] text-white py-6">
                    <Mail className="mr-2 h-4 w-4" /> Open in Gmail
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No message generated yet</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Fill in the delivery details and click "Generate" to create your professional hand-off message.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Delivery Tips</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Always include a clear link to the final files.",
                "Briefly mention the next steps (e.g., feedback period).",
                "Keep the tone professional and appreciative.",
                "Double-check that all requested assets are included."
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <FAQSection 
        title="Delivery FAQ" 
        items={[
          { 
            question: "How does this help my workflow?", 
            answer: "It ensures you send consistent, professional messages every time you deliver work, which builds trust and reduces back-and-forth." 
          },
          { 
            question: "Can I customize the message?", 
            answer: "Yes, you can edit the message directly after copying it to your email client or generating it here." 
          }
        ]} 
      />
    </div>
  );
};

export default DeliveryTab;