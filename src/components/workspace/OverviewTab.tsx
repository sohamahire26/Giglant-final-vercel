import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Info,
  ArrowRight,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "./types";

interface Props {
  project: Project;
}

const OverviewTab = ({ project }: Props) => {
  const { toast } = useToast();
  const clientLink = `${window.location.origin}/review/${project.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(clientLink);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Project Overview</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
                Active
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Project Name</p>
                <p className="text-sm font-semibold text-foreground">{project.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Work Type</p>
                <p className="text-sm font-semibold text-foreground capitalize">{project.work_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Client Name</p>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">{project.client_name || "Not specified"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Created On</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {project.description && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
            )}
          </div>

          {/* Client Review Link Card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Client Review Link</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Share this link with your client. They can view files, leave timestamped feedback, and track revision progress without needing an account.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-lg border border-primary/20 bg-background px-4 py-2.5 text-sm font-mono text-muted-foreground">
                {clientLink}
              </div>
              <Button onClick={copyLink} size="icon" variant="outline" className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
              <Button asChild size="icon" variant="outline" className="shrink-0">
                <a href={clientLink} target="_blank" rel="noopener">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Project Stats/Info */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Workspace Info</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-green-500/10 p-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Real-time Sync</p>
                  <p className="text-[11px] text-muted-foreground">All changes and comments are synced instantly across devices.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-amber-500/10 p-1">
                  <Clock className="h-3 w-3 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Auto-Save</p>
                  <p className="text-[11px] text-muted-foreground">Your progress is automatically saved as you work.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Pro Tip</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Use the <strong>Delivery Tab</strong> to generate professional messages when sending work to your client. It helps maintain a premium brand image.
            </p>
            <Button variant="link" className="h-auto p-0 text-xs text-primary font-semibold" asChild>
              <span className="flex items-center gap-1 cursor-pointer">
                Go to Delivery <ArrowRight className="h-3 w-3" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;