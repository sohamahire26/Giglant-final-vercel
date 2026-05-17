"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, CheckSquare, Square, Clock, MessageSquare, Video, FileText, ShieldCheck, AlertCircle, Upload, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Project, ProjectFile, FileComment } from "./types";
import { detectFileType, parseTs, fmtTs } from "./types";

const FILE_TYPES = [
  { value: "video", label: "Video", hasTimestamp: true },
  { value: "audio", label: "Audio", hasTimestamp: true },
  { value: "image", label: "Image", hasTimestamp: false },
  { value: "pdf", label: "PDF / Document", hasTimestamp: false },
  { value: "document", label: "Document", hasTimestamp: false },
  { value: "design", label: "Design File", hasTimestamp: false },
  { value: "other", label: "Other", hasTimestamp: false },
];

const faq = [
  { question: "How do clients leave feedback?", answer: "Clients use the 'Magic Link' you share with them. They can watch videos and leave timestamped comments instantly. No login is required for them." },
  { question: "Is my data secure?", answer: "Yes. Files are uploaded directly to our secure Supabase Storage. Access is restricted to you and anyone with your project's magic link." },
  { question: "What file types support timestamps?", answer: "Video and Audio file types support frame-accurate timestamped feedback. For other types like Images or PDFs, clients can leave standard comments." },
  { question: "Is there a file size limit?", answer: "Standard uploads are supported up to 50MB. For larger files, we recommend the Pro plan or optimized exports." },
];

interface Props {
  project: Project;
  files: ProjectFile[];
  setFiles: React.Dispatch<React.SetStateAction<ProjectFile[]>>;
  comments: FileComment[];
  setComments: React.Dispatch<React.SetStateAction<FileComment[]>>;
  selectedFile: ProjectFile | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<ProjectFile | null>>;
}

