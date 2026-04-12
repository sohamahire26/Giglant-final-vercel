import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log("[create-checkout] Request received:", req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Get the user from the auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[create-checkout] No authorization header")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error("[create-checkout] Auth error or no user:", authError)
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const body = await req.json()
    const { variantId, storeId } = body
    console.log("[create-checkout] Payload:", { variantId, storeId, userId: user.id })

    if (!variantId || !storeId) {
      console.error("[create-checkout] Missing variantId or storeId")
      return new Response(JSON.stringify({ error: 'Missing variantId or storeId' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const apiKey = Deno.env.get('LEMON_SQUEEZY_API_KEY')
    if (!apiKey) {
      console.error("[create-checkout] LEMON_SQUEEZY_API_KEY not found in env")
      return new Response(JSON.stringify({ error: 'Lemon Squeezy API key not configured' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log("[create-checkout] Calling Lemon Squeezy API...")
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: {
              checkout_data: {
                custom: {
                  user_id: user.id
                },
                email: user.email
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
      })

      clearTimeout(timeoutId)
      const checkoutData = await response.json()

      if (!response.ok) {
        console.error('[create-checkout] Lemon Squeezy error response:', checkoutData)
        return new Response(JSON.stringify(checkoutData), { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      console.log("[create-checkout] Checkout created successfully")
      return new Response(JSON.stringify({ url: checkoutData.data.attributes.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error("[create-checkout] Lemon Squeezy API request timed out")
        return new Response(JSON.stringify({ error: 'Lemon Squeezy API request timed out' }), { 
          status: 504, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      throw fetchError
    }
  } catch (error) {
    console.error('[create-checkout] Catch block error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
