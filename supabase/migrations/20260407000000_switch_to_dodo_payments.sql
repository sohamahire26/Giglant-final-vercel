-- Rename Lemon Squeezy columns to Dodo Payments
ALTER TABLE public.subscriptions RENAME COLUMN lemon_squeezy_id TO dodo_subscription_id;
ALTER TABLE public.subscriptions RENAME COLUMN variant_id TO product_id;

-- Ensure RLS is still correct (it should be as it's based on user_id)