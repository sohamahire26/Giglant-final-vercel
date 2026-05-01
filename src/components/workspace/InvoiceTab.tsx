import { useState, useEffect } from "react";
import { MessageSquare, Copy, Mail, History, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";

type MessageType = "INITIAL" | "REMINDER" | "FINAL";

interface PaymentMessage {
  id: string;
  subject: string;
  body: string;
  timestamp: number;
  clientName: string;
  amount: string;
}

const TEMPLATES = {
  INITIAL: {
    subject: "Invoice for {company} – Payment Request",
    body: `Hi {client_name},

I hope you're doing well.

I'm sharing the invoice for {company}. The total amount due is \${amount}, with a deadline of {deadline}.

Please let me know once the payment is processed.

{custom_instructions}

Best regards,  
{your_name}`
  },
  REMINDER: {
    subject: "Reminder: Pending Payment of \${amount}",
    body: `Hi {client_name},

Just a quick reminder that the payment of \${amount} is still pending. The due date was {deadline}.

Kindly process it at your earliest convenience.

{custom_instructions}

Best regards,  
{your_name}`
  },
  FINAL: {
    subject: "Final Reminder: Immediate Payment Required",
    body: `Hi {client_name},

This is a final follow-up regarding the pending payment of \${amount}, which was due on {deadline}.

Please process this as soon as possible to avoid any disruption.

{custom_instructions}

Best regards,  
{your_name}`
  }
};

const InvoiceTab = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    your_name: "",
    client_name: "",
    company: "",
    amount: "",
    deadline: "",
    message_type: "INITIAL" as MessageType,
    custom_instructions: ""
  });

  const [output, setOutput] = useState<{ subject: string; body: string } | null>(null);
  const [history, setHistory] = useState<PaymentMessage[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("payment_message_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (subject: string, body: string) => {
    const newMessage: PaymentMessage = {
      id: crypto.randomUUID(),
      subject,
      body,
      timestamp: Date.now(),
      clientName: formData.client_name,
      amount: formData.amount
    };
    const updatedHistory = [newMessage, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem("payment_message_history", JSON.stringify(updatedHistory));
  };

  const generateMessage = () => {
    if (!formData.client_name || !formData.amount || !formData.deadline) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Client Name, Amount, and Deadline.",
        variant: "destructive"
      });
      return;
    }

    const template = TEMPLATES[formData.message_type];
    
    let subject = template.subject
      .replace("{company}", formData.company || "the project")
      .replace("{amount}", formData.amount);

    let body = template.body
      .replace("{client_name}", formData.client_name)
      .replace("{company}", formData.company || "the project")
      .replace("{amount}", formData.amount)
      .replace("{deadline}", formData.deadline)
      .replace("{your_name}", formData.your_name || "Me");

    if (formData.custom_instructions) {
      body = body.replace("{custom_instructions}", `\n${formData.custom_instructions}\n`);
    } else {
      body = body.replace("{custom_instructions}", "");
    }

    // Clean up double newlines if custom instructions were empty
    body = body.replace(/\n\n\n/g, "\n\n");

    setOutput({ subject, body });
    saveToHistory(subject, body);
    
    toast({
      title: "Message Generated",
      description: "Your payment message is ready."
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

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("payment_message_history", JSON.stringify(updatedHistory));
  };

  return (
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Payment Message Generator</h1>
        <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
          Generate professional payment requests and reminders using deterministic templates.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Message Details</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <Input 
                placeholder="John Doe" 
                value={formData.your_name}
                onChange={(e) => setFormData({ ...formData, your_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Client Name *</label>
              <Input 
                placeholder="Jane Smith" 
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company / Project</label>
              <Input 
                placeholder="Acme Corp" 
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount ($) *</label>
              <Input 
                placeholder="500.00" 
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Deadline *</label>
              <Input 
                placeholder="Oct 25, 2023" 
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message Type</label>
              <Select 
                value={formData.message_type} 
                onValueChange={(v: MessageType) => setFormData({ ...formData, message_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INITIAL">Initial Request</SelectItem>
                  <SelectItem value="REMINDER">Reminder</SelectItem>
                  <SelectItem value="FINAL">Final Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Custom Instructions (Optional)</label>
            <Textarea 
              placeholder="Add any specific details or payment methods..." 
              className="min-h-[100px]"
              value={formData.custom_instructions}
              onChange={(e) => setFormData({ ...formData, custom_instructions: e.target.value })}
            />
          </div>

          <Button onClick={generateMessage} className="w-full" size="lg">
            Generate Message
          </Button>
        </div>

        {/* Output Area */}
        <div className="space-y-6">
          {output ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Generated Message</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(output.subject, "Subject")}>
                    <Copy className="mr-2 h-4 w-4" /> Subject
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(output.body, "Message")}>
                    <Copy className="mr-2 h-4 w-4" /> Message
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-sm font-medium text-foreground">{output.subject}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Body</p>
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                    {output.body}
                  </div>
                </div>
                <Button onClick={openInGmail} className="w-full bg-[#EA4335] hover:bg-[#d33426] text-white">
                  <Mail className="mr-2 h-4 w-4" /> Open in Gmail
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No message generated yet</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Fill in the details on the left and click "Generate Message" to create your payment request.
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Recent History</h2>
              </div>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="group flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.clientName} - ${item.amount}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setOutput({ subject: item.subject, body: item.body });
                        toast({ title: "Restored from history" });
                      }}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteHistoryItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <FAQSection 
          title="Payment Message FAQ" 
          items={[
            { 
              question: "Is this using AI?", 
              answer: "No. This tool uses deterministic templates to ensure consistency and reliability in your professional communications." 
            },
            { 
              question: "Why use templates instead of writing manually?", 
              answer: "Templates save time and ensure you don't forget critical details like the amount, deadline, or project name. They also help maintain a professional tone." 
            },
            { 
              question: "Where is my history saved?", 
              answer: "Your history is saved locally in your browser's storage. It never leaves your device and is cleared if you clear your browser data." 
            }
          ]} 
        />
      </div>
    </div>
  );
};

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);

export default InvoiceTab;