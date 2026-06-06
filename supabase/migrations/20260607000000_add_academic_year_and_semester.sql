-- Add academic_year and semester to courses
ALTER TABLE public.courses
ADD COLUMN academic_year TEXT DEFAULT '1' NOT NULL,
ADD COLUMN semester TEXT DEFAULT '2' NOT NULL;

-- Add academic_year to moderators
ALTER TABLE public.moderators
ADD COLUMN academic_year TEXT DEFAULT '1' NOT NULL;

-- Add admin_year to audit_logs
ALTER TABLE public.audit_logs
ADD COLUMN admin_year TEXT DEFAULT '1' NOT NULL;
