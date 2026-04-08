import { CheckSquare, Square, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectFile, FileComment } from "./types";
import { fmtTs } from "./types";

const db = supabase as any;

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
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Revision Checklist</h2>
        <Button size="sm" variant="outline" onClick={copyAll}>
          <ClipboardCopy className="mr-1 h-3 w-3" /> Copy All
        </Button>
      </div>
      {files.map(f => {
        const fc = comments.filter(c => c.file_id === f.id);
        if (!fc.length) return null;
        return (
          <div key={f.id} className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase">{f.file_type}</span>
              {f.filename}
            </h3>
            <div className="space-y-1.5">
              {fc.map(c => (
                <div key={c.id} className="flex items-start gap-2 cursor-pointer" onClick={() => toggleResolved(c.id)}>
                  {c.is_resolved ? <CheckSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" /> : <Square className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                  <p className={`text-sm ${c.is_resolved ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {c.timestamp_seconds !== null && <span className="font-mono text-primary mr-1">({fmtTs(c.timestamp_seconds)})</span>}
                    {c.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No feedback yet. Share the client link to start collecting feedback.</p>}
    </div>
  );
};

export default RevisionsTab;
