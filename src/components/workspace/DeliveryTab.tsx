import { useState } from "react";
import { MessageSquare, Copy, Mail, Info, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import type { Project } from "./types";

interface Props {
  project: Project;
}

const DeliveryTab = ({ project }: Props) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    client_name: project.client_name || "",
    project_name: project.name || "",
    delivery_link: "",
    notes: ""
  });

  const [output, setOutput] = useState<{ subject: string; body: string } | null>(null);

  const generateMessage = () => {
    if (!formData.client_name || !formData.project_name) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Client Name and Project Name.",
        variant: "destructive"
      });
      return;
    }

    const subject = `Project Delivery: ${formData.project_name}`;
    const body = `Hi ${formData.client_name},

I'm excited to share that the work for ${formData.project_name} is ready for your review!

${formData.delivery_link ? `You can access the files here: ${formData.delivery_link}\n` : ""}
${formData.notes ? `\nNotes:\n${formData.notes}\n` : ""}
Please let me know if you have any questions or if there's anything else you need.

Best regards,`;

    setOutput({ subject, body });
    toast({
      title: "Message Generated",
      description: "Your delivery message is ready."
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
          Craft professional messages to accompany your project deliveries.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Send className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Delivery Details</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Client Name *</label>
              <Input 
                placeholder="Jane Smith" 
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project Name *</label>
              <Input 
                placeholder="Logo Design / Website Revamp" 
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Delivery Link (Optional)</label>
              <Input 
                placeholder="https://dropbox.com/s/..." 
                value={formData.delivery_link}
                onChange={(e) => setFormData({ ...formData, delivery_link: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Additional Notes</label>
              <Textarea 
                placeholder="Mention specific files, next steps, or revision process..." 
                className="min-h-[120px]"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={generateMessage} className="w-full" size="lg">
            Generate Delivery Message
          </Button>
        </div>

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
            answer: "Yes, you can use the 'Additional Notes' field to add specific details, or edit the message directly after copying it to your email client." 
          }
        ]} 
      />
    </div>
  );
};

export default DeliveryTab;