import { supabase } from "@/integrations/supabase/client";

/**
 * API client for edge functions (blog only).
 * Project CRUD uses Supabase client directly.
 */

const getApiBase = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  if (supabaseUrl) return `${supabaseUrl}/functions/v1`;

  const projectId = "ldizmpaqlkqmmvcjkvwb"; // Hardcoded project ID for reliability
  return `https://${projectId}.supabase.co/functions/v1`;
};

const apiCall = async (endpoint: string, body?: any) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkaXptcGFxbGtxbW12Y2prdndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjkzMDIsImV4cCI6MjA5MTA0NTMwMn0.hLk05spyjrzAZa2sHQabfC8yCKhHVTMLWZTJxNHumHM";
  headers["apikey"] = apikey;

  // Add Authorization header if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${getApiBase()}/${endpoint}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({ error: "Request failed" }));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

/* ── Blog ── */

export const getBlogPosts = (category?: string) =>
  apiCall("api", { action: "get_blog_posts", category });

export const getAdminPosts = () => 
  apiCall("api", { action: "get_admin_posts" });

export const getBlogPost = (category: string, slug: string) =>
  apiCall("api", { action: "get_blog_post", category, slug });

export const getBlogPostById = (id: string) =>
  apiCall("api", { action: "get_blog_post_by_id", id });

export const saveBlogPost = (post: any) =>
  apiCall("api", { action: "save_blog_post", post });

export const deleteBlogPost = (id: string) => 
  apiCall("api", { action: "delete_blog_post", id });

export const optimizeBlogSEO = (title: string, content: string) =>
  apiCall("api", { action: "optimize_blog_seo", title, content });