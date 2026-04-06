/**
 * API client for edge functions (blog only).
 * Project CRUD uses Supabase client directly.
 */

const getApiBase = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  if (supabaseUrl) return `${supabaseUrl}/functions/v1`;

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  if (projectId) return `https://${projectId}.supabase.co/functions/v1`;

  throw new Error("API URL not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_PROJECT_ID.");
};

const apiCall = async (endpoint: string, body?: any) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (apikey) headers["apikey"] = apikey;

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

export const getBlogPost = (category: string, slug: string) =>
  apiCall("api", { action: "get_blog_post", category, slug });

export const getBlogPostById = (id: string) =>
  apiCall("api", { action: "get_blog_post_by_id", id });

export const saveBlogPost = (post: any, adminKey: string) =>
  apiCall("api", { action: "save_blog_post", post, admin_key: adminKey });