const FilesTab = ({ project, files, setFiles, comments, setComments, selectedFile, setSelectedFile }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newTimestamp, setNewTimestamp] = useState("");
  const [authorName, setAuthorName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${project.user_id}/${project.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const fileType = detectFileType(file.name);

      const { data, error: dbError } = await supabase
        .from("project_files")
        .insert({
          project_id: project.id,
          file_type: fileType,
          storage_path: filePath,
          filename: file.name,
          sort_order: files.length
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setFiles(prev => [...prev, data as ProjectFile]);
      toast({ title: "File uploaded successfully!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (file: ProjectFile) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      await supabase.storage.from('project-files').remove([file.storage_path]);
      await supabase.from("project_files").delete().eq("id", file.id);
      
      setFiles(prev => prev.filter(f => f.id !== file.id));
      setComments(prev => prev.filter(c => c.file_id !== file.id));
      if (selectedFile?.id === file.id) setSelectedFile(null);
      
      toast({ title: "File deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const grabCurrentTime = () => {
    if (mediaRef.current) {
      setNewTimestamp(fmtTs(Math.floor(mediaRef.current.currentTime)));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedFile) return;
    const ts = parseTs(newTimestamp);
    
    try {
      const { data, error } = await supabase
        .from("file_comments")
        .insert({
          file_id: selectedFile.id,
          timestamp_seconds: ts,
          comment: newComment.trim(),
          author_name: authorName.trim() || "Freelancer",
          is_client: false
        })
        .select()
        .single();

      if (error) throw error;
      setComments(prev => [...prev, data as FileComment]);
      setNewComment("");
      setNewTimestamp("");
    } catch (err: any) {
      toast({ title: "Failed to add comment", description: err.message, variant: "destructive" });
    }
  };

  const toggleResolved = async (cid: string) => {
    const c = comments.find(x => x.id === cid);
    if (!c) return;
    try {
      await supabase.from("file_comments").update({ is_resolved: !c.is_resolved }).eq("id", cid);
      setComments(prev => prev.map(x => x.id === cid ? { ...x, is_resolved: !x.is_resolved } : x));
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const fileComments = selectedFile ? comments.filter(c => c.file_id === selectedFile.id) : [];
  const isTimeable = selectedFile?.file_type === "video" || selectedFile?.file_type === "audio";
  const selectedFileType = FILE_TYPES.find(t => t.value === selectedFile?.file_type);

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from('project-files').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Files and Feedback</h1>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <AlertTitle className="font-display font-bold text-primary">Direct Secure Uploads</AlertTitle>
        <AlertDescription className="text-primary/80">
          Files are now uploaded directly to Giglant. No more messy Google Drive links or permission issues.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Upload File</h2>
            <div className="space-y-4">
              <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer ${uploading ? "bg-muted opacity-50" : "border-border hover:border-primary hover:bg-primary/5"}`}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                )}
                <p className="text-sm font-medium text-foreground">{uploading ? "Uploading..." : "Click to upload"}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Video, Audio, Image, or PDF</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Project Files ({files.length})</h3>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No files yet.</p>
            ) : (
              <div className="space-y-2">
                {files.map(f => {
                  const fileTypeInfo = FILE_TYPES.find(t => t.value === f.file_type);
                  return (
                    <div key={f.id} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${selectedFile?.id === f.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"}`}
                      onClick={() => setSelectedFile(f)}>
                      <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase">{f.file_type}</span>
                      <span className="flex-1 text-sm text-foreground truncate">{f.filename}</span>
                      {fileTypeInfo?.hasTimestamp && <span className="text-[10px]">🎬</span>}
                      <span className="shrink-0 text-[10px] text-muted-foreground">{comments.filter(c => c.file_id === f.id).length}💬</span>
                      <button onClick={e => { e.stopPropagation(); handleDeleteFile(f); }} className="shrink-0 p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg font-semibold text-foreground">{selectedFile.filename}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedFileType?.hasTimestamp ? "bg-amber-500/10 text-amber-600" : "bg-secondary text-muted-foreground"}`}>
                      {selectedFileType?.hasTimestamp ? "🎬 Timestamp Enabled" : "📄 Standard Feedback"}
                    </span>
                  </div>
                </div>
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-background flex items-center justify-center">
                  {selectedFile.file_type === "video" ? (
                    <video ref={mediaRef as any} src={getFileUrl(selectedFile.storage_path)} controls className="h-full w-full" />
                  ) : selectedFile.file_type === "audio" ? (
                    <audio ref={mediaRef as any} src={getFileUrl(selectedFile.storage_path)} controls className="w-full px-4" />
                  ) : selectedFile.file_type === "image" ? (
                    <img src={getFileUrl(selectedFile.storage_path)} alt={selectedFile.filename} className="max-h-full object-contain" />
                  ) : (
                    <div className="text-center p-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <a href={getFileUrl(selectedFile.storage_path)} target="_blank" rel="noopener">Download to View</a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-sm font-semibold text-foreground mb-4">Add Feedback</h3>
                <div className="flex gap-3 items-end flex-wrap">
                  {isTimeable && (
                    <div className="w-32">
                      <label className="mb-1.5 flex items-center justify-between gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> Time</span>
                        <button onClick={grabCurrentTime} className="text-primary hover:underline flex items-center gap-0.5">
                          <Target className="h-2 w-2" /> Sync
                        </button>
                      </label>
                      <input type="text" value={newTimestamp} onChange={e => setNewTimestamp(e.target.value)} placeholder="00:01:24"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                    </div>
                  )}
                  <div className="w-32">
                    <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Author</label>
                    <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Your Name"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Comment</label>
                    <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Describe the change..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      onKeyDown={e => e.key === "Enter" && handleAddComment()} />
                  </div>
                  <Button onClick={handleAddComment} className="h-[42px] px-6">
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-sm font-semibold text-foreground">Comments ({fileComments.length})</h3>
                </div>
                {fileComments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No comments yet. Share the magic link to collect feedback.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fileComments.map(c => (
                      <div key={c.id} className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${c.is_resolved ? "border-border/50 bg-muted/30 opacity-70" : "border-border bg-background shadow-sm"}`}>
                        <button onClick={() => toggleResolved(c.id)} className="mt-1 shrink-0">
                          {c.is_resolved ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {c.timestamp_seconds !== null && (
                              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
                                {fmtTs(c.timestamp_seconds)}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight">
                              {c.author_name} {c.is_client ? "• Client" : "• Freelancer"}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${c.is_resolved ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {c.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-20 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No File Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Upload a file or select one from the list to manage feedback.</p>
            </div>
          )}
        </div>
      </div>

      <FAQSection title="Files & Feedback FAQ" items={faq} className="px-0 py-12" />
    </div>
  );
};

export default FilesTab;