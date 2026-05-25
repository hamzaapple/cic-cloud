-- ═══════════════════════════════════════════════════════════════
-- Audit Log Enhancements + Soft Delete for Materials
-- ═══════════════════════════════════════════════════════════════

-- 1. Add columns to audit_logs for linking to materials and snapshots
ALTER TABLE public.audit_logs 
  ADD COLUMN IF NOT EXISTS action_type text DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS related_material_id uuid,
  ADD COLUMN IF NOT EXISTS material_snapshot jsonb;

-- 2. Add soft delete column to materials
ALTER TABLE public.materials 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- 3. Create index on deleted_at for filtering
CREATE INDEX IF NOT EXISTS idx_materials_deleted_at 
  ON public.materials (deleted_at);

-- 4. Create index on action_type for filtering audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type 
  ON public.audit_logs (action_type);

-- ═══════════════════════════════════════════════════════════════
-- Notes:
-- action_type values: 'upload', 'delete', 'edit', 'archive', 
--                     'restore', 'bulk_upload', 'add_link', 
--                     'delete_link', 'add_announcement', 
--                     'delete_announcement', 'other'
-- material_snapshot: stores full material JSON for restore
-- deleted_at: NULL = active, timestamp = soft-deleted
-- ═══════════════════════════════════════════════════════════════
