import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const signature = req.headers.get('x-signature')
    const secret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET')

    if (!signature || !secret) {
      console.error('[lemon-squeezy-webhook] Missing signature or secret')
      return new Response('Missing signature or secret', { status: 401 })
    }

    const body = await req.text()
    
    // Verify signature
    const hmac = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    const verified = await crypto.subtle.verify(
      'HMAC',
      hmac,
      hexToUint8Array(signature),
      new TextEncoder().encode(body)
    )

    if (!verified) {
      console.error('[lemon-squeezy-webhook] Invalid signature')
      return new Response('Invalid signature', { status: 401 })
    }

    const payload = JSON.parse(body)
    const eventName = payload.meta.event_name
    const data = payload.data

    console.log(`[lemon-squeezy-webhook] Received event: ${eventName}`)

    const userId = payload.meta.custom_data?.user_id

    if (!userId) {
      console.error('[lemon-squeezy-webhook] No user_id in custom_data')
      return new Response('No user_id', { status: 400 })
    }

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const attributes = data.attributes

      // Update subscriptions table
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          lemon_squeezy_id: data.id,
          order_id: attributes.order_id?.toString(),
          customer_id: attributes.customer_id?.toString(),
          variant_id: attributes.variant_id?.toString(),
          status: attributes.status,
          renews_at: attributes.renews_at,
          ends_at: attributes.ends_at,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'lemon_squeezy_id' })

      if (subError) {
        console.error('[lemon-squeezy-webhook] Error updating subscription:', subError)
        throw subError
      }

      // Update profile plan_type
      const planType = attributes.status === 'active' ? 'pro' : 'free'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          plan_type: planType,
          subscription_id: data.id
        })
        .eq('id', userId)

      if (profileError) {
        console.error('[lemon-squeezy-webhook] Error updating profile:', profileError)
        throw profileError
      }
    }

    if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
       await supabase
        .from('profiles')
        .update({ plan_type: 'free' })
        .eq('id', userId)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[lemon-squeezy-webhook] Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

function hexToUint8Array(hex: string) {
  const view = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return view
}
