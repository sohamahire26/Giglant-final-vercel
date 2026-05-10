-- Allow public read access to profiles so that magic links can verify the owner's plan type
-- This ensures that Pro users' projects don't appear locked to their clients.
CREATE POLICY "profiles_public_read_policy" ON public.profiles
FOR SELECT USING (true);