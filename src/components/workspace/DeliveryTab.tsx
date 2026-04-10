import { useState, useEffect } from "react";
import { ClipboardCopy, Info, MessageSquare, Sparkles, Loader2, User, Building, Link as LinkIcon, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import type { Project } from "./types";

declare const puter: any;

interface Props { project: Project; }

const DeliveryTab = ({ project }: Props) => {
  const [userName, setUserName] = useState("");
  const [clientName, setClientName] = useState(project.client_name || "");
  const [companyName, setCompanyName] = useState("");
  const [reviewLink, setReviewLink] = useState(`${window.location.origin}/client/${project.share_token}`);
  const [deliveryType, setDeliveryType] = useState<"draft" | "final" | "revision">("final");
  const [deliveryTone, setDeliveryTone] = useState("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  const [deliveryOutput, setDeliveryOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setGenerating(true);
    try {
      const prompt = `Generate a professional ${deliveryTone} delivery message.
      Context:
      - Freelancer Name: ${userName || 'the freelancer'}
      - Client Name: ${clientName || 'Client'}
      - Company: ${companyName || 'their company'}
      - Project: ${project.name}
      - Work Type: ${project.work_type}
      - Stage: ${deliveryType}
      - Review Link: ${reviewLink}
      ${customPrompt ? `- Additional Instructions: ${customPrompt}` : ""}
      
      Make it concise, professional, and include the review link clearly.`;
      
      const response = await puter.ai.chat(prompt);
      setDeliveryOutput(response.toString().trim());
    } catch (err) {
      toast({ title: "AI Generation failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">AI Delivery Assistant</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Message Details</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Your Name" className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase">Client Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Name" className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase">Company</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company Name" className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase">Review Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" value={reviewLink} onChange={e => setReviewLink(e.target.value)} placeholder="Review Link" className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Delivery Type</label>
                <div className="flex flex-wrap gap-2">
                  {(["draft", "final", "revision"] as const).map(key => (
                    <button key={key} onClick={() => setDeliveryType(key)} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${deliveryType === key ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{key}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Message Tone</label>
                <div className="flex flex-wrap gap-2">
                  {["friendly", "professional", "premium", "urgent"].map(t => (
                    <button key={t} onClick={() => setDeliveryTone(t)} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${deliveryTone === t ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-primary" /> Custom Instructions (Optional)
                </label>
                <textarea 
                  value={customPrompt} 
                  onChange={e => setCustomPrompt(e.target.value)} 
                  placeholder="e.g., Mention that I'm going on vacation next week, or ask them to check the color grading specifically." 
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" 
                />
              </div>

              <Button onClick={generate} className="w-full h-12 text-base" disabled={generating}>
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {generating ? "AI is writing..." : "Generate AI Message"}
              </Button>
            </div>

            {deliveryOutput && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> AI Generated Message</label>
                  <button onClick={() => { navigator.clipboard.writeText(deliveryOutput); toast({ title: "Copied!" }); }} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"><ClipboardCopy className="h-3.5 w-3.5" /> Copy</button>
                </div>
                <textarea value={deliveryOutput} onChange={e => setDeliveryOutput(e.target.value)} className="h-64 w-full rounded-xl border border-border bg-background p-5 text-sm leading-relaxed text-foreground focus:border-primary focus:outline-none resize-none shadow-inner" />
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4"><Info className="h-5 w-5 text-primary" /><h3 className="font-display text-sm font-semibold text-foreground">AI Benefits</h3></div>
            <p className="text-xs text-muted-foreground leading-relaxed">AI analyzes your project context to write messages that increase client satisfaction and reduce friction.</p>
          </div>
        </div>
      </div>
      <FAQSection title="Delivery FAQ" items={[{ question: "How does it work?", answer: "It uses Puter AI to craft messages based on your project details and selected tone." }]} />
    </div>
  );
};

export default DeliveryTab;