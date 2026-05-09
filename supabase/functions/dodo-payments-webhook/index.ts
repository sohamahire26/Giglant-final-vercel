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

    const body = await req.json()
    const eventType = body.type
    const data = body.data
    const userId = data.metadata?.user_id

    console.log(`[dodo-payments-webhook] Received ${eventType} for user ${userId}`);

    if (!userId) {
      return new Response('Missing user_id', { status: 400 })
    }

    if (
      eventType === 'subscription.created' || 
      eventType === 'subscription.updated' || 
      eventType === 'subscription.active'
    ) {
      // Upsert subscription record
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        dodo_subscription_id: data.subscription_id,
        product_id: data.product_id,
        status: data.status,
        renews_at: data.next_billing_date,
        ends_at: data.period_end,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'dodo_subscription_id' })

      // Update profile to Pro
      const isActive = data.status === 'active';
      await supabase.from('profiles')
        .update({ 
          plan_type: isActive ? 'pro' : 'free',
          subscription_id: data.subscription_id
        })
        .eq('id', userId)
    }

    if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired') {
      await supabase.from('profiles')
        .update({ plan_type: 'free' })
        .eq('id', userId)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('[dodo-payments-webhook] Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})