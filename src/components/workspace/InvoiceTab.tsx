import { useState } from "react";
import { ClipboardCopy, HelpCircle, Info, MessageSquare, Receipt, Sparkles, AlertTriangle, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import type { Project } from "./types";

const invoiceGen = {
  initial: (c: string, p: string, a: string, d: string) =>
    `Hi ${c},\n\nThe ${p} has been completed and delivered.\n\nAs agreed, the total amount for this project is ${a}.\n\nPlease review and complete the payment${d ? ` within ${d}` : " at your earliest convenience"}.\n\nLet me know once done so I can proceed with final delivery files.\n\nThanks for the collaboration!`,
  reminder: (c: string, p: string, a: string) =>
    `Hi ${c},\n\nJust a friendly reminder that the payment for ${p} (${a}) is still pending.\n\nWould you be able to process it at your earliest convenience?\n\nIf it's already been sent, please disregard this message.\n\nThank you!`,
  final: (c: string, p: string, a: string) =>
    `Hi ${c},\n\nI wanted to follow up regarding the outstanding payment for ${p} (${a}).\n\nCould you please confirm when the payment will be processed? I'd really appreciate an update.\n\nThank you for your attention to this.`,
};

const faq = [
  { question: "When should I send the initial invoice?", answer: "It's best to send the initial invoice immediately after the final work has been approved. This keeps the momentum going and ensures you get paid while the value of your work is fresh in the client's mind." },
  { question: "How often should I send reminders?", answer: "A friendly reminder 3-5 days after the initial request is standard. If the payment is still pending after 7-10 days, a more firm follow-up is appropriate." },
  { question: "Should I deliver final files before payment?", answer: "For new clients, it's highly recommended to wait for payment confirmation before delivering high-resolution or source files. This protects your work and ensures you are compensated." },
  { question: "What if a client refuses to pay?", answer: "Always start with polite reminders. If the issue persists, refer back to your contract or agreement. Giglant's professional templates help maintain a paper trail of your requests." },
];

const examples = [
  { type: "Initial", note: "Clear and direct, stating the amount and the work completed to avoid any confusion." },
  { type: "Reminder", note: "Soft and friendly, assuming the client simply forgot or is busy." },
  { type: "Final", note: "Firm and professional, requesting a specific update on the payment status." },
];

interface Props { project: Project; }

const InvoiceTab = ({ project }: Props) => {
  const [invoiceType, setInvoiceType] = useState<"initial" | "reminder" | "final">("initial");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDeadline, setInvoiceDeadline] = useState("");
  const [invoiceOutput, setInvoiceOutput] = useState("");
  const { toast } = useToast();

  const generate = () => {
    const c = project.client_name || "there", a = invoiceAmount || "[amount]";
    if (invoiceType === "initial") setInvoiceOutput(invoiceGen.initial(c, project.name, a, invoiceDeadline));
    else if (invoiceType === "reminder") setInvoiceOutput(invoiceGen.reminder(c, project.name, a));
    else setInvoiceOutput(invoiceGen.final(c, project.name, a));
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Invoice</h1>
      </div>

      {/* How to Use Section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">How to Get Paid Faster</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "1", title: "Enter Details", desc: "Input the final amount and any payment deadline." },
            { step: "2", title: "Select Stage", desc: "Choose between initial invoice or follow-up reminders." },
            { step: "3", title: "Copy & Request", desc: "Copy the message and send it to your client." },
          ].map(s => (
            <div key={s.step} className="rounded-xl border border-border bg-background p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white text-sm font-bold">{s.step}</div>
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Receipt className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Generate Invoice Message</h2>
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
                  <input type="text" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="e.g., $500 or ₹15,000"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Deadline <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input type="text" value={invoiceDeadline} onChange={e => setInvoiceDeadline(e.target.value)} placeholder="e.g., 48 hours"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                </div>
              </div>

              <Button onClick={generate} className="w-full h-12 text-base">
                <Sparkles className="mr-2 h-4 w-4" /> Generate Payment Request
              </Button>
            </div>

            {invoiceOutput && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Your Payment Request
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
          {/* Payment Tips Section */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Payment Best Practices</h3>
            </div>
            <ul className="space-y-4 text-xs text-muted-foreground">
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Be Clear:</strong> State the exact amount and what it's for to avoid any "sticker shock" or confusion.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Set Deadlines:</strong> Giving a specific timeframe (e.g., 3 days) creates a sense of urgency.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Follow Up:</strong> Don't be afraid to send reminders. Clients are busy and often just forget.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Hold Files:</strong> Mention that final files will be delivered <em>after</em> payment is confirmed.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Real Examples */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Real Examples — Payment Scenarios</h2>
        <p className="text-muted-foreground text-sm mb-6">
          See how professional payment requests help you maintain cash flow without damaging client relationships.
        </p>
        <div className="space-y-3">
          {examples.map((ex, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">{ex.type}</span>
                <p className="text-sm text-foreground">{ex.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">How It Works — Get Paid Faster</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: "Enter Amount", desc: "Input the final project fee and any agreed-upon currency." },
            { step: "Set Deadline", desc: "Optionally add a timeframe to create a professional sense of urgency." },
            { step: "Select Stage", desc: "Choose between an initial request or follow-up reminders." },
            { step: "Copy & Send", desc: "Copy the generated message and send it to your client." },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white font-bold">{i + 1}</div>
              <p className="text-sm font-semibold text-foreground">{s.step}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">About Invoicing — Managing Your Cash Flow</h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            Invoicing is often the most awkward part of freelancing. Giglant's Invoice Generator is designed to remove that friction by providing <strong>polite but firm templates</strong> that handle the "money talk" for you.
          </p>
          <p>
            By using a standardized approach, you signal to your client that you are a professional business owner. This reduces payment delays and ensures you are compensated fairly and on time for your hard work.
          </p>
          <h3 className="font-display text-lg font-semibold text-foreground">Why Professional Invoicing Matters</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><DollarSign className="inline h-3 w-3 mr-1" /> <strong>Cash Flow:</strong> Faster payments mean a healthier business and less stress.</li>
            <li><Calendar className="inline h-3 w-3 mr-1" /> <strong>Deadlines:</strong> Setting clear expectations prevents payments from slipping through the cracks.</li>
            <li><CheckCircle className="inline h-3 w-3 mr-1" /> <strong>Professionalism:</strong> Clear, consistent requests build respect and trust with your clients.</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection title="Invoice FAQ — Get Paid on Time" items={faq} />
    </div>
  );
};

export default InvoiceTab;
