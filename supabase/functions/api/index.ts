import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OWNER_EMAIL = "Sohamahire26@gmail.com";

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
    const groqApiKey = Deno.env.get("GROQ_API_KEY")?.trim();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Database not configured.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify JWT for sensitive actions
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
        // Only owner can see unpublished posts by ID
        if (userEmail !== OWNER_EMAIL) {
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
        if (userEmail !== OWNER_EMAIL) {
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

      case "optimize_blog_seo": {
        if (userEmail !== OWNER_EMAIL) {
          return json({ error: "Unauthorized" }, 401);
        }
        if (!groqApiKey) throw new Error("Groq API key not configured.");

        const { title, content } = body;
        const prompt = `You are an SEO expert for Giglant, a platform for video editors and freelancers. 
        Analyze the following blog post and provide:
        1. A compelling Meta Title (max 60 chars)
        2. A high-converting Meta Description (max 160 chars)
        3. A concise Excerpt (max 200 chars)
        
        Return ONLY a JSON object with keys: meta_title, meta_description, excerpt.
        
        Title: ${title}
        Content: ${content.substring(0, 2000)}`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          }),
        });

        const groqData = await groqRes.json();
        const seo = JSON.parse(groqData.choices[0].message.content);
        return json(seo);
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err: any) {
    console.error("[api-function] Error:", err);
    return json({ error: err.message || "Internal error" }, 400);
  }
});