import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("[create-checkout] Function invoked");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const dodoApiKey = Deno.env.get('DODO_PAYMENTS_API_KEY')?.trim();

    if (!dodoApiKey) {
      console.error("[create-checkout] DODO_PAYMENTS_API_KEY is missing");
      throw new Error('DODO_PAYMENTS_API_KEY is not set in Supabase secrets.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("[create-checkout] Auth error:", authError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { productId } = await req.json();
    if (!productId) throw new Error('Product ID is required');

    console.log(`[create-checkout] Creating checkout for ${user.email} (Product: ${productId})`);

    const DODO_API_URL = 'https://test.dodopayments.com/checkouts';

    const response = await fetch(DODO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dodoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: productId,
            quantity: 1
          }
        ],
        customer: {
          email: user.email
        },
        metadata: {
          supabase_user_id: user.id
        },
        return_url: `${req.headers.get('origin') || 'https://giglant.com'}/dashboard?payment=success`
      })
    });

    const result = await response.json();
    console.log("[create-checkout] Dodo API Response:", JSON.stringify(result));

    if (!response.ok) {
      console.error("[create-checkout] Dodo API Error:", result);
      return new Response(JSON.stringify({ error: result.message || 'Payment provider error' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Dodo Payments returns 'checkout_url'
    const checkoutUrl = result.checkout_url || result.url;

    if (!checkoutUrl) {
      console.error("[create-checkout] No URL found in response:", result);
      throw new Error("Payment provider did not return a checkout URL.");
    }

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("[create-checkout] Catch Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})