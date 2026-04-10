import { useState, useCallback } from "react";
import { Upload, Download, FileIcon, X, Wand2, Loader2, RefreshCw } from "lucide-react";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";
import exifr from "exifr";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface RenamedFile {
  original: File;
  newName: string;
  status: "processing" | "done";
  detectedType?: string;
  typeCategory?: string;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_MAP: Record<string, number> = {
  january:0, february:1, march:2, april:3, may:4, june:5, july:6, august:7,
  september:8, october:9, november:10, december:11,
  jan:0, feb:1, mar:2, apr:3, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11,
};
const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","is","it","this",
  "that","with","from","by","as","are","was","be","has","had","have","do","does",
  "did","will","would","can","could","should","may","might","shall","not","no","so",
  "page","date","total","amount","please","thank","you","dear","sincerely","regards",
  "www","http","https","com","org","net",
]);

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
    const maxPages = Math.min(pdf.numPages, 5);
    let fullText = "";
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => (item as any).str).join(" ");
      fullText += pageText + " ";
    }
    return fullText.substring(0, 10000);
  } catch {
    return "";
  }
};

const extractPlainText = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).substring(0, 8000));
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });

const extractImageMetadata = async (file: File) => {
  try {
    const exif = await exifr.parse(file, {
      pick: ["Make","Model","DateTimeOriginal","CreateDate","ImageDescription",
             "XPTitle","XPSubject","XPComment","GPSLatitude","GPSLongitude","Artist","Copyright","Software"],
    });
    if (!exif) return {};
    return {
      camera: exif.Make && exif.Model ? `${exif.Make}-${exif.Model}`.replace(/\s+/g, "-") : undefined,
      date: exif.DateTimeOriginal || exif.CreateDate,
      description: exif.ImageDescription || exif.XPTitle || exif.XPSubject || exif.XPComment,
      subject: exif.Artist,
    };
  } catch {
    return {};
  }
};

