import { supabase } from "@/integrations/supabase/client";

/**
 * API client for Giglant.
 * Most operations now use the Supabase client directly to avoid "Failed to fetch" 
 * errors caused by undeployed Edge Functions.
 */

/* ── Blog ── */

export const getBlogPosts = async (category?: string) => {
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  
  if (category) {
    query = query.eq("category", category);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getAllBlogPosts = async () => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getBlogPost = async (category: string, slug: string) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("category", category)
    .eq("slug", slug)
    .eq("published", true)
    .single();
  
  if (error) throw error;
  return data;
};

export const getBlogPostById = async (id: string) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
};

export const saveBlogPost = async (post: any) => {
  if (post.id) {
    const { id, ...updateData } = post;
    const { data, error } = await supabase
      .from("blog_posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert(post)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return { success: true };
};

/* ── Maintenance ── */

export const runProjectCleanup = async () => {
  // This still requires the Edge Function as it performs sensitive batch deletions
  const url = "https://ldizmpaqlkqmmvcjkvwb.supabase.co/functions/v1/api";
  const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": apikey,
    },
    body: JSON.stringify({ action: "run_project_cleanup" }),
  });

  if (!res.ok) throw new Error("Cleanup function failed or is not deployed.");
  return await res.json();
};