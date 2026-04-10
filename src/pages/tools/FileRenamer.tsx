import { useState, useCallback } from "react";
import { Upload, Download, FileIcon, X, Wand2, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";
import exifr from "exifr";

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
    return fullText.substring(0, 2000);
  } catch {
    return "";
  }
};

const extractImageMetadata = async (file: File) => {
  try {
    const exif = await exifr.parse(file, {
      pick: ["Make","Model","DateTimeOriginal","ImageDescription","Software"],
    });
    return exif || {};
  } catch {
    return {};
  }
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
    const response = await puter.ai.chat(
      `Suggest a professional, SEO-friendly filename for this file based on the context provided. 
      Return ONLY the filename without the extension. Use hyphens instead of spaces. 
      Context:\n${context}`
    );
    const suggestedName = response.toString().trim().replace(/\.[^/.]+$/, "");
    return { name: suggestedName + ext, type: typeLabel, category };
  } catch (err) {
    console.error("Puter AI Error:", err);
    return { name: file.name, type: typeLabel, category };
  }
};

const faq = [
  { question: "How does the AI File Renamer work?", answer: "It uses Puter AI to analyze your file's original name, type, and even content (for PDFs) or metadata (for images) to suggest a professional, descriptive filename." },
  { question: "Is it really free?", answer: "Yes! We use Puter.js which provides free AI capabilities directly in your browser." },
  { question: "Are my files uploaded to an AI server?", answer: "Only small snippets of text or metadata are sent to the AI to generate the name. Your actual files never leave your browser." },
];

const FileRenamerTool = () => {
  const [files, setFiles] = useState<RenamedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const incoming = Array.from(fileList).map((f) => ({
      original: f,
      newName: f.name,
      status: "processing" as const,
    }));

    setFiles((prev) => [...prev, ...incoming]);

    for (const entry of incoming) {
      const result = await smartRename(entry.original);
      setFiles((prev) => prev.map((f) => {
        if (f.original === entry.original) {
          return {
            ...f,
            newName: result.name,
            detectedType: result.type,
            typeCategory: result.category,
            status: "done" as const,
          };
        }
        return f;
      }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));
  const updateName = (index: number, newName: string) => setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, newName } : f)));
  const clearAll = () => setFiles([]);
  const downloadAll = () => {
    files.forEach((f) => {
      const url = URL.createObjectURL(f.original);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.newName;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Layout>
      <SEOHead
        title="AI File Renamer — Smart Filenames for Video Editing Workflow | Giglant"
        description="Use Puter AI to automatically rename your project files with professional, descriptive names. Perfect for video editing and freelancer workflows."
      />

      <section className="section-padding">
        <div className="container-tight max-w-4xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">AI Smart File Renamer</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Powered by Puter AI. Drop files to get professional, content-aware filenames instantly.
            </p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border bg-card"}`}
          >
            <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Drop your files here</p>
            <p className="mt-1 text-sm text-muted-foreground">AI will analyze and suggest professional names</p>
            <input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  <Wand2 className="mr-2 inline h-5 w-5 text-primary" /> AI Suggestions ({files.length})
                </h2>
                <div className="flex gap-2">
                  <Button onClick={clearAll} variant="outline" size="sm">Clear All</Button>
                  <Button onClick={downloadAll} variant="default" size="sm">
                    <Download className="mr-1 h-4 w-4" /> Download All
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
                        {f.detectedType && f.status === "done" && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{f.detectedType}</span>
                        )}
                      </div>
                      {f.status === "processing" ? (
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" /> AI is analyzing...
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={f.newName}
                          onChange={(e) => updateName(i, e.target.value)}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <FAQSection title="AI Renamer FAQ" items={faq} />
        </div>
      </section>
    </Layout>
  );
};

export default FileRenamerTool;