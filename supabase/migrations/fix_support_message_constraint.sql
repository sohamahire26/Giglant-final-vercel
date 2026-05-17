-- Drop the existing constraint if it exists
ALTER TABLE public.support_messages DROP CONSTRAINT IF EXISTS support_message_type_check;

-- Add a broader constraint that includes 'other' and 'general'
ALTER TABLE public.support_messages ADD CONSTRAINT support_message_type_check CHECK (type IN ('bug', 'suggestion', 'other', 'general'));