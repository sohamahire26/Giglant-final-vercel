export interface Project {
  id: string;
  name: string;
  client_name: string | null;
  description: string | null;
  work_type: string;
  share_token: string;
  drive_folder_url: string | null;
  created_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_type: string;
  drive_url: string;
  drive_file_id: string | null;
  filename: string;
  sort_order: number;
  created_at: string;
}

export interface FileComment {
  id: string;
  file_id: string;
  timestamp_seconds: number | null;
  comment: string;
  author_name: string;
  is_client: boolean;
  is_resolved: boolean;
  created_at: string;
}

export const extractDriveFileId = (url: string): string | null => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

export const detectFileType = (url: string, filename: string): string => {
  const lower = (filename || url).toLowerCase();
  if (/\.(mp4|mov|avi|mkv|webm|m4v)/.test(lower)) return "video";
  if (/\.(mp3|wav|ogg|m4a|aac|flac)/.test(lower)) return "audio";
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)/.test(lower)) return "image";
  if (/\.(pdf)/.test(lower)) return "pdf";
  if (/\.(doc|docx|txt|rtf)/.test(lower)) return "document";
  if (/\.(psd|ai|fig|sketch|xd)/.test(lower)) return "design";
  return "other";
};

export const fmtTs = (s: number | null): string => {
  if (s === null) return "";
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
};