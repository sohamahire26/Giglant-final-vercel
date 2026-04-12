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
    console.log("[create-checkout] Request received");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Initialize client with the user's own auth header
    // This allows us to use supabase.auth.getUser() reliably
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the user from the token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("[create-checkout] Auth error:", authError?.message);
      return new Response(JSON.stringify({ error: 'Authentication failed', details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("[create-checkout] Authenticated user:", user.email);

    const { variantId, storeId } = await req.json();
    const apiKey = Deno.env.get('LEMON_SQUEEZY_API_KEY');

    if (!apiKey) {
      throw new Error('Lemon Squeezy API key not configured in Supabase secrets');
    }

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom: {
                user_id: user.id
              },
              email: user.email
            },
            // Redirect back to dashboard after successful payment
            product_options: {
              redirect_url: `${req.headers.get('origin')}/dashboard?payment=success`,
            }
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId.toString()
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId.toString()
              }
            }
          }
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[create-checkout] Lemon Squeezy error:", result);
      return new Response(JSON.stringify(result), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ url: result.data.attributes.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[create-checkout] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})