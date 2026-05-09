import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Aggressive retry logic for DNS/Network issues
async function fetchWithRetry(url: string, options: RequestInit, retries = 5): Promise<Response> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[create-checkout] Attempting request (Try ${i + 1}/${retries})...`);
      const response = await fetch(url, options);
      return response;
    } catch (err: any) {
      lastError = err;
      const isDnsOrNetworkError = 
        err.message?.toLowerCase().includes('dns') || 
        err.message?.toLowerCase().includes('connect') || 
        err.name === 'TypeError';
      
      if (isDnsOrNetworkError && i < retries - 1) {
        const delay = 1000 * (i + 1); // 1s, 2s, 3s...
        console.warn(`[create-checkout] Network/DNS error: ${err.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const rawApiKey = Deno.env.get('DODO_PAYMENTS_API_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey || !rawApiKey) {
      console.error("[create-checkout] Missing secrets", { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceRoleKey, 
        hasDodoKey: !!rawApiKey 
      });
      throw new Error('Server configuration error: Missing secrets in Supabase.');
    }

    // Sanitize the API key (remove any accidental whitespace)
    const apiKey = rawApiKey.trim();
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("[create-checkout] Auth failure:", authError);
      return new Response(JSON.stringify({ error: 'Auth failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json().catch(() => ({}));
    const { productId } = body;

    if (!productId) throw new Error('Product ID is required');

    console.log(`[create-checkout] Creating checkout for ${user.email} (Product: ${productId})`);

    const response = await fetchWithRetry('https://api.dodopayments.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        customer: { email: user.email },
        metadata: { user_id: user.id },
        return_url: `${req.headers.get('origin') || 'https://giglant.com'}/dashboard?payment=success`
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[create-checkout] Dodo API Error:", result);
      return new Response(JSON.stringify({ 
        error: 'Payment Provider Error', 
        details: result.message || result.error || 'Check your Dodo API Key status.' 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("[create-checkout] Checkout successful!");
    return new Response(JSON.stringify({ url: result.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("[create-checkout] Final Failure:", error.message);
    
    let userMessage = error.message;
    if (error.message?.toLowerCase().includes('dns') || error.message?.toLowerCase().includes('connect')) {
      userMessage = "The payment server is currently unreachable due to a network error in the server region. Please try again in 30 seconds.";
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})