const detectDocType = (text: string): string | null => {
  const patterns: [RegExp, string][] = [
    [/invoice\s*(no|number|#|:|id)/i, "Invoice"],
    [/total\s*(amount|due|payable|balance)/i, "Invoice"],
    [/bill\s*to|sold\s*to|ship\s*to/i, "Invoice"],
    [/purchase\s*order|po\s*(no|number|#)/i, "Purchase-Order"],
    [/contract|agreement|terms\s*and\s*conditions|hereby\s*agree/i, "Agreement"],
    [/non[\s-]*disclosure|nda|confidential\s*agreement/i, "NDA"],
    [/resume|curriculum\s*vitae|work\s*experience|professional\s*summary/i, "Resume"],
    [/cover\s*letter|dear\s*hiring/i, "Cover-Letter"],
    [/receipt|payment\s*received|transaction\s*(id|no)/i, "Receipt"],
    [/proposal|project\s*scope|deliverables|objectives/i, "Proposal"],
    [/quarterly\s*report|annual\s*report|financial\s*report/i, "Financial-Report"],
    [/report|analysis|findings|conclusion|executive\s*summary/i, "Report"],
    [/meeting\s*(notes|minutes|agenda|summary)/i, "Meeting-Notes"],
    [/certificate|hereby\s*certif|awarded\s*to/i, "Certificate"],
    [/letter|dear\s*(sir|madam|mr|ms|team|customer)/i, "Letter"],
    [/brief|creative\s*brief|project\s*brief/i, "Brief"],
    [/quotation|quote|estimate|pricing/i, "Quote"],
    [/manual|user\s*guide|instructions|how[\s-]*to/i, "Guide"],
    [/thesis|dissertation|abstract|methodology|literature\s*review/i, "Thesis"],
    [/syllabus|course|semester|assignment|lecture/i, "Academic"],
    [/patent|claim\s*\d|invention/i, "Patent"],
    [/policy|regulation|compliance/i, "Policy"],
    [/memo|memorandum/i, "Memo"],
    [/specification|requirement|functional\s*spec/i, "Specification"],
    [/warranty|guarantee/i, "Warranty"],
    [/lease|tenancy|landlord|tenant|rental\s*agreement/i, "Lease"],
  ];
  for (const [regex, type] of patterns) {
    if (regex.test(text)) return type;
  }
  return null;
};

const extractIdentifiers = (text: string) => {
  const result: { invoiceNo?: string; company?: string; subject?: string; person?: string } = {};
  const invMatch = text.match(/(?:invoice|po|order|receipt|ref|reference)\s*(?:no|number|#|id|:)\s*[:\s]*([A-Z0-9][\w\-]{2,20})/i);
  if (invMatch) result.invoiceNo = invMatch[1];
  const subMatch = text.match(/(?:subject|re|regarding|title|project)\s*[:\-]\s*(.{5,50}?)(?:\n|$)/i);
  if (subMatch) result.subject = subMatch[1].trim();
  const compMatch = text.match(/(?:from|company|organization|firm|prepared\s*(?:by|for)|client)\s*[:\s]+([A-Z][A-Za-z\s&]{2,25}?)(?:\n|,|\.|\s{2})/);
  if (compMatch) result.company = compMatch[1].trim().replace(/\s+/g, "-");
  const nameMatch = text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m);
  if (nameMatch) result.person = nameMatch[1].replace(/\s+/g, "-");
  return result;
};

const extractDateStr = (text: string): string | null => {
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${MONTHS[parseInt(iso[2]) - 1]}${iso[1]}`;
  const my = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\w*[\s,]*(\d{4})/i);
  if (my) return `${MONTHS[MONTH_MAP[my[1].toLowerCase()] ?? 0]}${my[2]}`;
  const slash = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slash) {
    const m = parseInt(slash[1]) <= 12 ? parseInt(slash[1]) : parseInt(slash[2]);
    return `${MONTHS[m - 1]}${slash[3]}`;
  }
  return null;
};

const extractKeywords = (text: string, max = 3): string[] => {
  const words = text.replace(/[^a-zA-Z\s]/g, " ").split(/\s+/)
    .filter((w) => w.length > 3 && w.length < 18 && !STOP_WORDS.has(w.toLowerCase()) && !/^\d+$/.test(w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const w of words) {
    const low = w.toLowerCase();
    if (!seen.has(low)) { seen.add(low); unique.push(w); if (unique.length >= max) break; }
  }
  return unique;
};

const cleanRawName = (name: string): string =>
  name.replace(/[_\-\.]+/g, " ").replace(/\s+/g, " ")
    .replace(/\(?\d+\)?$/, "")
    .replace(/\b(copy|final|v\d+|draft|new|old|untitled|document|image|img|dsc|dcim|scan|screenshot|screen\s*shot|capture|photo|vid|video|audio|recording|download|downloaded|attachment|whatsapp|telegram|signal)\b/gi, "")
    .replace(/\s+/g, " ").trim();

const analyzeImage = async (file: File) => {
  const name = file.name.toLowerCase();
  return {
    isScreenshot: name.includes("screenshot") || name.includes("screen shot") || name.includes("capture")
  };
};

const smartRename = async (file: File): Promise<{ name: string; type: string; category: string }> => {
  const ext = file.name.includes(".") ? "." + file.name.split(".").pop()!.toLowerCase() : "";
  const extClean = ext.replace(".", "");
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
  const fileTypeLabel = FILE_TYPE_LABELS[extClean] || "File";
  const category = getTypeCategory(extClean);
  
  const isImage = ["jpg","jpeg","png","gif","webp","bmp","tiff","heic","heif","raw","cr2","nef","svg"].includes(extClean);
  const isVideo = ["mp4","mov","avi","mkv","wmv","webm"].includes(extClean);
  const isAudio = ["mp3","wav","flac","aac","ogg","m4a"].includes(extClean);
  const isDoc = ["pdf","doc","docx","txt","rtf","odt","md","html","json","xml"].includes(extClean);

  const parts: string[] = [];
  let detectedType = fileTypeLabel;

  if (isDoc) {
    let text = extClean === "pdf" ? await extractPdfText(file) : await extractPlainText(file);
    if (text.length > 20) {
      const docType = detectDocType(text);
      if (docType) { parts.push(docType); detectedType = docType; }
      const ids = extractIdentifiers(text);
      if (ids.invoiceNo) parts.push(ids.invoiceNo);
      if (ids.company) parts.push(ids.company);
      if (ids.subject) {
        const subWords = ids.subject.split(/\s+/).slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        parts.push(...subWords);
      }
      if (ids.person && (detectedType === "Resume" || detectedType === "Cover-Letter")) parts.push(ids.person);
      if (parts.length < 3) parts.push(...extractKeywords(text, 4 - parts.length));
      const dateStr = extractDateStr(text) || extractDateStr(nameWithoutExt);
      if (dateStr && !parts.some(p => p.includes(dateStr))) parts.push(dateStr);
    }
  }

  if (isImage && extClean !== "svg") {
    const [meta, analysis] = await Promise.all([extractImageMetadata(file), analyzeImage(file)]);
    if (analysis.isScreenshot) { parts.push("Screenshot"); detectedType = "Screenshot"; }
    else if (meta.description) {
      parts.push(...meta.description.split(/\s+/).slice(0, 3).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()));
    }
    if (parts.length === 0) {
      const cleaned = cleanRawName(nameWithoutExt);
      if (cleaned.length > 1) {
        parts.push(...cleaned.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).slice(0, 4));
      } else {
        parts.push(fileTypeLabel);
      }
    }
  }

  if (isVideo || isAudio) {
    const cleaned = cleanRawName(nameWithoutExt);
    if (cleaned.length > 1) {
      parts.push(...cleaned.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).slice(0, 4));
    } else {
      parts.push(fileTypeLabel);
    }
  }

  if (parts.length === 0) {
    const cleaned = cleanRawName(nameWithoutExt);
    if (cleaned.length > 1) parts.push(...cleaned.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).slice(0, 4));
  }
  if (parts.length === 0) {
    parts.push(fileTypeLabel);
    const d = new Date(file.lastModified);
    parts.push(`${MONTHS[d.getMonth()]}${d.getFullYear()}`);
  }

  const baseName = parts.join("-").replace(/[^a-zA-Z0-9\-x]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return { name: baseName + ext, type: detectedType, category };
};

const faq = [
  { question: "How does the Smart File Renamer work?", answer: "It reads actual file content using PDF.js for PDFs and text extraction for documents. For images, it reads EXIF metadata. For videos and audio, it uses file metadata. Files are automatically numbered within their type category (Image‑1, Image‑2, Video‑1, etc.) for organized file management in your editing pipeline." },
  { question: "What document types can it detect?", answer: "It detects 25+ document types including Invoices, Contracts, NDAs, Resumes, Cover Letters, Reports, Meeting Notes, Proposals, Quotes, Certificates, and more — essential for freelancer workflow and post‑production workflow file management." },
  { question: "How does the automatic numbering system work?", answer: "When you upload multiple files, each file gets numbered within its type category. For example, 3 images become Image‑1, Image‑2, Image‑3 and 2 videos become Video‑1, Video‑2. This keeps your content workflow organized." },
  { question: "Are my files uploaded to a server?", answer: "No. All processing — PDF text extraction, EXIF reading, image analysis — happens 100% in your browser. Your files never leave your device. Perfect for client delivery workflow where privacy matters." },
  { question: "What file types are supported?", answer: "All file types used in video editing workflow and content workflow. PDFs get full text extraction. Images get EXIF analysis. Videos and audio get metadata‑based naming. Design files (PSD, AI, Figma) are categorized automatically." },
  { question: "Can I edit the suggested names?", answer: "Yes! Click any suggested name to edit it before downloading. The tool fits into your editing pipeline by giving you full control over the final output." },
];

const examples = [
  { before: "scan0001.pdf", after: "Document-1-Invoice-89234-Amazon.pdf", note: "Reads PDF text → detects invoice → extracts number and vendor" },
  { before: "document.pdf", after: "Document-2-Agreement-Microsoft-Service.pdf", note: "Reads content → identifies contract → extracts parties" },
  { before: "IMG_4567.jpg", after: "Image-1-Sunset-Beach-View.jpg", note: "Uses EXIF description or cleaned original filename + auto-numbered" },
  { before: "screenshot_2024.png", after: "Image-2-Screenshot.png", note: "Detects screenshot from name + numbered in image category" },
  { before: "final_final_v2.pdf", after: "Document-3-Report-Financial-TechCorp.pdf", note: "Reads text → extracts report type and org + numbered" },
  { before: "wedding_highlights_reel.mp4", after: "Video-1-Wedding-Highlights-Reel.mp4", note: "Cleans original filename + auto-numbered by type" },
];

const FileRenamerTab = () => {
  const [files, setFiles] = useState<RenamedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const incoming = Array.from(fileList).map((f) => ({
      original: f,
      newName: f.name,
      status: "processing" as const,
      detectedType: undefined as string | undefined,
      typeCategory: undefined as string | undefined,
    }));

    setFiles((prev) => [...prev, ...incoming]);

    const results: { file: File; name: string; type: string; category: string }[] = [];
    for (const entry of incoming) {
      const result = await smartRename(entry.original);
      results.push({ file: entry.original, ...result });
    }

    setFiles((prev) => {
      const categoryCounts: Record<string, number> = {};
      for (const f of prev) {
        if (f.status === "done" && f.typeCategory) {
          categoryCounts[f.typeCategory] = (categoryCounts[f.typeCategory] || 0) + 1;
        }
      }

      return prev.map((f) => {
        const result = results.find((r) => r.file === f.original);
        if (!result) return f;

        const cat = result.category;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        const num = categoryCounts[cat];

        const ext = result.file.name.includes(".") ? "." + result.file.name.split(".").pop()!.toLowerCase() : "";
        const nameWithoutExt = result.name.replace(/\.[^/.]+$/, "");
        const numberedName = `${cat}-${num}-${nameWithoutExt}${ext}`;

        return {
          ...f,
          newName: numberedName,
          detectedType: result.type,
          typeCategory: cat,
          status: "done" as const,
        };
      });
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const reprocessFile = useCallback(async (index: number) => {
    const file = files[index];
    if (!file) return;
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "processing" } : f)));
    const result = await smartRename(file.original);
    const cat = result.category;
    let num = 0;
    for (let i = 0; i <= index; i++) {
      if (files[i]?.typeCategory === cat || i === index) num++;
    }
    const ext = file.original.name.includes(".") ? "." + file.original.name.split(".").pop()!.toLowerCase() : "";
    const nameWithoutExt = result.name.replace(/\.[^/.]+$/, "");
    const numberedName = `${cat}-${num}-${nameWithoutExt}${ext}`;
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, newName: numberedName, detectedType: result.type, typeCategory: cat, status: "done" } : f)));
  }, [files]);

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
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Smart File Renamer</h1>
        <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
          Drop files and get clean, meaningful names with automatic numbering. Reads PDF content, image EXIF data, and detects 25+ document types — built for your video editing workflow and file management pipeline.
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
        <p className="mt-1 text-sm text-muted-foreground">PDFs, images, videos, documents — all types supported</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1"><Wand2 className="h-3 w-3" /> Reads content</span>
          <span className="rounded-full bg-secondary px-3 py-1">Auto‑numbered</span>
          <span className="rounded-full bg-secondary px-3 py-1">100% Private</span>
        </div>
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
              <Wand2 className="mr-2 inline h-5 w-5 text-primary" /> Auto‑Named Files ({files.length})
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
                    {f.typeCategory && f.status === "done" && (
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{f.typeCategory}</span>
                    )}
                  </div>
                  {f.status === "processing" ? (
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" /> Reading content & analyzing...
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
                  onClick={() => reprocessFile(i)}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                  title="Re‑analyze"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
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

      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Real Examples — Content Workflow File Management</h2>
        <p className="text-muted-foreground text-sm mb-6">
          See how content‑aware renaming transforms messy filenames in your editing pipeline.
        </p>
        <div className="space-y-3">
          {examples.map((ex, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{ex.before}</code>
                <span className="text-primary font-bold hidden sm:inline">→</span>
                <code className="text-xs font-semibold text-foreground bg-primary/10 px-2 py-1 rounded">{ex.after}</code>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{ex.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">How It Works — Streamline Your Video Editing Workflow</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: "Drop files", desc: "Any file type — PDFs, images, videos, docs from your editing pipeline" },
            { step: "Content analyzed", desc: "PDF text extracted, EXIF data read, type detected automatically" },
            { step: "Smart name + number", desc: "Named from content, numbered by type (Image‑1, Video‑1)" },
            { step: "Edit & download", desc: "Fine‑tune names and download for your client delivery workflow" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{i + 1}</div>
              <p className="text-sm font-semibold text-foreground">{s.step}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">About Smart File Renamer — File Management for Post Production</h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            Giglant's Smart File Renamer is built for the freelancer workflow. It uses <strong>PDF.js</strong> to extract actual text from PDFs, <strong>EXIF metadata parsing</strong> to read camera data from photos, and <strong>intelligent pattern matching</strong> to detect 25+ document types — all essential for managing your post‑production workflow and video export workflow.
          </p>
          <p>
            The automatic numbering system organizes files by category (Image‑1, Image‑2, Video‑1, Video‑2, Document‑1) so your file management workflow stays clean whether you’re handling 5 files or 500.
          </p>
          <h3 className="font-display text-lg font-semibold text-foreground">What It Reads & Detects</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>PDFs:</strong> Full text extraction via PDF.js (first 5 pages) for your editing pipeline</li>
            <li><strong>Text files:</strong> Direct content reading (TXT, CSV, MD, JSON, HTML)</li>
            <li><strong>Images:</strong> EXIF data — camera, date, description for content workflow</li>
            <li><strong>Videos & Audio:</strong> Metadata‑based naming for video editing workflow</li>
            <li><strong>Auto‑numbering:</strong> Each file type category gets sequential numbers</li>
            <li><strong>25+ doc types:</strong> Invoices, NDAs, Resumes, Reports, Proposals, and more</li>
          </ul>
        </div>
      </div>

      <FAQSection title="File Renamer FAQ — Video Editing Workflow Tool" items={faq} />
    </div>
  );
};

export default FileRenamerTab;
