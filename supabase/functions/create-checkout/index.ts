import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("[create-checkout] Starting checkout process...");

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('DODO_PAYMENTS_API_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[create-checkout] Missing Supabase environment variables");
      throw new Error('Server configuration error: Missing Supabase keys');
    }

    if (!apiKey) {
      console.error("[create-checkout] Missing DODO_PAYMENTS_API_KEY secret");
      throw new Error('Missing Dodo Payments API Key. Please add it to Supabase Secrets.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify User Session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("[create-checkout] No Authorization header provided");
      throw new Error('Unauthorized: No session found');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("[create-checkout] Auth verification failed:", authError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse Request Body
    const body = await req.json().catch(() => ({}));
    const { productId } = body;

    if (!productId) {
      console.error("[create-checkout] No productId provided in request body");
      throw new Error('Product ID is required');
    }

    console.log(`[create-checkout] Creating checkout for user ${user.id} and product ${productId}`);

    // Call Dodo Payments API
    const response = await fetch('https://api.dodopayments.com/v1/checkouts', {
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
        metadata:{
          user_id: user.id
        },
        return_url: `${req.headers.get('origin') || 'https://giglant.com'}/dashboard?payment=success`
      })
    });

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})