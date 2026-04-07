import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project, FileComment, ProjectFile } from "./types";

interface Props {
  project: Project;
  files: ProjectFile[];
  comments: FileComment[];
}

const OverviewTab = ({ project, files, comments }: Props) => {
  const [copied, setCopied] = useState(false);
  const clientLink = `${window.location.origin}/client/${project.share_token}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(clientLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Project Info</h2>
        <div className="grid gap-2 text-sm">
          <div><span className="text-muted-foreground">Project:</span> <strong className="text-foreground">{project.name}</strong></div>
          <div><span className="text-muted-foreground">Client:</span> <strong className="text-foreground">{project.client_name || "Not set"}</strong></div>
          <div><span className="text-muted-foreground">Type:</span> <strong className="text-foreground capitalize">{project.work_type}</strong></div>
          <div><span className="text-muted-foreground">Files:</span> <strong className="text-foreground">{files.length}</strong></div>
          <div><span className="text-muted-foreground">Comments:</span> <strong className="text-foreground">{comments.length}</strong></div>
        </div>
      </div>

      <div id="ws-share-card" className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-2">Client Access Link</h2>
        <p className="text-sm text-muted-foreground mb-4">Share this with your client. They can view files and leave feedback — no signup needed.</p>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3">
          <input type="text" readOnly value={clientLink} className="flex-1 bg-transparent text-sm text-foreground outline-none" />
          <Button onClick={handleCopyLink} size="sm" variant="outline">
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recommended Workflow</h2>
        <div className="space-y-3">
          {[
            "Add your files from Google Drive in the 'Files & Feedback' tab",
            "Share the Client Access Link with your client",
            "Client views files and leaves feedback",
            "Check the 'Revisions' tab for a checklist of all feedback",
            "Generate delivery and invoice messages when done",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{i + 1}</div>
              <p className="text-sm text-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;