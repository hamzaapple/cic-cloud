-- Add display_order to material_categories
ALTER TABLE material_categories ADD COLUMN display_order integer DEFAULT 0;

-- Add is_reference to materials
ALTER TABLE materials ADD COLUMN is_reference boolean DEFAULT false;
