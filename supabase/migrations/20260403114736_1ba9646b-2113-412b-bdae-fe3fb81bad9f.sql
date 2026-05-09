DROP POLICY IF EXISTS "Anyone can create videos" ON public.videos;
DROP POLICY IF EXISTS "Anyone can create feedback" ON public.feedback;

CREATE POLICY "Anyone can create videos"
ON public.videos
FOR INSERT
TO public
WITH CHECK (
  telegram_file_id IS NOT NULL
  AND char_length(btrim(telegram_file_id)) > 0
  AND share_token IS NOT NULL
  AND char_length(btrim(share_token)) >= 8
  AND char_length(title) <= 200
  AND (video_filename IS NULL OR char_length(btrim(video_filename)) > 0)
  AND expires_at > created_at
);

CREATE POLICY "Anyone can create feedback"
ON public.feedback
FOR INSERT
TO public
WITH CHECK (
  video_id IS NOT NULL
  AND timestamp_seconds >= 0
  AND comment IS NOT NULL
  AND char_length(btrim(comment)) BETWEEN 1 AND 2000
  AND (author_name IS NULL OR char_length(btrim(author_name)) BETWEEN 1 AND 80)
);