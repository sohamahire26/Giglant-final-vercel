import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OWNER_EMAIL = "sohamahire26@gmail.com";

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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Database not configured.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get('Authorization');
    let userEmail = null;
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (!userError && user) {
        userEmail = user.email.toLowerCase();
        userId = user.id;
      }
    }

    const body = await req.json();
    const { action } = body;

    const isOwner = userEmail === OWNER_EMAIL.toLowerCase();

    switch (action) {
      case "get_admin_support_messages": {
        if (!isOwner) return json({ error: "Unauthorized" }, 401);
        const { data, error } = await supabase
          .from("support_messages")
          .select("*, profiles(*)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return json(data || []);
      }

      case "update_support_message": {
        const { id, updates } = body;
        // Verify permission: Only Owner or the message creator can update
        if (!isOwner) {
          const { data: msg } = await supabase.from("support_messages").select("user_id").eq("id", id).single();
          if (msg?.user_id !== userId) return json({ error: "Unauthorized" }, 401);
        }
        
        const { data, error } = await supabase
          .from("support_messages")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
          
        if (error) throw error;
        return json(data);
      }

      case "delete_support_message": {
        const { id } = body;
        if (!isOwner) {
          const { data: msg } = await supabase.from("support_messages").select("user_id").eq("id", id).single();
          if (msg?.user_id !== userId) return json({ error: "Unauthorized" }, 401);
        }
        
        const { error } = await supabase.from("support_messages").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }

      case "get_blog_posts": {
        let query = supabase.from("blog_posts").select("*").eq("published", true).order("created_at", { ascending: false });
        if (body.category) query = query.eq("category", body.category);
        const { data, error } = await query;
        if (error) throw error;
        return json(data || []);
      }

      case "get_blog_post": {
        const { data, error } = await supabase.from("blog_posts").select("*").eq("category", body.category).eq("slug", body.slug).eq("published", true).single();
        if (error) throw error;
        return json(data);
      }

      case "save_blog_post": {
        if (!isOwner) return json({ error: "Unauthorized" }, 401);
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

      case "delete_blog_post": {
        if (!isOwner) return json({ error: "Unauthorized" }, 401);
        const { id } = body;
        const { error } = await supabase.from("blog_posts").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err: any) {
    console.error("[api-function] Error:", err);
    return json({ error: err.message || "Internal error" }, 400);
  }
});