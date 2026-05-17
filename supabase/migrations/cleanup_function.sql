CREATE OR REPLACE FUNCTION public.get_expired_projects_for_cleanup()
RETURNS SETOF projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.projects p
  JOIN public.profiles prof ON p.user_id = prof.id
  WHERE 
    -- Free projects: Delete after 14 days
    (prof.plan_type = 'free' AND p.created_at < NOW() - INTERVAL '14 days' AND p.expires_at IS NULL)
    OR
    -- Pro projects: Delete after 90 days
    (prof.plan_type = 'pro' AND p.created_at < NOW() - INTERVAL '90 days' AND p.expires_at IS NULL)
    OR
    -- Manual extensions: Delete 7 (Free) or 30 (Pro) days after their specific expiry
    (p.expires_at IS NOT NULL AND (
      (prof.plan_type = 'free' AND p.expires_at < NOW() - INTERVAL '7 days') OR
      (prof.plan_type = 'pro' AND p.expires_at < NOW() - INTERVAL '30 days')
    ));
END;
$$;