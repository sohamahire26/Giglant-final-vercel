import { CheckSquare, Square, ClipboardCopy, HelpCircle, Info, MessageSquare, ListChecks, Zap, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FAQSection from "@/components/FAQSection";
import type { ProjectFile, FileComment } from "./types";
import { fmtTs } from "./types";

const db = supabase as any;

const faq = [
  { question: "How is the checklist generated?", answer: "The checklist is automatically populated from the comments left by your client in the 'Files & Feedback' tab. Every comment becomes a task you can track." },
  { question: "Can my client see when I resolve an item?", answer: "Yes. When you mark an item as resolved here, it updates in real-time on the client's review page, showing them that you are actively working on their feedback." },
  { question: "What does 'Copy Checklist' do?", answer: "It copies a formatted text version of all pending and resolved tasks to your clipboard. You can paste this into an email or the 'Delivery' tab to show your client exactly what has been addressed." },
  { question: "Can I add my own tasks to the checklist?", answer: "Currently, the checklist is driven by file comments. To add a custom task, simply leave a comment on the relevant file in the 'Files & Feedback' tab." },
];

const examples = [
  { task: "Fix color grade at 01:20", status: "Pending", note: "Directly linked to a specific frame in your video." },
  { task: "Update logo on page 4", status: "Resolved", note: "Marked as done, client sees the progress instantly." },
  { task: "Reduce background noise", status: "Pending", note: "General feedback converted into an actionable task." },
];

interface Props {
  files: ProjectFile[];
  comments: FileComment[];
  setComments: React.Dispatch<React.SetStateAction<FileComment[]>>;
}

const RevisionsTab = ({ files, comments, setComments }: Props) => {
  const { toast } = useToast();

  const toggleResolved = async (cid: string) => {
    const c = comments.find(x => x.id === cid);
    if (!c) return;
    await db.from("file_comments").update({ is_resolved: !c.is_resolved }).eq("id", cid);
    setComments(prev => prev.map(x => x.id === cid ? { ...x, is_resolved: !x.is_resolved } : x));
  };

  const copyAll = () => {
    const text = files.map(f => {
      const fc = comments.filter(c => c.file_id === f.id);
      if (!fc.length) return null;
      return `${f.filename}:\n${fc.map(c => `[${c.is_resolved ? "x" : " "}] ${c.timestamp_seconds !== null ? `(${fmtTs(c.timestamp_seconds)}) ` : ""}${c.comment}`).join("\n")}`;
    }).filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied revision checklist!" });
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Revisions</h1>
      </div>

      {/* Refresh Suggestion */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
        <Info className="h-4 w-4" />
        <span>Can't see feedback? Try refreshing the page.</span>
      </div>

      {/* How to Use Section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">How to Use the Revision Checklist</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "1", title: "Review Feedback", desc: "Go through each comment left by your client." },
            { step: "2", title: "Mark as Done", desc: "Click the checkbox once you've made the change." },
            { step: "3", title: "Copy & Confirm", desc: "Copy the list to send a summary to your client." },
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Revision Checklist</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {comments.filter(c => c.is_resolved).length}/{comments.length} Resolved
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={copyAll} disabled={comments.length === 0}>
                <ClipboardCopy className="mr-1 h-3 w-3" /> Copy Checklist
              </Button>
            </div>

            {files.map(f => {
              const fc = comments.filter(c => c.file_id === f.id);
              if (!fc.length) return null;
              return (
                <div key={f.id} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">{f.file_type}</span>
                    <h3 className="text-sm font-semibold text-foreground">{f.filename}</h3>
                  </div>
                  <div className="space-y-3">
                    {fc.map(c => (
                      <div 
                        key={c.id} 
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${c.is_resolved ? "border-border/50 bg-muted/30" : "border-border bg-background hover:border-primary/30 shadow-sm"}`}
                        onClick={() => toggleResolved(c.id)}
                      >
                        <div className="mt-0.5 shrink-0">
                          {c.is_resolved ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${c.is_resolved ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {c.timestamp_seconds !== null && (
                              <span className="font-mono font-bold text-primary mr-2">[{fmtTs(c.timestamp_seconds)}]</span>
                            )}
                            {c.comment}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                              {c.author_name} {c.is_client ? "• Client" : "• Freelancer"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {comments.length === 0 && (
              <div className="text-center py-16">
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground">No feedback yet. Once your client leaves comments on files, they will appear here as a checklist.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Information Section */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Revision Best Practices</h3>
            </div>
            <ul className="space-y-4 text-xs text-muted-foreground">
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-[10px]">1</div>
                <span><strong>Batch your changes:</strong> Try to address all feedback in one go to minimize back-and-forth.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-[10px]">2</div>
                <span><strong>Clarify if unsure:</strong> If a comment is vague, ask for clarification before starting the work.</span>
              </li>
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-[10px]">3</div>
                <span><strong>Update status:</strong> Mark items as resolved so you can track your progress easily.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Real Examples */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Real Examples — Revision Tracking</h2>
        <p className="text-muted-foreground text-sm mb-6">
          See how messy client feedback is transformed into a clean, actionable checklist.
        </p>
        <div className="space-y-3">
          {examples.map((ex, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${ex.status === 'Resolved' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>{ex.status}</span>
                  <p className="text-sm font-medium text-foreground">{ex.task}</p>
                </div>
                <p className="text-xs text-muted-foreground italic">{ex.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">How It Works — Stay Organized</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: "Feedback Sync", desc: "Client comments are pulled instantly from the review page." },
            { step: "Task Creation", desc: "Each comment is converted into a trackable checklist item." },
            { step: "Progress Tracking", desc: "Mark items as resolved to keep yourself and your client updated." },
            { step: "Final Confirmation", desc: "Copy the completed list to confirm all changes with your client." },
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
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">About Revisions — Accountability & Clarity</h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            The Revisions tab is your central command for project updates. It solves the problem of feedback getting lost in long email threads or chat messages.
          </p>
          <p>
            By providing a <strong>shared source of truth</strong>, you and your client are always on the same page about what has been done and what is still pending. This transparency builds trust and reduces project friction.
          </p>
          <h3 className="font-display text-lg font-semibold text-foreground">Why Use This Checklist?</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><ListChecks className="inline h-3 w-3 mr-1" /> <strong>Actionable Tasks:</strong> No more guessing what the client meant.</li>
            <li><Zap className="inline h-3 w-3 mr-1" /> <strong>Real-time Updates:</strong> Clients see your progress as you work.</li>
            <li><History className="inline h-3 w-3 mr-1" /> <strong>Project History:</strong> Keep a record of all changes made during the project.</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection title="Revisions FAQ — Manage Your Tasks" items={faq} />
    </div>
  );
};

export default RevisionsTab;