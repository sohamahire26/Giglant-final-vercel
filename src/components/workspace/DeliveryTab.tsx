import { useState } from "react";
import { ClipboardCopy } from "lucide-react";
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Generate Delivery Message</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Delivery Type</label>
            <div className="flex flex-wrap gap-2">
              {(["draft", "final", "revision"] as const).map(key => (
                <button key={key} onClick={() => setDeliveryType(key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${deliveryType === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                  {key}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {deliveryType === "draft" && "Work in progress — asking for initial feedback before finalizing."}
              {deliveryType === "final" && "Complete work — requesting final approval and confirmation."}
              {deliveryType === "revision" && "Updated work based on client's previous feedback."}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Tone</label>
            <div className="flex flex-wrap gap-2">
              {["friendly", "professional", "premium"].map(t => (
                <button key={t} onClick={() => setDeliveryTone(t)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${deliveryTone === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={generate} className="w-full">Generate Message</Button>
        </div>
        {deliveryOutput && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Your Message</label>
              <button onClick={() => { navigator.clipboard.writeText(deliveryOutput); toast({ title: "Copied!" }); }} className="flex items-center gap-1 text-xs text-primary hover:underline"><ClipboardCopy className="h-3 w-3" /> Copy</button>
            </div>
            <textarea value={deliveryOutput} onChange={e => setDeliveryOutput(e.target.value)} className="h-48 w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground focus:border-primary focus:outline-none resize-none" />
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-sm font-semibold text-foreground mb-2">💀 Why This Works</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>Uses client name</strong> → attention trigger</li>
          <li>• <strong>Mentions project</strong> → context clarity</li>
          <li>• <strong>Gives next step</strong> → reduces confusion</li>
          <li>• <strong>Shows effort</strong> → increases perceived value</li>
          <li>• <strong>Soft CTA</strong> → no pressure, invites response</li>
        </ul>
      </div>
    </div>
  );
};

export default DeliveryTab;
