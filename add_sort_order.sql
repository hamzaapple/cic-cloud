-- Add sort_order column to materials table for drag-and-drop reordering
-- Run this in the Supabase SQL Editor

ALTER TABLE materials
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT NULL;

-- Create an index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_materials_sort_order ON materials (sort_order ASC NULLS LAST);
