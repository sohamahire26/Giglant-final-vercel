-- Video Reviews table (for Timestamp Feedback Tool)
CREATE TABLE public.video_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  video_url text NOT NULL,
  video_filename text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view video reviews" ON public.video_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can create video reviews" ON public.video_reviews FOR INSERT WITH CHECK (true);

-- Review Comments table
CREATE TABLE public.review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES public.video_reviews(id) ON DELETE CASCADE NOT NULL,
  timestamp_seconds float NOT NULL DEFAULT 0,
  comment text NOT NULL,
  author_name text DEFAULT 'Client',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.review_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can add comments" ON public.review_comments FOR INSERT WITH CHECK (true);

-- Blog Posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  category text NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  cover_image_url text,
  published boolean DEFAULT false,
  meta_title text,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Anyone can create posts" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update posts" ON public.blog_posts FOR UPDATE USING (true);

CREATE UNIQUE INDEX blog_posts_category_slug ON public.blog_posts(category, slug);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for review videos (500MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('review-videos', 'review-videos', true, 524288000);

CREATE POLICY "Anyone can upload review videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'review-videos');

CREATE POLICY "Anyone can view review videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-videos');