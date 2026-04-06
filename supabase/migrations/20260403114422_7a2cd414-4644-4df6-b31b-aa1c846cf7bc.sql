CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  share_token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  telegram_file_id TEXT NOT NULL,
  telegram_message_id BIGINT,
  video_filename TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS share_token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', '');
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS telegram_file_id TEXT;
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS telegram_message_id BIGINT;
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS video_filename TEXT;
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days');
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS videos_share_token_key ON public.videos (share_token);
CREATE INDEX IF NOT EXISTS idx_videos_expires_at ON public.videos (expires_at);

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  timestamp_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
  comment TEXT NOT NULL,
  author_name TEXT DEFAULT 'Client',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE;
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS timestamp_seconds DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Client';
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_feedback_video_time ON public.feedback (video_id, timestamp_seconds, created_at);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create videos" ON public.videos;
DROP POLICY IF EXISTS "Anyone can view videos" ON public.videos;
DROP POLICY IF EXISTS "Anyone can create feedback" ON public.feedback;
DROP POLICY IF EXISTS "Anyone can view feedback" ON public.feedback;

CREATE POLICY "Anyone can create videos"
ON public.videos
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view videos"
ON public.videos
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can create feedback"
ON public.feedback
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view feedback"
ON public.feedback
FOR SELECT
TO public
USING (true);