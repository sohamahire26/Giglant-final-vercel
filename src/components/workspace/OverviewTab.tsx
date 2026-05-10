"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Info,
  ArrowRight,
  Share2,
  AlertTriangle,
  ShieldAlert,
  Edit2,
  Save,
  X,
  Sparkles,
  Infinity,
  MessageCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Project } from "./types";
import { getTimeRemaining, isProjectLocked, getDeletionRemaining } from "./types";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";

interface Props {
  project: Project;
  onUpdate?: (updates: Partial<Project>) => Promise<void>;
}

const OverviewTab = ({ project, onUpdate }: Props) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const planType = profile?.plan_type || 'free';
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(project, planType));
  const [deletionLeft, setDeletionLeft] = useState(getDeletionRemaining(project, planType));
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: project.name,
    client_name: project.client_name || "",
    description: project.description || ""
  });
  const [saving, setSaving] = useState(false);

  const clientLink = `${window.location.origin}/client/${project.share_token}`;
  const isPro = planType === 'pro';
  const isLocked = isProjectLocked(project, planType);

  useEffect(() => {
    const updateTimers = () => {
      setTimeLeft(getTimeRemaining(project, planType));
      setDeletionLeft(getDeletionRemaining(project, planType));
    };

    updateTimers();
    const timer = setInterval(updateTimers, 60000);
    return () => clearInterval(timer);
  }, [project, planType]);

  const copyLink = () => {
    navigator.clipboard.writeText(clientLink);
    toast({ title: "Link copied to clipboard!" });
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    if (!editData.name.trim()) {
      toast({ title: "Project name is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await onUpdate({
        name: editData.name.trim(),
        client_name: editData.client_name.trim() || null,
        description: editData.description.trim() || null
      });
      setIsEditing(false);
    } catch (err) {
      // Error handled in parent
    } finally {
      setSaving(false);
    }
  };

  // Pro countdown logic: show timer only if less than 7 days remain (after 53 days)
  const showProCountdown = isPro && timeLeft.days < 7 && !timeLeft.expired;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Deletion/Locking Policy Card */}
          <div className={`rounded-2xl border p-6 ${isLocked ? "border-red-500/20 bg-red-500/5" : isPro ? "border-primary/20 bg-primary/5" : "border-amber-500/20 bg-amber-500/5"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {isLocked ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : isPro ? (
                  <Sparkles className="h-5 w-5 text-primary" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600" />
                )}
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {isLocked ? "Project Locked" : isPro ? "Pro Access Active" : "Project Status"}
                </h2>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className={isLocked ? "text-red-700 hover:bg-red-500/10" : isPro ? "text-primary hover:bg-primary/10" : "text-amber-700 hover:bg-amber-500/10"}>
                    <ShieldAlert className="mr-1.5 h-4 w-4" /> Full Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Project Lifecycle Policy
                    </DialogTitle>
                    <DialogDescription className="pt-4 space-y-4 text-sm leading-relaxed">
                      <p>
                        To maintain platform performance and privacy, Giglant applies the following rules:
                      </p>
                      <div className="rounded-lg bg-muted p-4 space-y-3">
                        <div>
                          <p className="font-bold text-foreground">Free Plan:</p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                            <li>Locked after 7 days.</li>
                            <li>Permanently deleted after 14 days.</li>
                            <li className="text-amber-600 font-medium">Limit: 1 lifetime project creation.</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-bold text-foreground">Pro Plan:</p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                            <li>Locked after 60 days.</li>
                            <li>Permanently deleted after 90 days.</li>
                            <li className="text-primary font-medium">Extension: Request more time via support during the 30-day locked window.</li>
                          </ul>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic">
                        * Deletion is permanent and cannot be undone. All files and comments will be removed.
                      </p>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex flex-col items-center justify-center py-2">
              <div className="text-center">
                {isLocked ? (
                  <>
                    <div className="text-4xl font-bold text-red-600 font-display">LOCKED</div>
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-red-700">
                      <Trash2 size={16} />
                      DELETION IN {deletionLeft.days} {deletionLeft.days === 1 ? 'DAY' : 'DAYS'}
                    </div>
                    <p className="mt-2 text-xs text-red-700/70 max-w-xs mx-auto">
                      {isPro 
                        ? "Your 60-day window has ended. You have 30 days to request an extension before permanent deletion." 
                        : "Your 7-day window has ended. This project will be permanently deleted in 7 days."}
                    </p>
                    <div className="mt-6 flex flex-col gap-2">
                      {!isPro && (
                        <Button asChild className="bg-red-600 hover:bg-red-700">
                          <Link to="/pricing"><Sparkles className="mr-2 h-4 w-4" /> Unlock with Pro</Link>
                        </Button>
                      )}
                      {isPro && (
                        <Button asChild variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                          <Link to="/support"><MessageCircle className="mr-2 h-4 w-4" /> Request Extension</Link>
                        </Button>
                      )}
                    </div>
                  </>
                ) : isPro ? (
                  <>
                    {showProCountdown ? (
                      <>
                        <div className="text-4xl font-bold text-primary font-display">
                          {timeLeft.days} {timeLeft.days === 1 ? 'Day' : 'Days'} Remaining
                        </div>
                        <p className="mt-2 text-sm text-primary/80">
                          Pro projects have a 60-day window.
                        </p>
                        <div className="mt-4 rounded-lg bg-primary/10 p-3 text-[11px] text-primary font-medium flex items-center gap-2">
                          <MessageCircle className="h-3 w-3" />
                          Need more time? Contact support to request an extension.
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-3 text-4xl font-bold text-primary font-display">
                          {project.expires_at ? <Clock size={40} /> : <Infinity size={40} />} 
                          {project.expires_at ? "EXTENDED" : "ACTIVE"}
                        </div>
                        <p className="mt-2 text-sm text-primary/80">
                          {project.expires_at 
                            ? `Manual extension active until ${new Date(project.expires_at).toLocaleDateString()}.`
                            : "Your Pro project is active. (60-day window)"}
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-amber-600 font-display">
                      {timeLeft.days} {timeLeft.days === 1 ? 'Day' : 'Days'} Remaining
                    </div>
                    <p className="mt-2 text-sm text-amber-700/80">
                      {project.expires_at 
                        ? `Manual extension active until ${new Date(project.expires_at).toLocaleDateString()}.`
                        : "Free projects are locked 7 days after creation."}
                    </p>
                    <div className="mt-4 rounded-lg bg-amber-500/10 p-3 text-[10px] text-amber-700 font-medium">
                      Note: Project is permanently deleted 7 days after locking.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Project Details Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Project Overview</h2>
              </div>
              {!isEditing ? (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} disabled={isLocked}>
                  <Edit2 className="mr-1.5 h-4 w-4" /> Edit Details
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={saving}>
                    <X className="mr-1.5 h-4 w-4" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Clock className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                    Save
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Name</label>
                    <Input 
                      value={editData.name} 
                      onChange={e => setEditData({...editData, name: e.target.value})}
                      placeholder="Project Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Client Name</label>
                    <Input 
                      value={editData.client_name} 
                      onChange={e => setEditData({...editData, client_name: e.target.value})}
                      placeholder="Client Name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                  <Textarea 
                    value={editData.description} 
                    onChange={e => setEditData({...editData, description: e.target.value})}
                    placeholder="Project Description"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Client Review Link Card */}
          <div id="ws-share-card" className={`rounded-2xl border p-6 ${isLocked ? "border-border bg-muted/50 opacity-60" : "border-primary/20 bg-primary/5"}`}>
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Client Review Link</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {isLocked 
                ? "This link is currently disabled because the project is locked." 
                : "Share this link with your client. They can view files, leave timestamped feedback, and track revision progress without needing an account."}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-lg border border-primary/20 bg-background px-4 py-2.5 text-sm font-mono text-muted-foreground">
                {clientLink}
              </div>
              <Button onClick={copyLink} size="icon" variant="outline" className="shrink-0" disabled={isLocked}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button asChild size="icon" variant="outline" className="shrink-0" disabled={isLocked}>
                <a href={isLocked ? "#" : clientLink} target="_blank" rel="noopener">
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
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;