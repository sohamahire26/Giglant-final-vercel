import { useState } from "react";
import { ClipboardCopy } from "lucide-react";
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Generate Invoice Message</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Message Type</label>
            <div className="flex flex-wrap gap-2">
              {(["initial", "reminder", "final"] as const).map(t => (
                <button key={t} onClick={() => setInvoiceType(t)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${invoiceType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                  {t === "initial" ? "Invoice" : t === "reminder" ? "Reminder" : "Final Follow-up"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Amount</label>
              <input type="text" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="₹5,000 or $500"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Payment Deadline <span className="text-muted-foreground">(optional)</span></label>
              <input type="text" value={invoiceDeadline} onChange={e => setInvoiceDeadline(e.target.value)} placeholder="e.g., 3 days"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              <p className="mt-1 text-[10px] text-muted-foreground">⚠️ Setting a strict deadline can sometimes feel pushy. Use with care.</p>
            </div>
          </div>
          <Button onClick={generate} className="w-full">Generate Message</Button>
        </div>
        {invoiceOutput && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Your Message</label>
              <button onClick={() => { navigator.clipboard.writeText(invoiceOutput); toast({ title: "Copied!" }); }} className="flex items-center gap-1 text-xs text-primary hover:underline"><ClipboardCopy className="h-3 w-3" /> Copy</button>
            </div>
            <textarea value={invoiceOutput} onChange={e => setInvoiceOutput(e.target.value)} className="h-48 w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground focus:border-primary focus:outline-none resize-none" />
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-sm font-semibold text-foreground mb-2">💀 Why This Works</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>Confirms completion</strong> → reduces doubt</li>
          <li>• <strong>Restates agreement</strong> → avoids conflict</li>
          <li>• <strong>Clear deadline</strong> → faster payment</li>
          <li>• <strong>Polite tone</strong> → no friction</li>
          <li>• Clear invoices reduce disputes and speed up payment</li>
        </ul>
      </div>
    </div>
  );
};

export default InvoiceTab;
