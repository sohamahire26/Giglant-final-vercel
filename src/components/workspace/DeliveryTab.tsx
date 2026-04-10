import { useState } from "react";
import { ClipboardCopy, HelpCircle, Info, MessageSquare, Send, Sparkles, Target, Heart, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import type { Project } from "./types";

declare const puter: any;

const faq = [
  { question: "How does the AI generate messages?", answer: "It uses Puter AI to analyze your project details (client name, project type, stage) and crafts a custom, professional message tailored to your selected tone." },
  { question: "Can I edit the AI's output?", answer: "Absolutely. The generated message appears in an editable text area so you can add your personal touch before sending." },
];

interface Props { project: Project; }

const DeliveryTab = ({ project }: Props) => {
  const [deliveryType, setDeliveryType] = useState<"draft" | "final" | "revision">("final");
  const [deliveryTone, setDeliveryTone] = useState("professional");
  const [deliveryOutput, setDeliveryOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setGenerating(true);
    try {
      const prompt = `Generate a professional ${deliveryTone} delivery message for a ${project.work_type} project named "${project.name}" for client "${project.client_name || 'Client'}". 
      The delivery stage is: ${deliveryType}. 
      Include a mention that they can review the work using the link provided. 
      Keep it concise and effective.`;
      
      const response = await puter.ai.chat(prompt);
      setDeliveryOutput(response.toString().trim());
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
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">AI Delivery Assistant</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">AI Message Generator</h2>
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Message Tone</label>
                <div className="flex flex-wrap gap-2">
                  {["friendly", "professional", "premium", "urgent"].map(t => (
                    <button key={t} onClick={() => setDeliveryTone(t)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${deliveryTone === t ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={generate} className="w-full h-12 text-base" disabled={generating}>
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {generating ? "AI is writing..." : "Generate AI Message"}
              </Button>
            </div>

            {deliveryOutput && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> AI Generated Message
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
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">AI Benefits</h3>
            </div>
            <ul className="space-y-4 text-xs text-muted-foreground">
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Context Aware:</strong> AI understands your project type and stage.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Tone Control:</strong> Switch between friendly or premium tones instantly.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Saves Time:</strong> No more staring at a blank screen.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <FAQSection title="Delivery FAQ" items={faq} />
    </div>
  );
};

export default DeliveryTab;