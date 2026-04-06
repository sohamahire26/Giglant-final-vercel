import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ||
      Deno.env.get("SUPABASE_ANON_KEY")?.trim();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Database not configured.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { action } = body;

    switch (action) {
      /* ── Blog ── */
      case "get_blog_posts": {
        let query = supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });
        if (body.category) query = query.eq("category", body.category);
        const { data, error } = await query;
        if (error) throw error;
        return json(data || []);
      }

      case "get_blog_post": {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("category", body.category)
          .eq("slug", body.slug)
          .eq("published", true)
          .single();
        if (error) throw error;
        return json(data);
      }

      case "get_blog_post_by_id": {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", body.id)
          .single();
        if (error) throw error;
        return json(data);
      }

      case "save_blog_post": {
        const adminKey = Deno.env.get("ADMIN_KEY");
        if (adminKey && body.admin_key !== adminKey) {
          return json({ error: "Unauthorized — invalid admin key" }, 401);
        }
        const { post } = body;
        let result;
        if (post.id) {
          const { id, ...updateData } = post;
          result = await supabase.from("blog_posts").update(updateData).eq("id", id).select().single();
        } else {
          result = await supabase.from("blog_posts").insert(post).select().single();
        }
        if (result.error) throw result.error;
        return json(result.data);
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err: any) {
    return json({ error: err.message || "Internal error" }, 400);
  }
});
