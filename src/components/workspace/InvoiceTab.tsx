import { useState } from "react";
import { ClipboardCopy, HelpCircle, Info, MessageSquare, Receipt, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "./types";

const invoiceGen = {
  initial: (c: string, p: string, a: string, d: string) =>
    `Hi ${c},\n\nThe ${p} has been completed and delivered.\n\nAs agreed, the total amount for this project is ${a}.\n\nPlease review and complete the payment${d ? ` within ${d}` : " at your earliest convenience"}.\n\nLet me know once done so I can proceed with final delivery files.\n\nThanks for the collaboration!`,
  reminder: (c: string, p: string, a: string) =>
    `Hi ${c},\n\nJust a friendly reminder that the payment for ${p} (${a}) is still pending.\n\nWould you be able to process it at your earliest convenience?\n\nIf it's already been sent, please disregard this message.\n\nThank you!`,
  final: (c: string, p: string, a: string) =>
    `Hi ${c},\n\nI wanted to follow up regarding the outstanding payment for ${p} (${a}).\n\nCould you please confirm when the payment will be processed? I'd really appreciate an update.\n\nThank you for your attention to this.`,
};

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

          {/* Warning Section */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <h3 className="font-display text-sm font-semibold text-amber-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Important Note
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              While being firm is good, always maintain a polite tone. You want to get paid, but you also want to keep the door open for future work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTab;
