"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, MessageSquare, Plus, HelpCircle, Clock, RefreshCw, Lock, FileText } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TutorialTour, { TourStep } from "@/components/workspace/TutorialTour";
import { fmtTs, parseTs, isProjectLocked } from "@/components/workspace/types";
import type { ProjectFile, FileComment } from "@/components/workspace/types";

interface Project { id: string; name: string; client_name: string | null; share_token: string; user_id: string; created_at: string; expires_at?: string | null; }

const FILE_TYPES = [
  { value: "video", label: "Video", hasTimestamp: true },
  { value: "audio", label: "Audio", hasTimestamp: true },
  { value: "image", label: "Image", hasTimestamp: false },
  { value: "pdf", label: "PDF / Document", hasTimestamp: false },
  { value: "document", label: "Document", hasTimestamp: false },
  { value: "design", label: "Design File", hasTimestamp: false },
  { value: "other", label: "Other", hasTimestamp: false },
];

const clientSteps: TourStep[] = [
  { title: "Welcome! 👋", desc: "You've been invited to review files for this project. No signup needed — just browse and leave your feedback." },
  { targetId: "client-file-list", title: "Select a File", desc: "Click any file from this list to preview it. We support videos, images, and documents." },
  { targetId: "client-preview-area", title: "Review the Work", desc: "Watch the video or view the document here. For videos, pause exactly where you want a change." },
  { targetId: "client-feedback-form", title: "Leave Feedback", desc: "Enter the timestamp (for videos) and your comment here. Your freelancer will see it instantly." },
];

