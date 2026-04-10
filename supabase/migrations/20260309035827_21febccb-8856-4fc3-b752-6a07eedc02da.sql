
-- Fix: Use app_metadata instead of user_metadata (cannot be modified by users)

-- Moderators: owner-only
DROP POLICY IF EXISTS "Owner can insert moderators" ON public.moderators;
DROP POLICY IF EXISTS "Owner can update moderators" ON public.moderators;
DROP POLICY IF EXISTS "Owner can delete moderators" ON public.moderators;

CREATE POLICY "Owner can insert moderators"
ON public.moderators FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'owner');

CREATE POLICY "Owner can update moderators"
ON public.moderators FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'owner');

CREATE POLICY "Owner can delete moderators"
ON public.moderators FOR DELETE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'owner');

-- Courses
DROP POLICY IF EXISTS "Admin can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Admin can update courses" ON public.courses;
DROP POLICY IF EXISTS "Owner can delete courses" ON public.courses;

CREATE POLICY "Admin can insert courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator')
);

CREATE POLICY "Admin can update courses"
ON public.courses FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator')
);

CREATE POLICY "Owner can delete courses"
ON public.courses FOR DELETE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator'));

-- Materials
DROP POLICY IF EXISTS "Admin can insert materials" ON public.materials;
DROP POLICY IF EXISTS "Admin can update materials" ON public.materials;
DROP POLICY IF EXISTS "Admin can delete materials" ON public.materials;

CREATE POLICY "Admin can insert materials"
ON public.materials FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator')
);

CREATE POLICY "Admin can update materials"
ON public.materials FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator')
);

CREATE POLICY "Admin can delete materials"
ON public.materials FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator')
);

-- Important links
DROP POLICY IF EXISTS "Admin can insert links" ON public.important_links;
DROP POLICY IF EXISTS "Admin can update links" ON public.important_links;
DROP POLICY IF EXISTS "Admin can delete links" ON public.important_links;

CREATE POLICY "Admin can insert links"
ON public.important_links FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator')
);

CREATE POLICY "Admin can update links"
ON public.important_links FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator')
);

CREATE POLICY "Admin can delete links"
ON public.important_links FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator')
);

-- Notifications
DROP POLICY IF EXISTS "Admin can insert notifications" ON public.notifications;

CREATE POLICY "Admin can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'app_role') IN ('owner', 'moderator')
);
