import { useState } from "react";
import { Plus, Trash2, ExternalLink, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectFile, FileComment } from "./types";
import { extractDriveFileId, detectFileType, fmtTs } from "./types";

const db = supabase as any;

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
  const [newComment, setNewComment] = useState("");
  const [newTimestamp, setNewTimestamp] = useState("");
  const [authorName, setAuthorName] = useState("");
  const { toast } = useToast();

  const handleAddFile = async () => {
    if (!newDriveUrl.trim()) return;
    const fid = extractDriveFileId(newDriveUrl);
    if (!fid) { toast({ title: "Invalid Google Drive URL", variant: "destructive" }); return; }
    const filename = newFilename.trim() || "Untitled File";
    const fileType = detectFileType(newDriveUrl, filename);
    const { data, error } = await db.from("project_files")
      .insert({ project_id: project.id, file_type: fileType, drive_url: newDriveUrl.trim(), drive_file_id: fid, filename, sort_order: files.length })
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

  return (
    <div className="space-y-6">
      {/* Add file */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-2">Add File from Google Drive</h2>
        <p className="text-xs text-muted-foreground mb-4">Upload to Google Drive → Right-click → Get link → Set "Anyone with the link" → Paste below</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" value={newFilename} onChange={e => setNewFilename(e.target.value)} placeholder="File name (e.g., Brand Video v2)"
            className="sm:w-48 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <input type="text" value={newDriveUrl} onChange={e => setNewDriveUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <Button onClick={handleAddFile}><Plus className="mr-1 h-4 w-4" /> Add</Button>
        </div>
      </div>

      {/* File list + Preview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Files ({files.length})</h3>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No files yet. Add your first file above.</p>
            ) : (
              <div className="space-y-2">
                {files.map(f => (
                  <div key={f.id} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${selectedFile?.id === f.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"}`}
                    onClick={() => setSelectedFile(f)}>
                    <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase">{f.file_type}</span>
                    <span className="flex-1 text-sm text-foreground truncate">{f.filename}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{comments.filter(c => c.file_id === f.id).length}💬</span>
                    <button onClick={e => { e.stopPropagation(); handleDeleteFile(f.id); }} className="shrink-0 p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="space-y-4">
              {/* Preview */}
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-semibold text-foreground">{selectedFile.filename}</h3>
                  <a href={selectedFile.drive_url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline flex items-center gap-1">Open in Drive <ExternalLink className="h-3 w-3" /></a>
                </div>
                {selectedFile.drive_file_id && (
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-background">
                    <iframe src={`https://drive.google.com/file/d/${selectedFile.drive_file_id}/preview`} className="h-full w-full" allow="autoplay" allowFullScreen />
                  </div>
                )}
              </div>

              {/* Add feedback */}
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3">Add Feedback</h3>
                {selectedFile.file_type === "video" && (
                  <p className="text-xs text-muted-foreground mb-2">Pause the video, note the timestamp, and type your feedback below.</p>
                )}
                {selectedFile.file_type !== "video" && (
                  <p className="text-xs text-muted-foreground mb-2">Review the file and type your feedback below.</p>
                )}
                <div className="flex gap-2 items-end flex-wrap">
                  {selectedFile.file_type === "video" && (
                    <div className="w-24">
                      <label className="mb-1 block text-[10px] text-muted-foreground">Time</label>
                      <input type="text" value={newTimestamp} onChange={e => setNewTimestamp(e.target.value)} placeholder="MM:SS"
                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                    </div>
                  )}
                  <div className="w-24">
                    <label className="mb-1 block text-[10px] text-muted-foreground">Name</label>
                    <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="You"
                      className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="mb-1 block text-[10px] text-muted-foreground">Comment</label>
                    <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="What needs to change?"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      onKeyDown={e => e.key === "Enter" && handleAddComment()} />
                  </div>
                  <Button onClick={handleAddComment} size="sm"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Comments list */}
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
                            <span className="text-[10px] text-muted-foreground">{c.author_name} {c.is_client ? "(Client)" : ""}</span>
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
