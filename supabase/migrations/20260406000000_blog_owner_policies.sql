-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read published blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow service role full access to blog_posts" ON public.blog_posts;

-- Public read for published posts
CREATE POLICY "Allow public read published blog_posts" ON public.blog_posts
FOR SELECT USING (published = true);

-- Owner full access (INSERT, UPDATE, DELETE, SELECT all)
-- Restricting to the specific owner email
CREATE POLICY "Owner full access to blog_posts" ON public.blog_posts
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'Sohamahire26@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'Sohamahire26@gmail.com');