import { differenceInDays, differenceInHours, parseISO, addDays } from "date-fns";

export interface Project {
  id: string;
  name: string;
  client_name: string | null;
  description: string | null;
  work_type: string;
  share_token: string;
  drive_folder_url: string | null;
  created_at: string;
  expires_at?: string | null;
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
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  
  const mmss = `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${mmss}`;
  }
  return mmss;
};

export const parseTs = (input: string): number | null => {
  const clean = input.trim().replace(/[^0-9:]/g, "");
  if (!clean) return null;

  const parts = clean.split(":").map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return null;

  if (parts.length === 3) { // HH:MM:SS
    const [h, m, s] = parts;
    if (m > 59 || s > 59) return null;
    return h * 3600 + m * 60 + s;
  }
  
  if (parts.length === 2) { // MM:SS
    const [m, s] = parts;
    if (s > 59) return null;
    return m * 60 + s;
  }

  if (parts.length === 1) { // SS
    return parts[0];
  }

  return null;
};

export const getTimeRemaining = (project: Project, planType: string = 'free') => {
  let expires: number;
  
  if (project.expires_at) {
    expires = new Date(project.expires_at).getTime();
  } else {
    const created = new Date(project.created_at).getTime();
    const windowDays = planType === 'pro' ? 60 : 7;
    expires = created + (windowDays * 24 * 60 * 60 * 1000);
  }

  const now = new Date().getTime();
  const diff = expires - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
};

export const getDeletionRemaining = (project: Project, planType: string = 'free') => {
  let deletionTime: number;
  
  if (project.expires_at) {
    // If manually extended, deletion happens 7 (Free) or 30 (Pro) days after the extension expires
    const extensionExpiry = new Date(project.expires_at).getTime();
    const gracePeriod = planType === 'pro' ? 30 : 7;
    deletionTime = extensionExpiry + (gracePeriod * 24 * 60 * 60 * 1000);
  } else {
    const created = new Date(project.created_at).getTime();
    const deletionDays = planType === 'pro' ? 90 : 14;
    deletionTime = created + (deletionDays * 24 * 60 * 60 * 1000);
  }
  
  const now = new Date().getTime();
  const diff = deletionTime - now;

  if (diff <= 0) return { days: 0, expired: true };
  return { days: Math.floor(diff / (1000 * 60 * 60 * 24)), expired: false };
};

export const isProjectLocked = (project: Project, planType: string) => {
  if (project.expires_at) {
    return new Date() > new Date(project.expires_at);
  }

  const created = parseISO(project.created_at);
  const now = new Date();
  const daysOld = differenceInDays(now, created);
  
  if (planType === 'free') {
    return daysOld > 7;
  }
  
  return daysOld > 60;
};

/**
 * Returns true if the project has exceeded its deletion grace period.
 */
export const isProjectDeleted = (project: Project, planType: string) => {
  const status = getDeletionRemaining(project, planType);
  return status.expired;
};

export const getRenewalStatus = (subscription: any) => {
  if (!subscription) return null;
  
  // Prioritize manual expiry if set, then use next_billing_date
  const targetDateStr = subscription.manual_expiry || subscription.next_billing_date;
  if (!targetDateStr) return null;

  const targetDate = parseISO(targetDateStr);
  const now = new Date();
  const daysUntil = differenceInDays(targetDate, now);
  const hoursUntil = differenceInHours(targetDate, now);
  
  if (hoursUntil <= 0) return "expired";
  if (hoursUntil <= 24) return `h-${hoursUntil}`;
  if (daysUntil <= 1) return "1d";
  if (daysUntil <= 2) return "2d";
  if (daysUntil <= 3) return "3d";
  
  return null;
};