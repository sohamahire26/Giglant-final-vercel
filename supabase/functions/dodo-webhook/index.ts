import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
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
    const userId = data.metadata?.supabase_user_id

    console.log(`[dodo-webhook] Received ${eventType} for user ${userId}`);

    if (!userId) {
      console.error("[dodo-webhook] Missing supabase_user_id in metadata");
      return new Response('Missing supabase_user_id in metadata', { status: 400 })
    }

    // Logic for successful subscription (Active or Renewed)
    if (eventType === 'subscription.active' || eventType === 'subscription.renewed') {
      console.log(`[dodo-webhook] Activating subscription for user: ${userId}`);
      
      // Update or Insert into subscriptions table
      const { error: subError } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        dodo_subscription_id: data.subscription_id,
        status: data.status,
        next_billing_date: data.next_billing_date,
        customer_email: data.customer?.email
      }, { onConflict: 'dodo_subscription_id' });

      if (subError) throw subError;

      // Update user profile to Pro
      const { error: profileError } = await supabase.from('profiles')
        .update({ 
          plan_type: 'pro',
          subscription_id: data.subscription_id
        })
        .eq('id', userId);

      if (profileError) throw profileError;
    }

    // Logic for ending subscription (Cancelled, Expired, or Failed)
    if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired' || eventType === 'subscription.failed') {
      console.log(`[dodo-webhook] Deactivating subscription for user: ${userId}`);
      
      // Downgrade user profile to Free
      const { error: profileError } = await supabase.from('profiles')
        .update({ plan_type: 'free' })
        .eq('id', userId);

      if (profileError) throw profileError;
        
      // Update status in subscriptions table
      const { error: subError } = await supabase.from('subscriptions')
        .update({ status: data.status })
        .eq('dodo_subscription_id', data.subscription_id);

      if (subError) throw subError;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('[dodo-webhook] Error processing webhook:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})