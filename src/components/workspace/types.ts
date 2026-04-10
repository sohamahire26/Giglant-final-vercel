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

export const parseTs = (input: string): number | null => {
  const clean = input.trim().replace(/[^0-9:]/g, "");
  if (!clean) return null;

  // Handle MM:SS format
  if (clean.includes(":")) {
    const parts = clean.split(":");
    if (parts.length !== 2) return null;
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (isNaN(m) || isNaN(s) || s >= 60) return null;
    return m * 60 + s;
  }

  // Handle shorthand like 0233 or 123
  if (clean.length >= 3 && clean.length <= 4) {
    const s = parseInt(clean.slice(-2), 10);
    const m = parseInt(clean.slice(0, -2), 10);
    if (isNaN(m) || isNaN(s) || s >= 60) return null;
    return m * 60 + s;
  }

  // Handle just seconds
  const sec = parseInt(clean, 10);
  if (!isNaN(sec)) return sec;

  return null;
};

export const getTimeRemaining = (createdAt: string) => {
  const created = new Date(createdAt).getTime();
  const expires = created + (7 * 24 * 60 * 60 * 1000);
  const now = new Date().getTime();
  const diff = expires - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
};