import { useState } from "react";
import { Link } from "react-router-dom";
import { Link as LinkIcon, Copy, Check, Trash2, Plus, ClipboardCopy, AlertCircle, Info, Pencil } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";

interface FeedbackEntry {
  id: string;
  timestamp: string;
  comment: string;
}

const extractFileId = (url: string): string | null => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

const faq = [
  { question: "Do you store videos?", answer: "No, videos are not stored. They are loaded directly from Google Drive using an embedded preview." },
  { question: "Why manual timestamps?", answer: "Embedded Google Drive videos cannot provide timestamp data to the browser. You need to manually note the time when pausing." },
  { question: "What video formats work?", answer: "Any video format supported by Google Drive — MP4, MOV, WebM, AVI, etc." },
  { question: "Is this tool free?", answer: "Yes, completely free. No signup, no storage, no backend required." },
  { question: "Can I share my feedback?", answer: "Yes! Use the 'Copy All Feedback' button to copy your timestamped feedback and share via any messaging app." },
];

const TimestampFeedbackTool = () => {
  const [driveUrl, setDriveUrl] = useState("");
  const [fileId, setFileId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [timestamp, setTimestamp] = useState("");
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");

  const handleLoadVideo = () => {
    setError("");
    const id = extractFileId(driveUrl);
    if (!id) {
      setError("Invalid Google Drive link. Please paste a link like: https://drive.google.com/file/d/FILE_ID/view");
      return;
    }
    setFileId(id);
  };

  const handleAddEntry = () => {
    if (!timestamp.trim() || !comment.trim()) return;
    if (!/^\d{1,2}:\d{2}$/.test(timestamp.trim())) {
      setError("Use MM:SS format (e.g., 01:34)");
      return;
    }
    setError("");
    setEntries(prev => [...prev, { id: crypto.randomUUID(), timestamp: timestamp.trim(), comment: comment.trim() }]);
    setTimestamp("");
    setComment("");
  };

  const handleDelete = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const handleEdit = (entry: FeedbackEntry) => {
    setEditingId(entry.id);
    setEditComment(entry.comment);
  };

  const handleSaveEdit = (id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, comment: editComment } : e));
    setEditingId(null);
  };

  const handleCopyAll = () => {
    const text = entries.map(e => `[${e.timestamp}] ${e.comment}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearAll = () => setEntries([]);

  return (
    <Layout>
      <SEOHead
        title="Timestamp Feedback Tool — Google Drive Video Review | Giglant"
        description="This tool allows freelancers to share videos using Google Drive and collect timestamped feedback without uploading files to any server."
      />
      <section className="section-padding">
        <div className="container-tight max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Timestamp Feedback Tool</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Share videos via Google Drive and collect timestamped feedback — no uploads, no storage, no backend.
            </p>
          </div>

          {/* Freelancer Instructions */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">For Freelancers — How to Use</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {[
                { step: "1", title: "Upload to Drive", desc: "Upload your video to Google Drive" },
                { step: "2", title: "Get Link", desc: "Right-click the video → 'Get link'" },
                { step: "3", title: "Set Access", desc: "Change to 'Anyone with the link' → Viewer" },
                { step: "4", title: "Paste Here", desc: "Copy the link and paste it below" },
              ].map(s => (
                <div key={s.step} className="rounded-xl border border-border bg-background p-4 text-center">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{s.step}</div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Video Input */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">Paste Google Drive Video Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/FILE_ID/view"
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleLoadVideo()}
              />
              <Button onClick={handleLoadVideo}><LinkIcon className="mr-2 h-4 w-4" /> Load Video</Button>
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
          </div>

          {/* Video Preview */}
          {fileId && (
            <div className="rounded-2xl border border-border bg-card p-6 mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Video Preview</h2>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-background">
                <iframe
                  src={`https://drive.google.com/file/d/${fileId}/preview`}
                  className="h-full w-full"
                  allow="autoplay"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Client Instructions */}
          {fileId && (
            <div className="mb-6 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">How to Add Feedback</h2>
              </div>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Watch the video and <strong className="text-foreground">pause</strong> where you want changes</li>
                <li>2. Note the timestamp shown in the video player</li>
                <li>3. Enter the timestamp and your feedback below</li>
                <li>4. Click "Add" — repeat for all changes</li>
                <li>5. Use "Copy All Feedback" to send your complete revision list</li>
              </ol>
            </div>
          )}

          {/* Feedback Input */}
          {fileId && (
            <div className="rounded-2xl border border-border bg-card p-6 mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Add Timestamp Feedback</h2>
              <div className="flex gap-2 items-end flex-wrap">
                <div className="w-28">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Time (MM:SS)</label>
                  <input
                    type="text"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="00:00"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Comment</label>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe what needs to change..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
                  />
                </div>
                <Button onClick={handleAddEntry}><Plus className="mr-1 h-4 w-4" /> Add</Button>
              </div>
            </div>
          )}

          {/* Feedback Output */}
          {entries.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Feedback ({entries.length})</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleClearAll}><Trash2 className="mr-1 h-3 w-3" /> Clear All</Button>
                  <Button size="sm" onClick={handleCopyAll}>
                    {copied ? <Check className="mr-1 h-3 w-3" /> : <ClipboardCopy className="mr-1 h-3 w-3" />}
                    {copied ? "Copied!" : "Copy All Feedback"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {entries.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                    <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs font-mono font-bold text-primary">{entry.timestamp}</span>
                    {editingId === entry.id ? (
                      <div className="flex-1 flex gap-2">
                        <input type="text" value={editComment} onChange={e => setEditComment(e.target.value)}
                          className="flex-1 rounded-lg border border-border bg-card px-3 py-1 text-sm text-foreground focus:border-primary focus:outline-none"
                          onKeyDown={e => e.key === "Enter" && handleSaveEdit(entry.id)} autoFocus />
                        <Button size="sm" variant="outline" onClick={() => handleSaveEdit(entry.id)}>Save</Button>
                      </div>
                    ) : (
                      <>
                        <p className="flex-1 text-sm text-foreground">{entry.comment}</p>
                        <button onClick={() => handleEdit(entry)} className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-primary hover:bg-primary/10">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA to project */}
          <div className="mt-8 text-center rounded-2xl border border-primary/30 bg-primary/5 p-8">
            <h2 className="font-display text-xl font-bold text-foreground">Need a full project workspace?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create a project to manage files, collect database-backed feedback, generate delivery messages, and invoices.</p>
            <Button variant="hero" className="mt-4" asChild>
              <Link to="/projects/new">Create Project Workspace →</Link>
            </Button>
          </div>
        </div>
      </section>
      <FAQSection title="Timestamp Feedback FAQ" items={faq} />
    </Layout>
  );
};

export default TimestampFeedbackTool;
