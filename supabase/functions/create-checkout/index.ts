import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper for retrying fetch requests on network/DNS errors
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      const isNetworkError = err instanceof TypeError || err.message?.includes('dns') || err.message?.includes('Connect');
      if (isNetworkError && i < retries - 1) {
        console.warn(`[create-checkout] Network/DNS error on attempt ${i + 1}. Retrying in ${backoff}ms...`, err.message);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2; // Exponential backoff
        continue;
      }
      throw err;
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("[create-checkout] Starting checkout process...");

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('DODO_PAYMENTS_API_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Server configuration error: Missing Supabase keys');
    }

    if (!apiKey) {
      throw new Error('Missing DODO_PAYMENTS_API_KEY secret. Please add it to Supabase Secrets.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: No session found');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
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

    console.log(`[create-checkout] Creating checkout for user ${user.id} andproduct ${productId}`);

    // Use the retry helper to handle transient DNS/Connection issues
    const response = await fetchWithRetry('https://api.dodopayments.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
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

    if (!response) throw new Error("Failed to connect to payment provider after multiple attempts.");

    const result = await response.json();

    if (!response.ok) {
      console.error("[create-checkout] Dodo API Error:", result);
      return new Response(JSON.stringify({ 
        error: 'Dodo Payments Error', 
        details: result.message || result.error || 'Unknown error from payment provider' 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("[create-checkout] Checkout created successfully:", result.url);
    return new Response(JSON.stringify({ url: result.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("[create-checkout] Critical Error:", error.message);
    
    // Provide a more user-friendly message for DNS/Connection errors
    let userMessage = error.message;
    if (error.message?.includes('dns') || error.message?.includes('Connect')) {
      userMessage = "The payment provider is currently unreachable. Please try again in a few moments.";
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})