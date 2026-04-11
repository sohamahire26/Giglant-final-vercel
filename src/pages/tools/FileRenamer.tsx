import { useState, useCallback } from "react";
import { Upload, Download, FileIcon, X, Wand2, Loader2, RefreshCw, Sparkles, FileArchive, CheckCircle2, Info, Zap, History, ListChecks, ArrowRight, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";
import exifr from "exifr";
import JSZip from "jszip";
import { useAuth } from "@/components/AuthProvider";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

declare const puter: any;

interface RenamedFile {
  original: File;
  newName: string;
  status: "processing" | "done";
  detectedType?: string;
  typeCategory?: string;
}

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf:"Document", doc:"Document", docx:"Document", txt:"Text", rtf:"Document", odt:"Document",
  xls:"Spreadsheet", xlsx:"Spreadsheet", csv:"Data",
  ppt:"Presentation", pptx:"Presentation",
  jpg:"Photo", jpeg:"Photo", png:"Image", gif:"Image", webp:"Image", svg:"Vector",
  bmp:"Image", tiff:"Image", heic:"Photo", heif:"Photo", raw:"Photo", cr2:"Photo", nef:"Photo",
  mp4:"Video", mov:"Video", avi:"Video", mkv:"Video", wmv:"Video", webm:"Video",
  mp3:"Audio", wav:"Audio", flac:"Audio", aac:"Audio", ogg:"Audio", m4a:"Audio",
  zip:"Archive", rar:"Archive", "7z":"Archive",
  psd:"Design", ai:"Design", fig:"Design", sketch:"Design", xd:"Design",
  aep:"After-Effects", prproj:"Premiere-Project", drp:"DaVinci-Project",
};

const getTypeCategory = (ext: string): string => {
  const cats: Record<string, string[]> = {
    Image: ["jpg","jpeg","png","gif","webp","bmp","tiff","heic","heif","raw","cr2","nef","svg"],
    Video: ["mp4","mov","avi","mkv","wmv","webm"],
    Audio: ["mp3","wav","flac","aac","ogg","m4a"],
    Document: ["pdf","doc","docx","txt","rtf","odt","md","html","json","xml"],
    Spreadsheet: ["xls","xlsx","csv"],
    Presentation: ["ppt","pptx"],
    Design: ["psd","ai","fig","sketch","xd"],
    Project: ["aep","prproj","drp"],
    Archive: ["zip","rar","7z"],
  };
  for (const [cat, exts] of Object.entries(cats)) {
    if (exts.includes(ext)) return cat;
  }
  return "File";
};

const extractPdfText = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const maxPages = Math.min(pdf.numPages, 2);
    let fullText = "";
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => (item as any).str).join(" ");
      fullText += pageText + " ";
    }
    return fullText.substring(0, 1500);
  } catch { return ""; }
};

const extractImageMetadata = async (file: File) => {
  try {
    const exif = await exifr.parse(file, { pick: ["Make","Model","DateTimeOriginal","ImageDescription"] });
    return exif || {};
  } catch { return {}; }
};

const smartRename = async (file: File): Promise<{ name: string; type: string; category: string }> => {
  const ext = file.name.includes(".") ? "." + file.name.split(".").pop()!.toLowerCase() : "";
  const extClean = ext.replace(".", "");
  const category = getTypeCategory(extClean);
  const typeLabel = FILE_TYPE_LABELS[extClean] || "File";

  let context = `Original Filename: ${file.name}\nFile Type: ${typeLabel}\nCategory: ${category}\n`;
  if (extClean === "pdf") {
    const text = await extractPdfText(file);
    if (text) context += `Content Snippet: ${text}\n`;
  } else if (["jpg","jpeg","png"].includes(extClean)) {
    const meta = await extractImageMetadata(file);
    if (Object.keys(meta).length) context += `Metadata: ${JSON.stringify(meta)}\n`;
  }

  try {
    const response = await puter.ai.chat(`Suggest a professional, descriptive filename for this file. Return ONLY the filename without extension. Use hyphens instead of spaces. Context:\n${context}`);
    const suggestedName = response.toString().trim().replace(/\.[^/.]+$/, "").replace(/\s+/g, "-");
    return { name: suggestedName + ext, type: typeLabel, category };
  } catch (err) {
    return { name: file.name, type: typeLabel, category };
  }
};

const faq = [
  { question: "How does the AI analyze my files?", answer: "It uses Puter AI to read document text (PDFs), image metadata (EXIF), and video properties to understand the content and suggest a meaningful name." },
  { question: "Is my data safe?", answer: "Yes. Files are processed locally in your browser. Only small text snippets or metadata are sent to the AI for naming suggestions. Your actual files never leave your device." },
  { question: "What is the numbering system?", answer: "The tool automatically groups files by category (e.g., Video, Image) and adds a sequential number to keep your project organized." },
];

const examples = [
  { original: "IMG_8242.jpg", renamed: "Photo-1-Sunset-Beach-Malibu.jpg", note: "AI detected location and subject from metadata." },
  { original: "draft_v1_final.pdf", renamed: "Document-1-Project-Proposal-Q4.pdf", note: "AI read the document title from the first page." },
  { original: "sequence_01.mp4", renamed: "Video-1-Interview-Main-Angle.mp4", note: "AI analyzed the context to provide a descriptive name." },
];

