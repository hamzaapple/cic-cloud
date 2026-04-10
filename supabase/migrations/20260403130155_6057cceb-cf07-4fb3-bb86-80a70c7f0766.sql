
-- Add department_id to important_links
ALTER TABLE public.important_links ADD COLUMN department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL DEFAULT NULL;

-- Create moderator_course_access table for cross-department access
CREATE TABLE public.moderator_course_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid NOT NULL REFERENCES public.moderators(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(moderator_id, course_id)
);

ALTER TABLE public.moderator_course_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage course access"
  ON public.moderator_course_access
  FOR ALL
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text)
  WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text);

CREATE POLICY "Authenticated can read own course access"
  ON public.moderator_course_access
  FOR SELECT
  TO authenticated
  USING (true);
