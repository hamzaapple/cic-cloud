-- ═══════════════════════════════════════════════════════════════
-- Add plain_password column to moderators table
-- Allows the owner to view moderator passwords
-- The hashed 'password' column is still used for authentication
-- ═══════════════════════════════════════════════════════════════

-- 1. Add plain_password column
ALTER TABLE public.moderators
ADD COLUMN IF NOT EXISTS plain_password TEXT;

-- 2. Update the hash trigger to also save the plain password
CREATE OR REPLACE FUNCTION public.hash_moderator_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  -- If password is not already hashed, save plain version and hash it
  IF NEW.password NOT LIKE '$2a$%' AND NEW.password NOT LIKE '$2b$%' THEN
    NEW.plain_password := NEW.password;
    NEW.password := crypt(NEW.password, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;
