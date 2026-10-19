-- Migration: Add academic_year to material_categories, notes to courses, and notes & section_number to materials
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)

-- 1. Add academic_year to material_categories (NULL = general for all academic years)
ALTER TABLE public.material_categories
ADD COLUMN IF NOT EXISTS academic_year text DEFAULT NULL;

-- 2. Add notes to courses (for instructor/course notes with light background)
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;

-- 3. Add section_number and notes to materials (for dividing assignments by section and adding notes)
ALTER TABLE public.materials
ADD COLUMN IF NOT EXISTS section_number text DEFAULT NULL;

ALTER TABLE public.materials
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;

-- 4. Create helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_material_categories_year ON public.material_categories (academic_year);
CREATE INDEX IF NOT EXISTS idx_materials_section ON public.materials (section_number);
