import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`[dodo-payments-webhook] Received request: ${req.method}`);

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

    console.log(`[dodo-payments-webhook] Event Type: ${eventType}`, { 
      subscription_id: data?.subscription_id,
      status: data?.status,
      user_id: data?.metadata?.user_id 
    });

    const userId = data.metadata?.user_id

    if (!userId) {
      console.error("[dodo-payments-webhook] No user_id found in metadata. Data:", JSON.stringify(data));
      return new Response('No user_id', { status: 400 })
    }

    // Handle subscription status changes
    if (
      eventType === 'subscription.created' || 
      eventType === 'subscription.updated' || 
      eventType === 'subscription.renewed' ||
      eventType === 'subscription.active'
    ) {
      console.log(`[dodo-payments-webhook] Processing active/updated subscription for user: ${userId}`);
      
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          dodo_subscription_id: data.subscription_id,
          product_id: data.product_id,
          status: data.status,
          renews_at: data.next_billing_date,
          ends_at: data.period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'dodo_subscription_id' })

      if (subError) {
        console.error("[dodo-payments-webhook] Subscription upsert error:", subError);
        throw subError;
      }

      const planType = (data.status === 'active' || data.status === 'renewed') ? 'pro' : 'free'
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          plan_type: planType,
          subscription_id: data.subscription_id
        })
        .eq('id', userId)

      if (profileError) {
        console.error("[dodo-payments-webhook] Profile update error:", profileError);
        throw profileError;
      }
      
      console.log(`[dodo-payments-webhook] Successfully updated user ${userId} to ${planType}`)
    }

    if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired') {
       console.log(`[dodo-payments-webhook] Processing cancellation/expiry for user: ${userId}`);
       const { error } = await supabase
        .from('profiles')
        .update({ plan_type: 'free' })
        .eq('id', userId)
       
       if (error) console.error("[dodo-payments-webhook] Expiry update error:", error);
       console.log(`[dodo-payments-webhook] Subscription ${eventType} for user ${userId}. Set to free.`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('[dodo-payments-webhook] Critical Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})