const ClientView = () => {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [comments, setComments] = useState<FileComment[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newTimestamp, setNewTimestamp] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const { toast } = useToast();

  const loadData = async (silent = false) => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    if (!silent) setLoading(true);
    
    try {
      const { data: proj, error: projError } = await supabase
        .from("projects")
        .select("*")
        .eq("share_token", token)
        .maybeSingle();

      if (projError || !proj) { 
        setNotFound(true); 
        setLoading(false); 
        return; 
      }
      
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("plan_type")
        .eq("id", proj.user_id)
        .maybeSingle();

      const locked = isProjectLocked(proj as any, ownerProfile?.plan_type || 'free');
      
      setProject(proj as Project);
      setIsLocked(locked);

      if (!locked) {
        const { data: f } = await supabase
          .from("project_files")
          .select("*")
          .eq("project_id", proj.id)
          .order("sort_order");
        
        setFiles(f || []);
        
        if (f && f.length > 0) {
          const { data: c } = await supabase
            .from("file_comments")
            .select("*")
            .in("file_id", f.map(x => x.id))
            .order("created_at", { ascending: true });
          
          setComments(c || []);
          if (!selectedFile) setSelectedFile(f[0]);
        }
      }
    } catch (err) {
      console.error("[ClientView] Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedFile || !project) return;
    
    setSubmitting(true);
    try {
      const ts = parseTs(newTimestamp);
      
      const { data, error } = await supabase
        .from("file_comments")
        .insert({
          file_id: selectedFile.id,
          timestamp_seconds: ts,
          comment: newComment.trim(),
          author_name: authorName.trim() || "Client",
          is_client: true,
          is_resolved: false
        })
        .select()
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data as FileComment]);
      setNewComment("");
      setNewTimestamp("");
      toast({ title: "Feedback sent!" });
    } catch (err: any) {
      toast({ title: "Failed to send feedback", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from('project-files').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (notFound) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Project Not Found</h1>
        <p className="mt-2 text-muted-foreground">This link may be invalid or the project has been deleted.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Go to Giglant Home</Link>
        </Button>
      </div>
    </div>
  );

  if (isLocked) return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md rounded-3xl border border-amber-500/20 bg-card p-12 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <Lock size={40} />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Review Link Disabled</h1>
        <p className="mt-4 text-muted-foreground">
          This project review link has been disabled because the project has expired or the freelancer's subscription is inactive.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link to="/">Go to Giglant Home</Link>
        </Button>
      </div>
    </div>
  );

  const fileComments = selectedFile ? comments.filter(c => c.file_id === selectedFile.id) : [];
  const isTimeable = selectedFile?.file_type === "video" || selectedFile?.file_type === "audio";
  const selectedFileType = FILE_TYPES.find(t => t.value === selectedFile?.file_type);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`Review: ${project?.name || "Project"}`} description="Review files and leave feedback." />

      {showTutorial && (
        <TutorialTour 
          steps={clientSteps} 
          currentStep={tutorialStep} 
          onNext={() => setTutorialStep(s => s + 1)}
          onBack={() => setTutorialStep(s => s - 1)}
          onDismiss={() => setShowTutorial(false)} 
        />
      )}

      <div className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{project?.name}</h1>
            {project?.client_name && <p className="text-sm text-muted-foreground">For: {project.client_name}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadData(true)} className="text-muted-foreground border-border hover:bg-secondary">
              <RefreshCw className="mr-1 h-3 w-3" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="text-primary border-primary/30 hover:bg-primary/5">
              <HelpCircle className="mr-1 h-3 w-3" /> Guide
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div id="client-file-list" className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-display text-sm font-semibold text-foreground mb-3">Files ({files.length})</h2>
              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No files uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {files.map(f => (
                    <button key={f.id} onClick={() => setSelectedFile(f)}
                      className={`w-full flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${selectedFile?.id === f.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"}`}>
                      <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase">{f.file_type}</span>
                      <span className="flex-1 text-sm text-foreground truncate">{f.filename}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {selectedFile ? (
              <>
                <div id="client-preview-area" className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-semibold text-foreground">{selectedFile.filename}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedFileType?.hasTimestamp ? "bg-amber-500/10 text-amber-600" : "bg-secondary text-muted-foreground"}`}>
                        {selectedFileType?.hasTimestamp ? "🎬 Timestamp Enabled" : "📄 Standard Feedback"}
                      </span>
                    </div>
                  </div>
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-background flex items-center justify-center">
                    {selectedFile.file_type === "video" ? (
                      <video src={getFileUrl(selectedFile.storage_path)} controls className="h-full w-full" />
                    ) : selectedFile.file_type === "audio" ? (
                      <audio src={getFileUrl(selectedFile.storage_path)} controls className="w-full px-4" />
                    ) : selectedFile.file_type === "image" ? (
                      <img src={getFileUrl(selectedFile.storage_path)} alt={selectedFile.filename} className="max-h-full object-contain" />
                    ) : (
                      <div className="text-center p-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Preview not available. Please download to view.</p>
                        <Button variant="outline" size="sm" className="mt-4" asChild>
                          <a href={getFileUrl(selectedFile.storage_path)} target="_blank" rel="noopener">Download File</a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div id="client-feedback-form" className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-display text-sm font-semibold text-foreground mb-3">Leave Your Feedback</h3>
                  <div className="flex gap-2 items-end flex-wrap">
                    {isTimeable && (
                      <div className="w-32">
                        <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          <Clock className="h-2.5 w-2.5" /> Time (HH:MM:SS)
                        </label>
                        <input type="text" value={newTimestamp} onChange={e => setNewTimestamp(e.target.value)} placeholder="00:01:24"
                          className="w-full rounded-lg border border-border bg-background px-2 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                      </div>
                    )}
                    <div className="w-32">
                      <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Your Name</label>
                      <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Client"
                        className="w-full rounded-lg border border-border bg-background px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Comment</label>
                      <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Describe what you'd like changed..."
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        onKeyDown={e => e.key === "Enter" && handleAddComment()} />
                    </div>
                    <Button onClick={handleAddComment} disabled={submitting || !newComment.trim()} className="h-10">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                      Add
                    </Button>
                  </div>
                </div>

                {fileComments.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-3">
                      <MessageSquare className="inline mr-1 h-4 w-4 text-primary" /> Feedback ({fileComments.length})
                    </h3>
                    <div className="space-y-2">
                      {fileComments.map(c => (
                        <div key={c.id} className={`rounded-lg border p-3 transition-all ${c.is_resolved ? "border-border/50 bg-muted/30 opacity-70" : "border-border bg-background"}`}>
                          <div className="flex items-center gap-2">
                            {c.timestamp_seconds !== null && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-primary">
                                {fmtTs(c.timestamp_seconds)}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight">
                              {c.author_name} {c.is_resolved && "• Resolved"}
                            </span>
                          </div>
                          <p className={`mt-1 text-sm leading-relaxed ${c.is_resolved ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {c.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card p-16">
                <p className="text-sm text-muted-foreground">Select a file from the list to start reviewing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientView;