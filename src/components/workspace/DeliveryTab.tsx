import { useState } from "react";
import { ClipboardCopy, HelpCircle, Info, MessageSquare, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
      {/* How to Use Section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">How to Use the Delivery Generator</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "1", title: "Define Stage", desc: "Select if you're sending a draft, revision, or final file." },
            { step: "2", title: "Set the Mood", desc: "Choose a tone that fits your professional relationship." },
            { step: "3", title: "Deliver Work", desc: "Generate the message and send it with the review link." },
          ].map(s => (
            <div key={s.step} className="rounded-xl border border-border bg-background p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">{s.step}</div>
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

          {/* Pro Tip */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="font-display text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Pro Tip
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Always include the <strong>Client Review Link</strong> in your message. It makes it incredibly easy for them to give feedback without having to search for the link you sent earlier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTab;
