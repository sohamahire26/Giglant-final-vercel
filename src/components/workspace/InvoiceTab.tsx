import { useState } from "react";
import { ClipboardCopy, Info, MessageSquare, Receipt, Sparkles, Loader2, User, Building, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import type { Project } from "./types";

declare const puter: any;

interface Props { project: Project; }

const InvoiceTab = ({ project }: Props) => {
  const [userName, setUserName] = useState("");
  const [clientName, setClientName] = useState(project.client_name || "");
  const [companyName, setCompanyName] = useState("");
  const [invoiceType, setInvoiceType] = useState<"initial" | "reminder" | "final">("initial");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDeadline, setInvoiceDeadline] = useState("");
  const [invoiceOutput, setInvoiceOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setGenerating(true);
    try {
      const prompt = `Generate a professional ${invoiceType} payment request.
      Context:
      - Freelancer Name: ${userName || 'the freelancer'}
      - Client Name: ${clientName || 'Client'}
      - Company: ${companyName || 'their company'}
      - Project: ${project.name}
      - Amount: ${invoiceAmount || 'the agreed amount'}
      - Deadline: ${invoiceDeadline || 'as soon as possible'}
      
      Tone: ${invoiceType === 'initial' ? 'polite and clear' : invoiceType === 'reminder' ? 'friendly but firm' : 'very firm and urgent'}.`;
      
      const response = await puter.ai.chat(prompt);
      setInvoiceOutput(response.toString().trim());
    } catch (err) {
      toast({ title: "AI Generation failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">AI Invoice Assistant</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Receipt className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Payment Details</h2>
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
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="e.g., $500" className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" value={invoiceDeadline} onChange={e => setInvoiceDeadline(e.target.value)} placeholder="e.g., Friday, Oct 25th" className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Message Type</label>
                <div className="flex flex-wrap gap-2">
                  {(["initial", "reminder", "final"] as const).map(t => (
                    <button key={t} onClick={() => setInvoiceType(t)} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${invoiceType === t ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{t === "initial" ? "Initial Invoice" : t === "reminder" ? "Friendly Reminder" : "Final Follow-up"}</button>
                  ))}
                </div>
              </div>
              <Button onClick={generate} className="w-full h-12 text-base" disabled={generating}>
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {generating ? "AI is writing..." : "Generate AI Request"}
              </Button>
            </div>

            {invoiceOutput && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> AI Generated Request</label>
                  <button onClick={() => { navigator.clipboard.writeText(invoiceOutput); toast({ title: "Copied!" }); }} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"><ClipboardCopy className="h-3.5 w-3.5" /> Copy</button>
                </div>
                <textarea value={invoiceOutput} onChange={e => setInvoiceOutput(e.target.value)} className="h-64 w-full rounded-xl border border-border bg-background p-5 text-sm leading-relaxed text-foreground focus:border-primary focus:outline-none resize-none shadow-inner" />
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4"><Info className="h-5 w-5 text-primary" /><h3 className="font-display text-sm font-semibold text-foreground">Payment Tips</h3></div>
            <p className="text-xs text-muted-foreground leading-relaxed">Professional reminders help you get paid faster without damaging client relationships.</p>
          </div>
        </div>
      </div>
      <FAQSection title="Invoice FAQ" items={[{ question: "How does it work?", answer: "It uses Puter AI to craft polite but firm payment requests based on your project details." }]} />
    </div>
  );
};

export default InvoiceTab;