import { useState, useCallback } from "react";
import { Upload, Download, FileIcon, X, Loader2, FileArchive, Info, Zap, History, ListChecks, ArrowRight } from "lucide-react";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";

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

const simpleRename = (file: File): { name: string; type: string; category: string } => {
  const ext = file.name.includes(".") ? "." + file.name.split(".").pop()!.toLowerCase() : "";
  const extClean = ext.replace(".", "");
  const category = getTypeCategory(extClean);
  const typeLabel = FILE_TYPE_LABELS[extClean] || "File";

  const baseName = file.name.replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  return { name: baseName + ext, type: typeLabel, category };
};

const faq = [
  { question: "How does the renamer work?", answer: "It analyzes your file extensions to categorize them and cleans up the filenames by removing special characters and replacing spaces with hyphens for better compatibility." },
  { question: "Is my data safe?", answer: "Yes. All processing happens entirely in your browser. Your files are never uploaded to any server." },
  { question: "What is the numbering system?", answer: "The tool automatically groups files by category (e.g., Video, Image) and adds a sequential number to keep your project organized." },
];

const examples = [
  { original: "IMG_8242.jpg", renamed: "Photo-1-IMG-8242.jpg", note: "Categorized as Photo and cleaned up." },
  { original: "draft v1 final.pdf", renamed: "Document-1-draft-v1-final.pdf", note: "Spaces replaced with hyphens." },
  { original: "sequence_01.mp4", renamed: "Video-1-sequence-01.mp4", note: "Categorized as Video." },
];

const FileRenamerTab = () => {
  const [files, setFiles] = useState<RenamedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [zipping, setZipping] = useState(false);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const incoming = Array.from(fileList).map((f) => ({ original: f, newName: f.name, status: "processing" as const }));
    setFiles((prev) => [...prev, ...incoming]);
    
    const categoryCounts: Record<string, number> = {};
    
    const processed = incoming.map((entry) => {
      const result = simpleRename(entry.original);
      const cat = result.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      const num = categoryCounts[cat];
      const ext = result.name.includes(".") ? "." + result.name.split(".").pop() : "";
      const namePart = result.name.replace(/\.[^/.]+$/, "");
      const finalName = `${cat}-${num}-${namePart}${ext}`;
      
      return {
        ...entry,
        newName: finalName,
        detectedType: result.type,
        typeCategory: cat,
        status: "done" as const
      };
    });

    setFiles((prev) => {
      const updated = [...prev];
      processed.forEach(p => {
        const idx = updated.findIndex(f => f.original === p.original && f.status === "processing");
        if (idx !== -1) updated[idx] = p;
      });
      return updated;
    });
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
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">File Renamer</h1>
        <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">Drop files to get professional names with auto-numbering and clean formatting.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">How to Use the Renamer</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "1", title: "Upload Files", desc: "Drag and drop your messy files into the box below." },
            { step: "2", title: "Auto-Formatting", desc: "Files are categorized and names are cleaned for consistency." },
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
            <h2 className="font-display text-xl font-semibold text-foreground">Suggestions ({files.length})</h2>
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
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Processing...</div>
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

      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Real Examples — File Renaming</h2>
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
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">How It Works — Smart Organization</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: "Extension Analysis", desc: "Identifies file types to categorize them correctly." },
            { step: "Name Cleaning", desc: "Removes special characters and fixes formatting." },
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

      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">About File Renaming — Clarity & Speed</h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            The File Renamer is built to solve the "final-final-v2.mp4" problem. By using consistent naming conventions, you can keep your project assets organized and professional.
          </p>
          <p>
            This tool is essential for <strong>video editing workflows</strong> and <strong>freelancer pipelines</strong> where keeping track of hundreds of assets is the difference between a smooth project and a nightmare.
          </p>
          <h3 className="font-display text-lg font-semibold text-foreground">Why Use File Renaming?</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><ListChecks className="inline h-3 w-3 mr-1" /> <strong>Consistency:</strong> Every file follows the same professional format.</li>
            <li><Zap className="inline h-3 w-3 mr-1" /> <strong>Speed:</strong> Rename 50 files in seconds instead of minutes.</li>
            <li><History className="inline h-3 w-3 mr-1" /> <strong>Searchability:</strong> Find files instantly by their descriptive names.</li>
          </ul>
        </div>
      </div>

      <FAQSection title="File Renamer FAQ" items={faq} className="px-0 py-12" />
    </div>
  );
};

export default FileRenamerTab;