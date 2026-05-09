import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper for retrying fetch requests in case of DNS/Network blips
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err: any) {
      const isNetworkError = err.message?.includes('dns') || err.message?.includes('Connect') || err.name === 'TypeError';
      if (isNetworkError && i < retries - 1) {
        console.log(`[create-checkout] Network/DNS error detected. Retrying... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1))); // Exponential backoff
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed after multiple retries");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("[create-checkout] Function invoked.");

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('DODO_PAYMENTS_API_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey || !apiKey) {
      console.error("[create-checkout] Missing environment variables", { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseServiceRoleKey, 
        hasApi: !!apiKey 
      });
      throw new Error('Server configuration error: Missing API keys in Supabase Secrets.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: No session found');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("[create-checkout] Auth error:", authError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json().catch(() => ({}));
    const { productId } = body;

    if (!productId) {
      throw new Error('Product ID is required');
    }

    console.log(`[create-checkout] Creating checkout for user: ${user.id}, product: ${productId}`);

    const response = await fetchWithRetry('https://api.dodopayments.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        customer: {
          email: user.email
        },
        metadata: {
          user_id: user.id
        },
        return_url: `${req.headers.get('origin') || 'https://giglant.com'}/dashboard?payment=success`
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[create-checkout] Dodo API Error:", result);
      return new Response(JSON.stringify({ 
        error: 'Payment Provider Error', 
        details: result.message || result.error || 'Unknown error' 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("[create-checkout] Success! URL:", result.url);
    return new Response(JSON.stringify({ url: result.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("[create-checkout] Critical Error:", error.message);
    
    let userMessage = error.message;
    if (error.message?.includes('dns') || error.message?.includes('Connect') || error.name === 'TypeError') {
      userMessage = "The payment server is temporarily unreachable. This is a network issue in the Edge Runtime. Please try again in a few seconds.";
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})