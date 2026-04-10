import { useState } from "react";
import { ClipboardCopy, HelpCircle, Info, MessageSquare, Send, Sparkles, Target, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import type { Project } from "./types";

const deliveryGen = {
  draft: (c: string, p: string, w: string, t: string) => {
    const o: Record<string, string> = { friendly: `Hey ${c}! 👋`, professional: `Hi ${c},`, premium: `Dear ${c},` };
    return `${o[t] || o.professional}\n\nHere's the current draft of your ${w} for ${p}.\n\nPlease review and share your thoughts. I'm happy to make adjustments based on your feedback.\n\nYou can review the work and leave your comments directly using the review link I've shared.\n\nLooking forward to your input!\n\nBest regards`;
  },
  final: (c: string, p: string, w: string, t: string) => {
    const o: Record<string, string> = { friendly: `Hey ${c}! 🎉`, professional: `Hi ${c},`, premium: `Dear ${c},` };
    return `${o[t] || o.professional}\n\nI've completed the final version of your ${w} for ${p}.\n\nPlease review everything and let me know if it looks good. If there are no changes needed, please confirm so I can close this out.\n\nI've focused on delivering exactly what we discussed, and I'm confident you'll be happy with the result.\n\nThank you for the opportunity to work together!\n\nBest regards`;
  },
  revision: (c: string, p: string, w: string, t: string) => {
    const o: Record<string, string> = { friendly: `Hey ${c}!`, professional: `Hi ${c},`, premium: `Dear ${c},` };
    return `${o[t] || o.professional}\n\nI've made the requested changes to your ${w} for ${p}.\n\nPlease review the revisions using the feedback link. If anything else needs adjusting, just drop your comments there.\n\nI've addressed all the points from your last round of feedback.\n\nLooking forward to your thoughts!\n\nBest regards`;
  },
};

const faq = [
  { question: "What is the difference between the tones?", answer: "Friendly is great for long-term clients or casual projects. Professional is the standard for business communication. Premium is designed for high-ticket clients where a more formal and polished approach is expected." },
  { question: "Can I customize the generated message?", answer: "Yes! Once the message is generated, it appears in a text area where you can edit it freely before copying it to your clipboard." },
  { question: "Why should I use these templates?", answer: "These templates are based on professional communication standards that build trust and reduce friction. They ensure you include all necessary information (like the review link) every time." },
  { question: "Where should I send these messages?", answer: "You can paste these messages into WhatsApp, Slack, Email, or any other platform you use to communicate with your client." },
];

const examples = [
  { type: "Draft", note: "Focuses on collaboration and gathering early feedback to avoid major re-edits later." },
  { type: "Final", note: "Confident and clear, guiding the client towards final approval and project closure." },
  { type: "Revision", note: "Shows you've listened to their feedback and addressed every point specifically." },
];

interface Props { project: Project; }

const DeliveryTab = ({ project }: Props) => {
  const [deliveryType, setDeliveryType] = useState<"draft" | "final" | "revision">("final");
  const [deliveryTone, setDeliveryTone] = useState("professional");
  const [deliveryOutput, setDeliveryOutput] = useState("");
  const { toast } = useToast();

  const generate = () => {
    setDeliveryOutput(deliveryGen[deliveryType](project.client_name || "there", project.name, project.work_type, deliveryTone));
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Delivery</h1>
      </div>

      {/* How to Use Section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">How to Use the Delivery Generator</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "1", title: "Select Type", desc: "Choose if this is a draft, final version, or revision." },
            { step: "2", title: "Choose Tone", desc: "Pick a tone that matches your client relationship." },
            { step: "3", title: "Copy & Send", desc: "Generate, copy, and send via your preferred app." },
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
              <Send className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Generate Delivery Message</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Delivery Type</label>
                <div className="flex flex-wrap gap-2">
                  {(["draft", "final", "revision"] as const).map(key => (
                    <button key={key} onClick={() => setDeliveryType(key)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${deliveryType === key ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                      {key}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground italic">
                  {deliveryType === "draft" && "Best for: Getting early feedback on work-in-progress."}
                  {deliveryType === "final" && "Best for: Handing over the completed project for approval."}
                  {deliveryType === "revision" && "Best for: Showing you've addressed previous feedback."}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Message Tone</label>
                <div className="flex flex-wrap gap-2">
                  {["friendly", "professional", "premium"].map(t => (
                    <button key={t} onClick={() => setDeliveryTone(t)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${deliveryTone === t ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={generate} className="w-full h-12 text-base">
                <Sparkles className="mr-2 h-4 w-4" /> Generate Message
              </Button>
            </div>

            {deliveryOutput && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Your Generated Message
                  </label>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(deliveryOutput); toast({ title: "Copied to clipboard!" }); }} 
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <ClipboardCopy className="h-3.5 w-3.5" /> Copy Message
                  </button>
                </div>
                <textarea 
                  value={deliveryOutput} 
                  onChange={e => setDeliveryOutput(e.target.value)} 
                  className="h-64 w-full rounded-xl border border-border bg-background p-5 text-sm leading-relaxed text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none shadow-inner" 
                />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Why This Works Section */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Why These Messages Work</h3>
            </div>
            <ul className="space-y-4 text-xs text-muted-foreground">
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Personalization:</strong> Using the client's name immediately builds rapport and shows attention to detail.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Context:</strong> Explicitly mentioning the project name and work type prevents any confusion.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Clear Next Steps:</strong> Telling the client exactly what to do (review, approve, pay) reduces friction.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Professionalism:</strong> A structured message shows you take your business seriously, justifying your rates.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Real Examples */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Real Examples — Delivery Scenarios</h2>
        <p className="text-muted-foreground text-sm mb-6">
          See how different delivery types help you manage client expectations at every stage.
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
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">How It Works — Professional Communication</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: "Select Stage", desc: "Choose whether you're sending a draft, final work, or revisions." },
            { step: "Set Tone", desc: "Match your client's personality with Friendly, Professional, or Premium tones." },
            { step: "Auto-Generate", desc: "Our system builds a psychology-backed message for you instantly." },
            { step: "Copy & Send", desc: "Copy the message and send it via your preferred communication app." },
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
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">About Delivery — Branding Your Business</h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            The way you deliver your work is just as important as the work itself. A professional delivery message sets the tone for the entire project and justifies your premium rates.
          </p>
          <p>
            Giglant's Delivery Generator uses <strong>proven communication frameworks</strong> to ensure your messages are clear, concise, and action-oriented. This reduces the time spent on back-and-forth emails and gets you to project approval faster.
          </p>
          <h3 className="font-display text-lg font-semibold text-foreground">Why Professional Delivery Matters</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><Target className="inline h-3 w-3 mr-1" /> <strong>Clarity:</strong> Clients know exactly what they are looking at and what to do next.</li>
            <li><Heart className="inline h-3 w-3 mr-1" /> <strong>Relationship:</strong> Consistent, professional communication builds long-term client loyalty.</li>
            <li><ShieldCheck className="inline h-3 w-3 mr-1" /> <strong>Confidence:</strong> Presenting your work with confidence reduces the likelihood of unnecessary revisions.</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection title="Delivery FAQ — Communicate Like a Pro" items={faq} />
    </div>
  );
};

export default DeliveryTab;
