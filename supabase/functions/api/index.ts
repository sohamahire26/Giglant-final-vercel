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
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (!userError && user) {
        userEmail = user.email;
      }
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
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

      case "get_all_blog_posts": {
        if (userEmail?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
          return json({ error: "Unauthorized" }, 401);
        }
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });
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
        if (userEmail?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
          return json({ error: "Unauthorized" }, 401);
        }
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", body.id)
          .single();
        if (error) throw error;
        return json(data);
      }

      case "save_blog_post": {
        if (userEmail?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
          return json({ error: "Unauthorized" }, 401);
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

      case "delete_blog_post": {
        if (userEmail?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
          return json({ error: "Unauthorized" }, 401);
        }
        const { id } = body;
        const { error } = await supabase.from("blog_posts").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }

      case "run_project_cleanup": {
        console.log("[api-function] Starting project and storage cleanup...");
        
        // 1. Identify projects past their deletion window
        // Free: 14 days, Pro: 90 days
        const { data: expiredProjects, error: fetchError } = await supabase
          .rpc('get_expired_projects_for_cleanup'); // We'll need to define this SQL function

        if (fetchError) throw fetchError;
        if (!expiredProjects || expiredProjects.length === 0) {
          return json({ success: true, message: "No expired projects found." });
        }

        const projectIds = expiredProjects.map((p: any) => p.id);
        console.log(`[api-function] Found ${projectIds.length} expired projects.`);

        // 2. Get all storage paths for files in these projects
        const { data: files, error: filesError } = await supabase
          .from('project_files')
          .select('storage_path')
          .in('project_id', projectIds);

        if (filesError) throw filesError;

        if (files && files.length > 0) {
          const paths = files.map(f => f.storage_path);
          console.log(`[api-function] Deleting ${paths.length} files from storage.`);
          
          // Delete files from storage in batches
          const { error: storageError } = await supabase.storage
            .from('project-files')
            .remove(paths);
            
          if (storageError) console.error("[api-function] Storage deletion error:", storageError);
        }

        // 3. Delete projects from DB (cascades to project_files and file_comments)
        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .in('id', projectIds);

        if (deleteError) throw deleteError;

        return json({ success: true, deleted_count: projectIds.length });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err: any) {
    console.error("[api-function] Error:", err);
    return json({ error: err.message || "Internal error" }, 400);
  }
});