CREATE TABLE public.shared_department_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL,
  target_department_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(course_id, target_department_id)
);

ALTER TABLE public.shared_department_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shared courses"
ON public.shared_department_courses
FOR SELECT
USING (true);

CREATE POLICY "Owner can manage shared courses"
ON public.shared_department_courses
FOR ALL
TO authenticated
USING (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text)
WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text);