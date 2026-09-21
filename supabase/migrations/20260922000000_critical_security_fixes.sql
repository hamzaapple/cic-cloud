-- ═══════════════════════════════════════════════════════════════
-- CRITICAL Security Fix: Lock down RLS Policies
-- Replaces all permissive WITH CHECK (true) / USING (true)
-- with role-based access using JWT app_metadata
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════
-- 1. COURSES — restrict write to admins
-- ═══════════════════════════════════════
DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;

CREATE POLICY "Admin can insert courses"
ON public.courses FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator'));

CREATE POLICY "Admin can update courses"
ON public.courses FOR UPDATE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator'));

CREATE POLICY "Admin can delete courses"
ON public.courses FOR DELETE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'owner');


-- ═══════════════════════════════════════
-- 2. MATERIALS — restrict write to admins
-- ═══════════════════════════════════════
DROP POLICY IF EXISTS "Admins can insert materials" ON public.materials;
DROP POLICY IF EXISTS "Admins can update materials" ON public.materials;
DROP POLICY IF EXISTS "Admins can delete materials" ON public.materials;

CREATE POLICY "Admin can insert materials"
ON public.materials FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator'));

CREATE POLICY "Admin can update materials"
ON public.materials FOR UPDATE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator'));

CREATE POLICY "Admin can delete materials"
ON public.materials FOR DELETE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator'));


-- ═══════════════════════════════════════
-- 3. IMPORTANT_LINKS — restrict write to admins
-- ═══════════════════════════════════════
DROP POLICY IF EXISTS "Admins can insert links" ON public.important_links;
DROP POLICY IF EXISTS "Admins can update links" ON public.important_links;
DROP POLICY IF EXISTS "Admins can delete links" ON public.important_links;

CREATE POLICY "Admin can insert links"
ON public.important_links FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator'));

CREATE POLICY "Admin can update links"
ON public.important_links FOR UPDATE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator'));

CREATE POLICY "Admin can delete links"
ON public.important_links FOR DELETE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator'));


-- ═══════════════════════════════════════
-- 4. MODERATORS — owner-only access
-- ═══════════════════════════════════════
DROP POLICY IF EXISTS "Admins can insert moderators" ON public.moderators;
DROP POLICY IF EXISTS "Admins can update moderators" ON public.moderators;
DROP POLICY IF EXISTS "Admins can delete moderators" ON public.moderators;
DROP POLICY IF EXISTS "Admins can read moderators" ON public.moderators;

CREATE POLICY "Owner can read moderators"
ON public.moderators FOR SELECT TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'owner');

CREATE POLICY "Owner can insert moderators"
ON public.moderators FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'owner');

CREATE POLICY "Owner can update moderators"
ON public.moderators FOR UPDATE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'owner');

CREATE POLICY "Owner can delete moderators"
ON public.moderators FOR DELETE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'owner');


-- ═══════════════════════════════════════
-- 5. STORAGE — ensure old permissive upload policy is gone
-- ═══════════════════════════════════════
DROP POLICY IF EXISTS "Anyone can upload material files" ON storage.objects;


-- ═══════════════════════════════════════
-- 6. Remove plain_password column
-- ═══════════════════════════════════════
ALTER TABLE public.moderators DROP COLUMN IF EXISTS plain_password;

-- Fix the trigger to stop saving plain passwords
CREATE OR REPLACE FUNCTION public.hash_moderator_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  -- Only hash if not already hashed (bcrypt format check)
  IF NEW.password NOT LIKE '$2a$%' AND NEW.password NOT LIKE '$2b$%' THEN
    NEW.password := crypt(NEW.password, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

-- Revoke direct execution of the trigger function
REVOKE EXECUTE ON FUNCTION public.hash_moderator_password() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.hash_moderator_password() FROM anon;
REVOKE EXECUTE ON FUNCTION public.hash_moderator_password() FROM authenticated;
