-- Add manual override for project locking
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.projects.expires_at IS 'Manual override for project expiration. If set, this date is used instead of the default 7/60 day logic.';

-- Add manual override for subscription duration (Pro Retiration)
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS manual_expiry TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.subscriptions.manual_expiry IS 'Manual override for subscription end date. If set, this date is used for Pro status checks and warnings.';