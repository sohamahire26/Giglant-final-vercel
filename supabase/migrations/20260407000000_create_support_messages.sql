-- Ensure profiles has is_admin column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create support_messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feedback', 'contact')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'viewed')),
    admin_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    viewed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policies for users
DROP POLICY IF EXISTS "Users can insert their own support messages" ON public.support_messages;
CREATE POLICY "Users can insert their own support messages"
ON public.support_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own support messages" ON public.support_messages;
CREATE POLICY "Users can view their own support messages"
ON public.support_messages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policies for admin (Sohamahire26@gmail.com)
DROP POLICY IF EXISTS "Admin can view all support messages" ON public.support_messages;
CREATE POLICY "Admin can view all support messages"
ON public.support_messages FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = 'Sohamahire26@gmail.com'
);

DROP POLICY IF EXISTS "Admin can update all support messages" ON public.support_messages;
CREATE POLICY "Admin can update all support messages"
ON public.support_messages FOR UPDATE
TO authenticated
USING (
    auth.jwt() ->> 'email' = 'Sohamahire26@gmail.com'
);

DROP POLICY IF EXISTS "Admin can delete support messages" ON public.support_messages;
CREATE POLICY "Admin can delete support messages"
ON public.support_messages FOR DELETE
TO authenticated
USING (
    auth.jwt() ->> 'email' = 'Sohamahire26@gmail.com'
);

-- Grant access
GRANT ALL ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;