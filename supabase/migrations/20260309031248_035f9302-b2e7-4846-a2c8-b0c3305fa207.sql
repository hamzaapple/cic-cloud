
-- Function to authenticate moderator with hashed password
CREATE OR REPLACE FUNCTION public.authenticate_moderator(p_username text, p_password text)
RETURNS TABLE(mod_id uuid, mod_display_name text, mod_permissions text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT id, display_name, permissions
  FROM moderators
  WHERE username = p_username
    AND password = crypt(p_password, password);
END;
$$;

-- Trigger to auto-hash passwords on insert/update
CREATE OR REPLACE FUNCTION public.hash_moderator_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.password NOT LIKE '$2a$%' AND NEW.password NOT LIKE '$2b$%' THEN
    NEW.password := crypt(NEW.password, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER hash_password_trigger
BEFORE INSERT OR UPDATE ON public.moderators
FOR EACH ROW EXECUTE FUNCTION public.hash_moderator_password();

-- Hash existing plaintext passwords
UPDATE public.moderators SET password = crypt(password, gen_salt('bf'))
WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%';

-- Fix COURSES RLS: keep public read, restrict writes to authenticated
DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
CREATE POLICY "Authenticated can insert courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update courses" ON public.courses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete courses" ON public.courses FOR DELETE TO authenticated USING (true);

-- Fix MATERIALS RLS
DROP POLICY IF EXISTS "Admins can insert materials" ON public.materials;
DROP POLICY IF EXISTS "Admins can update materials" ON public.materials;
DROP POLICY IF EXISTS "Admins can delete materials" ON public.materials;
CREATE POLICY "Authenticated can insert materials" ON public.materials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update materials" ON public.materials FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete materials" ON public.materials FOR DELETE TO authenticated USING (true);

-- Fix IMPORTANT_LINKS RLS
DROP POLICY IF EXISTS "Admins can insert links" ON public.important_links;
DROP POLICY IF EXISTS "Admins can update links" ON public.important_links;
DROP POLICY IF EXISTS "Admins can delete links" ON public.important_links;
CREATE POLICY "Authenticated can insert links" ON public.important_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update links" ON public.important_links FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete links" ON public.important_links FOR DELETE TO authenticated USING (true);

-- Fix MODERATORS RLS: restrict ALL access to authenticated only
DROP POLICY IF EXISTS "Admins can read moderators" ON public.moderators;
DROP POLICY IF EXISTS "Admins can insert moderators" ON public.moderators;
DROP POLICY IF EXISTS "Admins can update moderators" ON public.moderators;
DROP POLICY IF EXISTS "Admins can delete moderators" ON public.moderators;
CREATE POLICY "Authenticated can read moderators" ON public.moderators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert moderators" ON public.moderators FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update moderators" ON public.moderators FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete moderators" ON public.moderators FOR DELETE TO authenticated USING (true);

-- Fix NOTIFICATIONS RLS: keep public read, restrict insert to authenticated
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
