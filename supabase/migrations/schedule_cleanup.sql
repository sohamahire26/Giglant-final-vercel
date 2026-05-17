-- 1. Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the cleanup task to run at 00:00 (Midnight) every day
-- Replace 'YOUR_PROJECT_REF' with your actual project ID (ldizmpaqlkqmmvcjkvwb)
-- Replace 'YOUR_SERVICE_ROLE_KEY' with your service role key from settings
SELECT cron.schedule(
  'nightly-project-cleanup',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://ldizmpaqlkqmmvcjkvwb.supabase.co/functions/v1/api',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}',
      body:='{"action": "run_project_cleanup"}'
    );
  $$
);