const FileRenamerTool = () => {
  const { session } = useAuth();
  const [files, setFiles] = useState<RenamedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [zipping, setZipping] = useState(false);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const incoming = Array.from(fileList).map((f) => ({ original: f, newName: f.name, status: "processing" as const }));
    setFiles((prev) => [...prev, ...incoming]);
    const categoryCounts: Record<string, number> = {};
    for (const entry of incoming) {
      const result = await smartRename(entry.original);
      setFiles((prev) => {
        const cat = result.category;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        const num = categoryCounts[cat];
        const ext = result.name.includes(".") ? "." + result.name.split(".").pop() : "";
        const namePart = result.name.replace(/\.[^/.]+$/, "");
        const finalName = `${cat}-${num}-${namePart}${ext}`;
        return prev.map((f) => f.original === entry.original ? { ...f, newName: finalName, detectedType: result.type, typeCategory: cat, status: "done" as const } : f);
      });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));
  const updateName = (index: number, newName: string) => setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, newName } : f)));
  const clearAll = () => setFiles([]);
  
  const downloadSingle = (f: RenamedFile) => {
    const url = URL.createObjectURL(f.original);
    const a = document.createElement("a"); a.href = url; a.download = f.newName; a.click(); URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    files.forEach((f) => downloadSingle(f));
  };

  const downloadZip = async () => {
    setZipping(true);
    const zip = new JSZip();
    files.forEach((f) => {
      zip.file(f.newName, f.original);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a"); a.href = url; a.download = "renamed_files.zip"; a.click(); URL.revokeObjectURL(url);
    setZipping(false);
  };

  return (
    <Layout>
      <SEOHead title="AI File Renamer — Giglant" description="AI-powered file renaming with automatic numbering and content analysis." />
      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">AI Smart File Renamer</h1>
            <p className="mt-4 text-lg text-muted-foreground">Drop files to get professional names with auto-numbering. Powered by Puter AI.</p>
          </div>

          {!session && (
            <div className="mb-12 rounded-3xl bg-foreground p-8 text-center text-background md:p-12">
              <h2 className="font-display text-2xl font-bold">Unlock Full Project Workspaces</h2>
              <p className="mt-3 text-background/70">
                Renaming is just the start. Sign up to create project workspaces, get timestamped client feedback, and manage revisions.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button asChild variant="hero">
                  <Link to="/login">Get Started Free</Link>
                </Button>
                <Button asChild variant="hero-outline">
                  <Link to="/pricing">View Plans</Link>
                </Button>
              </div>
            </div>
          )}

          {/* How to Use Section */}
          <div className="mb-12 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">How to Use the AI Renamer</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { step: "1", title: "Upload Files", desc: "Drag and drop your messy files into the box below." },
                { step: "2", title: "AI Analysis", desc: "AI reads metadata and content to suggest professional names." },
                { step: "3", title: "Download", desc: "Download files individually or as a single ZIP archive." },
              ].map(s => (
                <div key={s.step} className="rounded-xl border border-border bg-background p-4 text-center">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white text-sm font-bold">{s.step}</div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
            <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Drop your files here</p>
            <input type="file" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} className="absolute inset-0 cursor-pointer opacity-0" />
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h2 className="font-display text-xl font-semibold text-foreground">AI Suggestions ({files.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={clearAll} variant="outline" size="sm">Clear All</Button>
                  <Button onClick={downloadAll} variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Download All</Button>
                  <Button onClick={downloadZip} variant="default" size="sm" disabled={zipping}>
                    {zipping ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileArchive className="mr-1 h-4 w-4" />}
                    Download ZIP
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <FileIcon className="h-8 w-8 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs text-muted-foreground">{f.original.name}</p>
                        {f.detectedType && f.status === "done" && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{f.detectedType}</span>}
                      </div>
                      {f.status === "processing" ? (
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" /> AI is analyzing...</div>
                      ) : (
                        <input type="text" value={f.newName} onChange={(e) => updateName(i, e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => downloadSingle(f)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Download"><Download className="h-4 w-4" /></button>
                      <button onClick={() => removeFile(i)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Remove"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real Examples */}
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Real Examples — AI Renaming</h2>
            <div className="space-y-3">
              {examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground line-through">{ex.original}</span>
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <p className="text-sm font-medium text-foreground">{ex.renamed}</p>
                    </div>
                    <p className="text-xs text-muted-foreground italic">{ex.note}</p>
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">How It Works — Smart Organization</h2>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { step: "Content Scan", desc: "AI reads the first pages of documents and image metadata." },
                { step: "Contextual Naming", desc: "Generates a descriptive name based on what's inside the file." },
                { step: "Auto-Numbering", desc: "Groups files by type and adds sequential numbers." },
                { step: "Batch Export", desc: "Download everything at once in a clean, organized ZIP." },
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
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">About AI Renaming — Clarity & Speed</h2>
            <div className="prose max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed">
              <p>
                The AI File Renamer is built to solve the "final-final-v2.mp4" problem. By using <strong>Puter AI</strong>, we can understand the actual content of your files rather than just looking at the existing name.
              </p>
              <p>
                This tool is essential for <strong>video editing workflows</strong> and <strong>freelancer pipelines</strong> where keeping track of hundreds of assets is the difference between a smooth project and a nightmare.
              </p>
              <h3 className="font-display text-lg font-semibold text-foreground">Why Use AI Renaming?</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><ListChecks className="inline h-3 w-3 mr-1" /> <strong>Consistency:</strong> Every file follows the same professional format.</li>
                <li><Zap className="inline h-3 w-3 mr-1" /> <strong>Speed:</strong> Rename 50 files in seconds instead of minutes.</li>
                <li><History className="inline h-3 w-3 mr-1" /> <strong>Searchability:</strong> Find files instantly by their descriptive names.</li>
              </ul>
            </div>
          </div>

          <FAQSection title="File Renamer FAQ" items={faq} />
        </div>
      </section>
    </Layout>
  );
};

export default FileRenamerTool;