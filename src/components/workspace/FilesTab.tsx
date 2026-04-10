import { useState } from "react";
import { Plus, Trash2, ExternalLink, CheckSquare, Square, Clock, FileEdit, Info, HelpCircle, Share2, Video, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FAQSection from "@/components/FAQSection";
import type { Project, ProjectFile, FileComment } from "./types";
import { extractDriveFileId, parseTs, fmtTs } from "./types";

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

const faq = [
  { question: "How do clients leave feedback?", answer: "Clients use the 'Magic Link' you share with them. They can click anywhere on a video or audio timeline to leave a timestamped comment, or leave general comments on documents and images. No login is required for them." },
  { question: "Is my data secure?", answer: "Yes. We don't store your actual files. We only store the Google Drive link and the comments. The files are streamed directly from Google Drive to the browser, ensuring your content stays within your controlled environment." },
  { question: "What file types support timestamps?", answer: "Currently, Video and Audio file types support frame-accurate timestamped feedback. For other types like Images or PDFs, clients can leave standard comments." },
  { question: "Can I use links other than Google Drive?", answer: "The workspace is optimized for Google Drive to provide the best preview experience. Ensure your Drive file is set to 'Anyone with the link' -> 'Viewer' for the preview to work correctly." },
];

const examples = [
  { type: "Video", note: "Client clicks at 00:45 -> 'Make this transition smoother' -> Timestamp saved automatically." },
  { type: "PDF", note: "Client leaves comment -> 'Change the font size on page 2' -> Appears in your revision checklist." },
  { type: "Audio", note: "Client marks 02:10 -> 'The background music is too loud here' -> You see exactly where to edit." },
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

  const handleTimestampChange = (val: string) => {
    let clean = val.replace(/[^0-9]/g, "");
    if (clean.length > 4) clean = clean.slice(0, 4);
    
    if (clean.length === 4) {
      setNewTimestamp(clean.slice(0, 2) + ":" + clean.slice(2));
    } else {
      setNewTimestamp(val);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedFile) return;
    const ts = parseTs(newTimestamp);
    
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
    <div className="space-y-8">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Files and Feedback</h1>
      </div>

      {/* How to Use Section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">i</div>
          <h2 className="font-display text-lg font-semibold text-foreground">For Freelancers — How to Use</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: "1", title: "Upload to Drive", desc: "Upload your video to Google Drive" },
            { step: "2", title: "Get Link", desc: "Right-click the video -> 'Get link'" },
            { step: "3", title: "Paste Here", desc: "Copy the link and paste it below" },
            { step: "4", title: "Copy Magic Link", desc: "Share it to your Client" },
          ].map(s => (
            <div key={s.step} className="rounded-xl border border-border bg-background p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white text-sm font-bold">{s.step}</div>
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* File Renamer Tip */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <FileEdit className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-amber-600">Pro tip:</span> Want cleaner file names before uploading?
              Use the <span className="font-semibold text-amber-600">File Renamer</span> tab in this workspace to automatically rename messy files with meaningful names.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          {/* Add File Form */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Add New File</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">File Type</label>
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
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">File Name</label>
                <input 
                  type="text" 
                  value={newFilename} 
                  onChange={e => setNewFilename(e.target.value)} 
                  placeholder="e.g., Brand Video v2" 
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" 
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Google Drive Link</label>
                <input 
                  type="text" 
                  value={newDriveUrl} 
                  onChange={e => setNewDriveUrl(e.target.value)} 
                  placeholder="Paste link here..." 
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" 
                />
              </div>
              <Button onClick={handleAddFile} className="w-full" disabled={!newDriveUrl.trim()}>
                <Plus className="mr-1 h-4 w-4" /> Add File
              </Button>
            </div>
          </div>

          {/* File List */}
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
            <div className="space-y-6">
              {/* Preview Card */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg font-semibold text-foreground">{selectedFile.filename}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedFileType?.hasTimestamp ? "bg-amber-500/10 text-amber-600" : "bg-secondary text-muted-foreground"}`}>
                      {selectedFileType?.hasTimestamp ? "🎬 Timestamp Enabled" : "📄 Standard Feedback"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedFile.drive_url} target="_blank" rel="noopener">
                        <ExternalLink className="mr-1 h-3 w-3" /> Open in Drive
                      </a>
                    </Button>
                  </div>
                </div>
                {selectedFile.drive_file_id && (
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-background">
                    <iframe src={`https://drive.google.com/file/d/${selectedFile.drive_file_id}/preview`} className="h-full w-full" allow="autoplay" allowFullScreen />
                  </div>
                )}
              </div>

              {/* Feedback Input */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-sm font-semibold text-foreground mb-4">Add Feedback</h3>
                <div className="flex gap-3 items-end flex-wrap">
                  {isTimeable && (
                    <div className="w-28">
                      <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <Clock className="h-2.5 w-2.5" /> Time (MM:SS)
                      </label>
                      <input type="text" value={newTimestamp} onChange={e => handleTimestampChange(e.target.value)} placeholder="01:24"
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

              {/* Comments List */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-sm font-semibold text-foreground">Comments ({fileComments.length})</h3>
                  {fileComments.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <CheckSquare className="h-3 w-3 text-primary" /> Resolved
                      <Square className="h-3 w-3" /> Pending
                    </div>
                  )}
                </div>
                {fileComments.length === 0 ? (
                  <div className="text-center py-12">
                    <Share2 className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No comments yet. Share the client link to start collecting feedback.</p>
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
              <p className="text-sm text-muted-foreground max-w-xs">Select a file from the list on the left to preview it and manage feedback.</p>
            </div>
          )}
        </div>
      </div>

      {/* Real Examples */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Real Examples — Feedback Workflow</h2>
        <p className="text-muted-foreground text-sm mb-6">
          See how timestamped feedback streamlines communication between you and your client.
        </p>
        <div className="space-y-3">
          {examples.map((ex, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">{ex.type}</span>
                <p className="text-sm text-foreground">{ex.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">How It Works — Streamline Your Review Process</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: "Add Drive Link", desc: "Paste your Google Drive link and select the file type." },
            { step: "Client Preview", desc: "Clients see a professional preview without needing an account." },
            { step: "Timestamped Feedback", desc: "Clients click the timeline to leave frame-accurate comments." },
            { step: "Auto-Checklist", desc: "Comments automatically sync to your revision checklist." },
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
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">About Files & Feedback — Professional Client Review</h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            Giglant's Files & Feedback system is designed to eliminate the "vague feedback" problem. By integrating directly with <strong>Google Drive</strong>, we provide a seamless bridge between your storage and your client's review experience.
          </p>
          <p>
            The core technology uses <strong>real-time synchronization</strong> via Supabase, meaning as soon as a client leaves a comment, it appears in your workspace. No more refreshing pages or checking emails for feedback.
          </p>
          <h3 className="font-display text-lg font-semibold text-foreground">Key Features</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><Video className="inline h-3 w-3 mr-1" /> <strong>Video/Audio Timestamps:</strong> Frame-accurate feedback for precise editing.</li>
            <li><FileText className="inline h-3 w-3 mr-1" /> <strong>Document Support:</strong> Professional previews for PDFs and images.</li>
            <li><ShieldCheck className="inline h-3 w-3 mr-1" /> <strong>Privacy First:</strong> Files stay on your Drive; we only handle the communication layer.</li>
            <li><Share2 className="inline h-3 w-3 mr-1" /> <strong>Magic Links:</strong> One-click access for clients with no login required.</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection title="Files & Feedback FAQ — Streamline Your Workflow" items={faq} />
    </div>
  );
};

export default FilesTab;