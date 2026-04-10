import { useState } from "react";
import { ClipboardCopy, HelpCircle, Info, MessageSquare, Receipt, Sparkles, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import type { Project } from "./types";

declare const puter: any;

const faq = [
  { question: "How does the AI help with invoices?", answer: "It crafts professional payment requests and reminders that are polite yet firm, helping you maintain a good relationship while ensuring you get paid." },
  { question: "Can I specify the currency?", answer: "Yes, just include the currency symbol in the amount field, and the AI will incorporate it into the message." },
];

interface Props { project: Project; }

const InvoiceTab = ({ project }: Props) => {
  const [invoiceType, setInvoiceType] = useState<"initial" | "reminder" | "final">("initial");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDeadline, setInvoiceDeadline] = useState("");
  const [invoiceOutput, setInvoiceOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setGenerating(true);
    try {
      const prompt = `Generate a professional ${invoiceType} payment request message for a project named "${project.name}" for client "${project.client_name || 'Client'}". 
      The amount is ${invoiceAmount || 'the agreed amount'}. 
      ${invoiceDeadline ? `The deadline is ${invoiceDeadline}.` : ''}
      The message should be ${invoiceType === 'initial' ? 'polite and clear' : invoiceType === 'reminder' ? 'friendly but firm' : 'very firm and urgent'}.`;
      
      const response = await puter.ai.chat(prompt);
      setInvoiceOutput(response.toString().trim());
    } catch (err) {
      console.error("Puter AI Error:", err);
      toast({ title: "AI Generation failed", description: "Please try again later.", variant: "destructive" });
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
              <h2 className="font-display text-lg font-semibold text-foreground">AI Payment Request</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Message Type</label>
                <div className="flex flex-wrap gap-2">
                  {(["initial", "reminder", "final"] as const).map(t => (
                    <button key={t} onClick={() => setInvoiceType(t)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${invoiceType === t ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                      {t === "initial" ? "Initial Invoice" : t === "reminder" ? "Friendly Reminder" : "Final Follow-up"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Total Amount</label>
                  <input type="text" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="e.g., $500"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Deadline (optional)</label>
                  <input type="text" value={invoiceDeadline} onChange={e => setInvoiceDeadline(e.target.value)} placeholder="e.g., 48 hours"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
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
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> AI Generated Request
                  </label>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(invoiceOutput); toast({ title: "Copied to clipboard!" }); }} 
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <ClipboardCopy className="h-3.5 w-3.5" /> Copy Message
                  </button>
                </div>
                <textarea 
                  value={invoiceOutput} 
                  onChange={e => setInvoiceOutput(e.target.value)} 
                  className="h-64 w-full rounded-xl border border-border bg-background p-5 text-sm leading-relaxed text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none shadow-inner" 
                />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Payment Tips</h3>
            </div>
            <ul className="space-y-4 text-xs text-muted-foreground">
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Professionalism:</strong> AI ensures your requests are polite but effective.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Clarity:</strong> AI clearly states the amount and project context.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <FAQSection title="Invoice FAQ" items={faq} />
    </div>
  );
};

export default InvoiceTab;