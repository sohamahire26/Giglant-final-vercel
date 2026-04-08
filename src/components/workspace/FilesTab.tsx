import { useState } from "react";
import { Plus, Trash2, ExternalLink, CheckSquare, Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectFile, FileComment } from "./types";
import { extractDriveFileId } from "./types";

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
  const [newDriveUrl, setNewDriveUrl] = useState("");
  const [newFilename, setNewFilename] = useState("");
  const [newFileType, setNewFileType] = useState("video");
  const [newComment, setNewComment] = useState("");
  const [newTimestamp, setNewTimestamp] = useState("");
  const [authorName, setAuthorName] = useState("");
  const { toast } = useToast();

  const handleAddFile = async () => {
    if (!newDriveUrl.trim()) return;
    const fid = extractDriveFileId(newDriveUrl);
    if (!fid) { toast({ title: "Invalid Google Drive URL", variant: "destructive" }); return; }
    const filename = newFilename.trim() || "Untitled File";
    const { data, error } = await db.from("project_files")
      .insert({ project_id: project.id, file_type: newFileType, drive_url: newDriveUrl.trim(), drive_file_id: fid, filename, sort_order: files.length })
      .select().single();
    if (error) { toast({ title: "Failed to add file", variant: "destructive" }); return; }
    setFiles(prev => [...prev, data]);
    setNewDriveUrl(""); setNewFilename("");
    toast({ title: "File added!" });
  };

  const handleDeleteFile = async (fileId: string) => {
    await db.from("project_files").delete().eq("id", fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setComments(prev => prev.filter(c => c.file_id !== fileId));
    if (selectedFile?.id === fileId) setSelectedFile(null);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedFile) return;
    let ts: number | null = null;
    if (newTimestamp.trim() && /^\d{1,2}:\d{2}$/.test(newTimestamp.trim())) {
      const [m, s] = newTimestamp.split(":").map(Number);
      ts = m * 60 + s;
    }
    const { data, error } = await db.from("file_comments")
      .insert({ file_id: selectedFile.id, timestamp_seconds: ts, comment: newComment.trim(), author_name: authorName.trim() || "Freelancer", is_client: false })
      .select().single();
    if (error) { toast({ title: "Failed to add comment", variant: "destructive" }); return; }
    setComments(prev => prev.find(c => c.id === data.id) ? prev : [...prev, data]);
    setNewComment(""); setNewTimestamp("");
  };

  const toggleResolved = async (cid: string) => {
    const c = comments.find(x => x.id === cid);
    if (!c) return;
    await db.from("file_comments").update({ is_resolved: !c.is_resolved }).eq("id", cid);
    setComments(prev => prev.map(x => x.id === cid ? { ...x, is_resolved: !x.is_resolved } : x));
  };

  const fileComments = selectedFile ? comments.filter(c => c.file_id === selectedFile.id) : [];
  const isTimeable = selectedFile?.file_type === "video" || selectedFile?.file_type === "audio";
  const selectedFileType = FILE_TYPES.find(t => t.value === selectedFile?.file_type);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-2">Add File from Google Drive</h2>
        <p className="text-xs text-muted-foreground mb-4">Upload to Google Drive → Right-click → Get link → Set "Anyone with the link" → Paste below</p>
        
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                File Type <span className="text-primary">*</span>
              </label>
              <select
                value={newFileType}
                onChange={(e) => setNewFileType(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {FILE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label} {t.hasTimestamp ? "🎬" : "📄"}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {newFileType === "video" || newFileType === "audio" 
                  ? "✓ Timestamp feedback available" 
                  : "✗ No timestamp (regular feedback only)"}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">File Name</label>
              <input 
                type="text" 
                value={newFilename} 
                onChange={e => setNewFilename(e.target.value)} 
                placeholder="e.g., Brand Video v2, Logo Final" 
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" 
              />
            </div>
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Google Drive Link <span className="text-primary">*</span>
            </label>
            <input 
              type="text" 
              value={newDriveUrl} 
              onChange={e => setNewDriveUrl(e.target.value)} 
              placeholder="https://drive.google.com/file/d/FILE_ID/view" 
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" 
            />
          </div>
          
          <Button onClick={handleAddFile} className="w-full" disabled={!newDriveUrl.trim()}>
            <Plus className="mr-1 h-4 w-4" /> Add File
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Files ({files.length})</h3>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No files yet. Add your first file above.</p>
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
                      <button onClick={e => { e.stopPropagation(); handleDeleteFile(f.id); }} className="shrink-0 p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-semibold text-foreground">{selectedFile.filename}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedFileType?.hasTimestamp ? "bg-amber-500/10 text-amber-600" : "bg-secondary text-muted-foreground"}`}>
                      {selectedFileType?.hasTimestamp ? "🎬 Timestamp" : "📄 Standard"}
                    </span>
                  </div>
                  <a href={selectedFile.drive_url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline flex items-center gap-1">Open in Drive <ExternalLink className="h-3 w-3" /></a>
                </div>
                {selectedFile.drive_file_id && (
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-background">
                    <iframe src={`https://drive.google.com/file/d/${selectedFile.drive_file_id}/preview`} className="h-full w-full" allow="autoplay" allowFullScreen />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3">Add Feedback</h3>
                <div className={`rounded-xl border p-4 mb-3 ${isTimeable ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-muted/30"}`}>
                  {isTimeable ? (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-amber-600">🎬 Video/Audio detected</span> — Pause the video, note the timestamp, and type your feedback below.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Standard feedback mode — Type your comment below.
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-end flex-wrap">
                  {isTimeable && (
                    <div className="w-28">
                      <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" /> Time (MM:SS)
                      </label>
                      <input type="text" value={newTimestamp} onChange={e => setNewTimestamp(e.target.value)} placeholder="01:24"
                        className="w-full rounded-lg border border-border bg-background px-2 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                    </div>
                  )}
                  <div className="w-24">
                    <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Name</label>
                    <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="You"
                      className="w-full rounded-lg border border-border bg-background px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Comment</label>
                    <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="What needs to change?"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      onKeyDown={e => e.key === "Enter" && handleAddComment()} />
                  </div>
                  <Button onClick={handleAddComment} className="h-10"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3">Comments ({fileComments.length})</h3>
                {fileComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
                ) : (
                  <div className="space-y-2">
                    {fileComments.map(c => (
                      <div key={c.id} className={`flex items-start gap-3 rounded-xl border p-3 ${c.is_resolved ? "border-border/50 bg-muted/30" : "border-border bg-background"}`}>
                        <button onClick={() => toggleResolved(c.id)} className="mt-0.5 shrink-0">
                          {c.is_resolved ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {c.timestamp_seconds !== null && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-primary">{fmtTs(c.timestamp_seconds)}</span>}
                            <span className="text-[10px] text-muted-foreground font-medium">{c.author_name} {c.is_client ? "(Client)" : ""}</span>
                          </div>
                          <p className={`mt-1 text-sm ${c.is_resolved ? "line-through text-muted-foreground" : "text-foreground"}`}>{c.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16">
              <p className="text-sm text-muted-foreground">Select a file to preview and add feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilesTab;