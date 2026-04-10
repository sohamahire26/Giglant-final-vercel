"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, MessageSquare, Plus, Info, HelpCircle, Clock } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import TutorialTour, { TourStep } from "@/components/workspace/TutorialTour";
import { fmtTs, parseTs } from "@/components/workspace/types";
import type { ProjectFile, FileComment } from "@/components/workspace/types";

interface Project { id: string; name: string; client_name: string | null; share_token: string; }

const db = supabase as any;

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
  const [newComment, setNewComment] = useState("");
  const [newTimestamp, setNewTimestamp] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("giglant_client_tutorial_dismissed") !== "true") {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    const load = async () => {
      const { data: proj } = await db.from("projects").select("*").eq("share_token", token).single();
      if (!proj) { setNotFound(true); setLoading(false); return; }
      setProject(proj);
      const { data: f } = await db.from("project_files").select("*").eq("project_id", proj.id).order("sort_order");
      setFiles(f || []);
      if (f?.length) {
        const { data: c } = await db.from("file_comments").select("*").in("file_id", f.map((x: ProjectFile) => x.id)).order("created_at");
        setComments(c || []);
        setSelectedFile(f[0]);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  useEffect(() => {
    if (!files.length) return;
    const channel = supabase.channel("client-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "file_comments" }, (payload) => {
        setComments(prev => prev.find(c => c.id === (payload.new as any).id) ? prev : [...prev, payload.new as FileComment]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [files]);

  const handleTimestampChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, "");
    if (digits.length > 6) return;

    // Validate tens place for minutes and seconds (must be <= 5)
    if (digits.length >= 2) {
      const s_tens = parseInt(digits[digits.length - 2], 10);
      if (s_tens > 5) return;
    }
    if (digits.length >= 4) {
      const m_tens = parseInt(digits[digits.length - 4], 10);
      if (m_tens > 5) return;
    }

    let formatted = "";
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, -2)}:${digits.slice(-2)}`;
    } else {
      formatted = `${digits.slice(0, -4)}:${digits.slice(-4, -2)}:${digits.slice(-2)}`;
    }
    
    setNewTimestamp(formatted);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedFile) return;
    const ts = parseTs(newTimestamp);
    
    await db.from("file_comments")
      .insert({ file_id: selectedFile.id, timestamp_seconds: ts, comment: newComment.trim(), author_name: authorName.trim() || "Client", is_client: true });
    setNewComment("");
    setNewTimestamp("");
  };

  const handleStartTutorial = () => {
    setTutorialStep(0);
    setShowTutorial(true);
  };

  const dismissTutorial = () => { 
    setShowTutorial(false); 
    localStorage.setItem("giglant_client_tutorial_dismissed", "true");
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
          onDismiss={dismissTutorial} 
        />
      )}

      <div className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{project?.name}</h1>
            {project?.client_name && <p className="text-sm text-muted-foreground">For: {project.client_name}</p>}
          </div>
          <Button variant="outline" size="sm" onClick={handleStartTutorial} className="text-primary border-primary/30 hover:bg-primary/5">
            <HelpCircle className="mr-1 h-3 w-3" /> Guide
          </Button>
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
                  {files.map(f => {
                    const fileTypeInfo = FILE_TYPES.find(t => t.value === f.file_type);
                    return (
                      <button key={f.id} onClick={() => setSelectedFile(f)}
                        className={`w-full flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${selectedFile?.id === f.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"}`}>
                        <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase">{f.file_type}</span>
                        <span className="flex-1 text-sm text-foreground truncate">{f.filename}</span>
                        {fileTypeInfo?.hasTimestamp && <span className="text-[10px]">🎬</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {selectedFile ? (
              <>
                <div id="client-preview-area" className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-display text-sm font-semibold text-foreground">{selectedFile.filename}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedFileType?.hasTimestamp ? "bg-amber-500/10 text-amber-600" : "bg-secondary text-muted-foreground"}`}>
                      {selectedFileType?.hasTimestamp ? "🎬 Timestamp" : "📄 Standard"}
                    </span>
                  </div>
                  {selectedFile.drive_file_id && (
                    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-background">
                      <iframe src={`https://drive.google.com/file/d/${selectedFile.drive_file_id}/preview`} className="h-full w-full" allow="autoplay" allowFullScreen />
                    </div>
                  )}
                </div>

                <div id="client-feedback-form" className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-display text-sm font-semibold text-foreground mb-3">Leave Your Feedback</h3>
                  <div className="flex gap-2 items-end flex-wrap">
                    {isTimeable && (
                      <div className="w-32">
                        <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" /> Time (HH:MM:SS)
                        </label>
                        <input type="text" value={newTimestamp} onChange={e => handleTimestampChange(e.target.value)} placeholder="00:01:24"
                          className="w-full rounded-lg border border-border bg-background px-2 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                      </div>
                    )}
                    <div className="w-32">
                      <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Your Name</label>
                      <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Client"
                        className="w-full rounded-lg border border-border bg-background px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Comment</label>
                      <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={isTimeable ? "Describe what you'd like changed at this point..." : "Describe what you'd like changed..."}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        onKeyDown={e => e.key === "Enter" && handleAddComment()} />
                    </div>
                    <Button onClick={handleAddComment} className="h-10"><Plus className="h-4 w-4 mr-1" /> Add</Button>
                  </div>
                </div>

                {fileComments.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-3">
                      <MessageSquare className="inline mr-1 h-4 w-4 text-primary" /> Feedback ({fileComments.length})
                    </h3>
                    <div className="space-y-2">
                      {fileComments.map(c => (
                        <div key={c.id} className="rounded-lg border border-border bg-background p-3">
                          <div className="flex items-center gap-2">
                            {c.timestamp_seconds !== null && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-primary">{fmtTs(c.timestamp_seconds)}</span>}
                            <span className="text-[10px] text-muted-foreground font-medium">{c.author_name}</span>
                          </div>
                          <p className="mt-1 text-sm text-foreground">{c.comment}</p>
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