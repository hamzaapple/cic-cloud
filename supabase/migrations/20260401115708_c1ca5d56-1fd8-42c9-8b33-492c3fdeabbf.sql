
-- Create departments table
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read departments" ON public.departments FOR SELECT TO public USING (true);
CREATE POLICY "Owner can insert departments" ON public.departments FOR INSERT TO authenticated WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner');
CREATE POLICY "Owner can update departments" ON public.departments FOR UPDATE TO authenticated USING (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner');
CREATE POLICY "Owner can delete departments" ON public.departments FOR DELETE TO authenticated USING (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner');

-- Create material_categories table
CREATE TABLE public.material_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.material_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON public.material_categories FOR SELECT TO public USING (true);
CREATE POLICY "Admin can insert categories" ON public.material_categories FOR INSERT TO authenticated WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text]));
CREATE POLICY "Admin can update categories" ON public.material_categories FOR UPDATE TO authenticated USING (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text]));
CREATE POLICY "Admin can delete categories" ON public.material_categories FOR DELETE TO authenticated USING (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text]));

-- Seed default departments
INSERT INTO public.departments (name_ar, name_en) VALUES
  ('علوم الحاسب', 'CS'),
  ('الذكاء الاصطناعي والأمن السيبراني', 'AI, Cyber');

-- Seed default material categories (matching existing tab types)
INSERT INTO public.material_categories (name_ar, name_en) VALUES
  ('المحاضرات', 'Lectures'),
  ('السكاشن', 'Sections'),
  ('مصادر خارجية', 'External Resources'),
  ('التكليفات', 'Assignments');

-- Add department_id to courses
ALTER TABLE public.courses ADD COLUMN department_id uuid REFERENCES public.departments(id);
-- Assign all existing courses to CS department
UPDATE public.courses SET department_id = (SELECT id FROM public.departments WHERE name_en = 'CS' LIMIT 1);

-- Add department_id to moderators (nullable = can access all if null/owner)
ALTER TABLE public.moderators ADD COLUMN department_id uuid REFERENCES public.departments(id);

-- Add category_id to materials
ALTER TABLE public.materials ADD COLUMN category_id uuid REFERENCES public.material_categories(id);

-- Migrate existing materials to use category_id
UPDATE public.materials SET category_id = (SELECT id FROM public.material_categories WHERE name_en = 'Lectures' LIMIT 1) WHERE type = 'lecture' AND is_assignment = false;
UPDATE public.materials SET category_id = (SELECT id FROM public.material_categories WHERE name_en = 'Sections' LIMIT 1) WHERE type = 'section' AND is_assignment = false;
UPDATE public.materials SET category_id = (SELECT id FROM public.material_categories WHERE name_en = 'External Resources' LIMIT 1) WHERE type = 'resource' AND is_assignment = false;
UPDATE public.materials SET category_id = (SELECT id FROM public.material_categories WHERE name_en = 'Assignments' LIMIT 1) WHERE is_assignment = true;

-- Enable realtime for departments and categories
ALTER PUBLICATION supabase_realtime ADD TABLE public.departments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.material_categories;
