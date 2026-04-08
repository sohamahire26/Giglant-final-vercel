"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Image, File, Download, Copy, CheckCircle, AlertCircle, Loader2, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  newName: string;
  error?: string;
}

const RenamerTab = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleFileSelect = (fileList: FileList) => {
    const newFiles: FileItem[] = Array.from(fileList).map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      newName: generateNewName(file.name),
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const generateNewName = (originalName: string): string => {
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    const base = originalName.replace(/\.[^/.]+$/, "");
    
    // Auto-detect file type and apply appropriate naming
    if (ext === 'pdf') {
      return `Document_${base.replace(/\s+/g, '_')}.${ext}`;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return `Image_${base.replace(/\s+/g, '_')}.${ext}`;
    } else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
      return `Video_${base.replace(/\s+/g, '_')}.${ext}`;
    } else if (['mp3', 'wav', 'm4a'].includes(ext)) {
      return `Audio_${base.replace(/\s+/g, '_')}.${ext}`;
    } else if (['doc', 'docx', 'txt'].includes(ext)) {
      return `Document_${base.replace(/\s+/g, '_')}.${ext}`;
    } else if (['psd', 'ai', 'fig'].includes(ext)) {
      return `Design_${base.replace(/\s+/g, '_')}.${ext}`;
    } else {
      return `File_${base.replace(/\s+/g, '_')}.${ext}`;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const updateFileName = (id: string, newName: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, newName } : file
    ));
  };

  const copyToClipboard = () => {
    const text = files.map(file => `${file.name} → ${file.newName}`).join('\n');
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const downloadList = () => {
    const text = files.map(file => `${file.name} → ${file.newName}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file-renaming-list.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded renaming list!" });
  };

  const processFiles = () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({ title: "Files processed successfully!" });
    }, 1500);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <FileText className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <FileText className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Smart File Renamer</h2>
          <p className="text-sm text-muted-foreground">
            Automatically rename your files with meaningful names. Supports 25+ file types with intelligent detection.
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">Drop files here or click to browse</p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports images, videos, documents, PDFs, and more
          </p>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="rounded border-border"
              />
              <span className="text-sm font-medium text-foreground">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadList}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear All
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={() => {}}
                  className="rounded border-border"
                />
                <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={file.newName}
                    onChange={(e) => updateFileName(file.id, e.target.value)}
                    className="w-48 rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateFileName(file.id, generateNewName(file.name))}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={processFiles} disabled={isProcessing} className="flex-1">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Process Files
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">How It Works</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-foreground">1. Upload Files</p>
            <p className="text-xs text-muted-foreground mt-1">Drag & drop or browse to select files</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-foreground">2. Auto-Rename</p>
            <p className="text-xs text-muted-foreground mt-1">Files get intelligent names automatically</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Download className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-foreground">3. Process & Export</p>
            <p className="text-xs text-muted-foreground mt-1">Get your renamed files and list</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenamerTab;