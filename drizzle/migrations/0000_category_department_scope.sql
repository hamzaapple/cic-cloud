ALTER TABLE public.material_categories
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_material_categories_department ON public.material_categories(department_id);