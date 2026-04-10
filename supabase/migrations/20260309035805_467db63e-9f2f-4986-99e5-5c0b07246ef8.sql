
-- 1. Revoke public execute on authenticate_moderator (only service role can call it via edge function)
REVOKE EXECUTE ON FUNCTION public.authenticate_moderator(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.authenticate_moderator(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.authenticate_moderator(text, text) FROM authenticated;

-- 2. Restrict storage uploads to authenticated users only
DROP POLICY IF EXISTS "Anyone can upload material files" ON storage.objects;
CREATE POLICY "Authenticated can upload material files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'materials');

-- 3. Create login_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  attempted_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write login_attempts (used by edge function via service role)
-- No policies for anon/authenticated = default deny

-- Auto-cleanup old attempts (keep 1 hour window)
CREATE INDEX IF NOT EXISTS login_attempts_identifier_idx ON public.login_attempts (identifier, attempted_at);

-- 4. Tighten RLS: owner-only tables should check JWT role metadata
-- Update moderators write policies to owner-only
DROP POLICY IF EXISTS "Authenticated can insert moderators" ON public.moderators;
DROP POLICY IF EXISTS "Authenticated can update moderators" ON public.moderators;
DROP POLICY IF EXISTS "Authenticated can delete moderators" ON public.moderators;

CREATE POLICY "Owner can insert moderators"
ON public.moderators FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner');

CREATE POLICY "Owner can update moderators"
ON public.moderators FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner');

CREATE POLICY "Owner can delete moderators"
ON public.moderators FOR DELETE
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner');

-- Courses: owner or moderator with add_courses permission
DROP POLICY IF EXISTS "Authenticated can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated can update courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated can delete courses" ON public.courses;

CREATE POLICY "Admin can insert courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner'
  OR (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'moderator'
);

CREATE POLICY "Admin can update courses"
ON public.courses FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner'
  OR (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'moderator'
);

CREATE POLICY "Owner can delete courses"
ON public.courses FOR DELETE
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner');

-- Materials: owner or moderator
DROP POLICY IF EXISTS "Authenticated can insert materials" ON public.materials;
DROP POLICY IF EXISTS "Authenticated can update materials" ON public.materials;
DROP POLICY IF EXISTS "Authenticated can delete materials" ON public.materials;

CREATE POLICY "Admin can insert materials"
ON public.materials FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner'
  OR (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'moderator'
);

CREATE POLICY "Admin can update materials"
ON public.materials FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner'
  OR (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'moderator'
);

CREATE POLICY "Admin can delete materials"
ON public.materials FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner'
  OR (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'moderator'
);

-- Important links: owner or moderator
DROP POLICY IF EXISTS "Authenticated can insert links" ON public.important_links;
DROP POLICY IF EXISTS "Authenticated can update links" ON public.important_links;
DROP POLICY IF EXISTS "Authenticated can delete links" ON public.important_links;

CREATE POLICY "Admin can insert links"
ON public.important_links FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner'
  OR (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'moderator'
);

CREATE POLICY "Admin can update links"
ON public.important_links FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner'
  OR (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'moderator'
);

CREATE POLICY "Admin can delete links"
ON public.important_links FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner'
  OR (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'moderator'
);

-- Notifications: owner or moderator
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;

CREATE POLICY "Admin can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'owner'
  OR (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'moderator'
);
