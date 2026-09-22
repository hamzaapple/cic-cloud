-- CIC full schema export
create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_net with schema extensions;

-- TABLES
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  content text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  link text
);
CREATE TABLE IF NOT EXISTS public.assignment_reminders_sent (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  material_id uuid NOT NULL,
  reminder_type text NOT NULL,
  sent_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  admin_id uuid,
  admin_name text NOT NULL,
  action text NOT NULL,
  details text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  action_type text DEFAULT 'other'::text,
  related_material_id uuid,
  material_snapshot jsonb,
  admin_year text DEFAULT '1'::text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  color text DEFAULT '190 80% 45%'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  description_ar text DEFAULT ''::text NOT NULL,
  department_id uuid,
  academic_year text DEFAULT '1'::text NOT NULL,
  semester text DEFAULT '2'::text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.important_links (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  title_ar text,
  url text NOT NULL,
  is_persistent boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  department_id uuid
);
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  identifier text NOT NULL,
  attempted_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.material_categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  department_id uuid
);
CREATE TABLE IF NOT EXISTS public.materials (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  course_id uuid NOT NULL,
  pdf_url text,
  pdf_display_name text,
  external_link text,
  deadline text,
  is_assignment boolean DEFAULT false NOT NULL,
  archived boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  category_id uuid,
  submission_link text,
  sort_order integer,
  is_list boolean DEFAULT false,
  list_content text,
  deleted_at timestamp with time zone
);
CREATE TABLE IF NOT EXISTS public.moderator_course_access (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  moderator_id uuid NOT NULL,
  course_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.moderators (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  display_name text NOT NULL,
  permissions text[] DEFAULT '{}'::text[] NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  department_id uuid,
  plain_password text,
  academic_year text DEFAULT '1'::text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id text NOT NULL,
  title_template text NOT NULL,
  message_template text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  target_audience text DEFAULT 'all'::text NOT NULL,
  link text,
  sent_by text DEFAULT 'owner'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  target_year text
);
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  endpoint text NOT NULL,
  p256dh text,
  auth text,
  user_agent text,
  department text,
  academic_year text
);
CREATE TABLE IF NOT EXISTS public.shared_department_courses (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  course_id uuid NOT NULL,
  target_department_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- CONSTRAINTS
ALTER TABLE public.announcements ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);
ALTER TABLE public.assignment_reminders_sent ADD CONSTRAINT assignment_reminders_sent_pkey PRIMARY KEY (id);
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
ALTER TABLE public.courses ADD CONSTRAINT courses_pkey PRIMARY KEY (id);
ALTER TABLE public.departments ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
ALTER TABLE public.important_links ADD CONSTRAINT important_links_pkey PRIMARY KEY (id);
ALTER TABLE public.login_attempts ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);
ALTER TABLE public.material_categories ADD CONSTRAINT material_categories_pkey PRIMARY KEY (id);
ALTER TABLE public.materials ADD CONSTRAINT materials_pkey PRIMARY KEY (id);
ALTER TABLE public.moderator_course_access ADD CONSTRAINT moderator_course_access_pkey PRIMARY KEY (id);
ALTER TABLE public.moderators ADD CONSTRAINT moderators_pkey PRIMARY KEY (id);
ALTER TABLE public.notification_templates ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE public.shared_department_courses ADD CONSTRAINT shared_department_courses_pkey PRIMARY KEY (id);
ALTER TABLE public.assignment_reminders_sent ADD CONSTRAINT assignment_reminders_sent_material_id_reminder_type_key UNIQUE (material_id, reminder_type);
ALTER TABLE public.moderator_course_access ADD CONSTRAINT moderator_course_access_moderator_id_course_id_key UNIQUE (moderator_id, course_id);
ALTER TABLE public.moderators ADD CONSTRAINT moderators_username_key UNIQUE (username);
ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);
ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint);
ALTER TABLE public.shared_department_courses ADD CONSTRAINT shared_department_courses_course_id_target_department_id_key UNIQUE (course_id, target_department_id);
ALTER TABLE public.assignment_reminders_sent ADD CONSTRAINT assignment_reminders_sent_reminder_type_check CHECK ((reminder_type = ANY (ARRAY['24h'::text, '6h'::text, '1h'::text])));
ALTER TABLE public.materials ADD CONSTRAINT materials_type_check CHECK ((type = ANY (ARRAY['lecture'::text, 'section'::text, 'resource'::text])));
ALTER TABLE public.announcements ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.assignment_reminders_sent ADD CONSTRAINT assignment_reminders_sent_material_id_fkey FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE;
ALTER TABLE public.courses ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE public.important_links ADD CONSTRAINT important_links_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE public.material_categories ADD CONSTRAINT material_categories_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE;
ALTER TABLE public.materials ADD CONSTRAINT materials_category_id_fkey FOREIGN KEY (category_id) REFERENCES material_categories(id);
ALTER TABLE public.materials ADD CONSTRAINT materials_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE public.moderator_course_access ADD CONSTRAINT moderator_course_access_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE public.moderator_course_access ADD CONSTRAINT moderator_course_access_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES moderators(id) ON DELETE CASCADE;
ALTER TABLE public.moderators ADD CONSTRAINT moderators_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);

-- INDEXES
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs USING btree (action_type);
CREATE INDEX idx_material_categories_department ON public.material_categories USING btree (department_id);
CREATE INDEX idx_materials_deleted_at ON public.materials USING btree (deleted_at);
CREATE INDEX idx_materials_sort_order ON public.materials USING btree (sort_order);
CREATE INDEX login_attempts_identifier_idx ON public.login_attempts USING btree (identifier, attempted_at);

-- FUNCTIONS
CREATE OR REPLACE FUNCTION public.authenticate_moderator(p_username text, p_password text)
 RETURNS TABLE(mod_id uuid, mod_display_name text, mod_permissions text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  RETURN QUERY
  SELECT id, display_name, permissions
  FROM moderators
  WHERE username = p_username
    AND password = crypt(p_password, password);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.hash_moderator_password()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF NEW.password NOT LIKE '$2a$%' AND NEW.password NOT LIKE '$2b$%' THEN
    NEW.plain_password := NEW.password;
    NEW.password := crypt(NEW.password, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.notify_on_announcement_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_url text;
  v_key text;
BEGIN
  SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name='supabase_url' LIMIT 1;
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name='service_role_key' LIMIT 1;

  IF v_url IS NULL OR v_key IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := v_url || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || v_key
    ),
    body := jsonb_build_object(
      'title', '📢 إعلان جديد',
      'message', NEW.content,
      'target_audience', 'all'
    )
  );
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.notify_on_material_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_course_name text;
  v_dept_id uuid;
  v_academic_year text;
  v_dept_name text;
  v_title text;
  v_url text;
  v_key text;
BEGIN
  SELECT c.name, c.department_id, c.academic_year INTO v_course_name, v_dept_id, v_academic_year
  FROM public.courses c WHERE c.id = NEW.course_id;

  IF v_dept_id IS NOT NULL THEN
    SELECT name_en INTO v_dept_name FROM public.departments WHERE id = v_dept_id;
  END IF;

  v_title := CASE WHEN NEW.is_assignment
    THEN '📝 تكليف جديد: ' || COALESCE(v_course_name, '')
    ELSE '📚 مادة جديدة: ' || COALESCE(v_course_name, '')
  END;

  SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name='supabase_url' LIMIT 1;
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name='service_role_key' LIMIT 1;

  IF v_url IS NULL OR v_key IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := v_url || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || v_key
    ),
    body := jsonb_build_object(
      'title', v_title,
      'message', NEW.title,
      'target_audience', COALESCE(v_dept_name, 'all'),
      'target_year', COALESCE(v_academic_year, 'all')
    )
  );
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.notify_push_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_url text; v_key text;
BEGIN
  SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name='supabase_url' LIMIT 1;
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name='service_role_key' LIMIT 1;
  IF v_url IS NULL OR v_key IS NULL THEN RETURN NEW; END IF;
  PERFORM net.http_post(
    url := v_url || '/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_key),
    body := jsonb_build_object('title', NEW.title, 'message', NEW.message, 'target_audience', NEW.target_audience, 'target_year', NEW.target_year)
  );
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.register_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_user_agent text, p_department text DEFAULT 'all'::text, p_academic_year text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_endpoint IS NULL OR length(trim(p_endpoint)) = 0 THEN
    RAISE EXCEPTION 'Missing push endpoint';
  END IF;

  INSERT INTO public.push_subscriptions (endpoint, p256dh, auth, user_agent, department, academic_year)
  VALUES (
    p_endpoint,
    p_p256dh,
    p_auth,
    p_user_agent,
    COALESCE(NULLIF(trim(p_department), ''), 'all'),
    NULLIF(trim(p_academic_year), '')
  )
  ON CONFLICT (endpoint) DO UPDATE SET
    p256dh = EXCLUDED.p256dh,
    auth = EXCLUDED.auth,
    user_agent = EXCLUDED.user_agent,
    department = COALESCE(EXCLUDED.department, 'all'),
    academic_year = COALESCE(EXCLUDED.academic_year, public.push_subscriptions.academic_year),
    created_at = now();
END;
$function$
;

-- TRIGGERS
CREATE TRIGGER hash_password_trigger BEFORE INSERT OR UPDATE ON public.moderators FOR EACH ROW EXECUTE FUNCTION hash_moderator_password();
CREATE TRIGGER notify_announcement_insert AFTER INSERT ON public.announcements FOR EACH ROW EXECUTE FUNCTION notify_on_announcement_insert();
CREATE TRIGGER notify_material_insert AFTER INSERT ON public.materials FOR EACH ROW EXECUTE FUNCTION notify_on_material_insert();

-- RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_reminders_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_department_courses ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Admin can delete announcements" ON public.announcements;
CREATE POLICY "Admin can delete announcements" ON public.announcements AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Admin can insert announcements" ON public.announcements;
CREATE POLICY "Admin can insert announcements" ON public.announcements AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Allow deletes on announcements" ON public.announcements;
CREATE POLICY "Allow deletes on announcements" ON public.announcements AS PERMISSIVE FOR DELETE TO public USING (true);
DROP POLICY IF EXISTS "Allow inserts on announcements" ON public.announcements;
CREATE POLICY "Allow inserts on announcements" ON public.announcements AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read announcements" ON public.announcements;
CREATE POLICY "Anyone can read announcements" ON public.announcements AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Enable read access for all users on announcements" ON public.announcements;
CREATE POLICY "Enable read access for all users on announcements" ON public.announcements AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "service role full access" ON public.assignment_reminders_sent;
CREATE POLICY "service role full access" ON public.assignment_reminders_sent AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can insert audit_logs" ON public.audit_logs;
CREATE POLICY "Admin can insert audit_logs" ON public.audit_logs AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Allow inserts into audit_logs" ON public.audit_logs;
CREATE POLICY "Allow inserts into audit_logs" ON public.audit_logs AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Enable read for audit logs" ON public.audit_logs;
CREATE POLICY "Enable read for audit logs" ON public.audit_logs AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Owner can read audit_logs" ON public.audit_logs;
CREATE POLICY "Owner can read audit_logs" ON public.audit_logs AS PERMISSIVE FOR SELECT TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Admin can insert courses" ON public.courses;
CREATE POLICY "Admin can insert courses" ON public.courses AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Admin can update courses" ON public.courses;
CREATE POLICY "Admin can update courses" ON public.courses AS PERMISSIVE FOR UPDATE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Anyone can read courses" ON public.courses;
CREATE POLICY "Anyone can read courses" ON public.courses AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Owner can delete courses" ON public.courses;
CREATE POLICY "Owner can delete courses" ON public.courses AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Anyone can read departments" ON public.departments;
CREATE POLICY "Anyone can read departments" ON public.departments AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Owner can delete departments" ON public.departments;
CREATE POLICY "Owner can delete departments" ON public.departments AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Owner can insert departments" ON public.departments;
CREATE POLICY "Owner can insert departments" ON public.departments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Owner can update departments" ON public.departments;
CREATE POLICY "Owner can update departments" ON public.departments AS PERMISSIVE FOR UPDATE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Admin can delete links" ON public.important_links;
CREATE POLICY "Admin can delete links" ON public.important_links AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Admin can insert links" ON public.important_links;
CREATE POLICY "Admin can insert links" ON public.important_links AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Admin can update links" ON public.important_links;
CREATE POLICY "Admin can update links" ON public.important_links AS PERMISSIVE FOR UPDATE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Anyone can read links" ON public.important_links;
CREATE POLICY "Anyone can read links" ON public.important_links AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Admin can delete categories" ON public.material_categories;
CREATE POLICY "Admin can delete categories" ON public.material_categories AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Admin can insert categories" ON public.material_categories;
CREATE POLICY "Admin can insert categories" ON public.material_categories AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Admin can update categories" ON public.material_categories;
CREATE POLICY "Admin can update categories" ON public.material_categories AS PERMISSIVE FOR UPDATE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Anyone can read categories" ON public.material_categories;
CREATE POLICY "Anyone can read categories" ON public.material_categories AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Admin can delete materials" ON public.materials;
CREATE POLICY "Admin can delete materials" ON public.materials AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Admin can insert materials" ON public.materials;
CREATE POLICY "Admin can insert materials" ON public.materials AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Admin can update materials" ON public.materials;
CREATE POLICY "Admin can update materials" ON public.materials AS PERMISSIVE FOR UPDATE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Anyone can read materials" ON public.materials;
CREATE POLICY "Anyone can read materials" ON public.materials AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Owner can manage course access" ON public.moderator_course_access;
CREATE POLICY "Owner can manage course access" ON public.moderator_course_access AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text)) WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Scoped read for course access" ON public.moderator_course_access;
CREATE POLICY "Scoped read for course access" ON public.moderator_course_access AS PERMISSIVE FOR SELECT TO authenticated USING (((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text) OR (moderator_id = auth.uid())));
DROP POLICY IF EXISTS "Owner can delete moderators" ON public.moderators;
CREATE POLICY "Owner can delete moderators" ON public.moderators AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Owner can insert moderators" ON public.moderators;
CREATE POLICY "Owner can insert moderators" ON public.moderators AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Owner can read moderators" ON public.moderators;
CREATE POLICY "Owner can read moderators" ON public.moderators AS PERMISSIVE FOR SELECT TO public USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Owner can update moderators" ON public.moderators;
CREATE POLICY "Owner can update moderators" ON public.moderators AS PERMISSIVE FOR UPDATE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Allow owner to update notification_templates" ON public.notification_templates;
CREATE POLICY "Allow owner to update notification_templates" ON public.notification_templates AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read access on notification_templates" ON public.notification_templates;
CREATE POLICY "Allow public read access on notification_templates" ON public.notification_templates AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Admin can insert notifications" ON public.notifications;
CREATE POLICY "Admin can insert notifications" ON public.notifications AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = ANY (ARRAY['owner'::text, 'moderator'::text])));
DROP POLICY IF EXISTS "Anyone can read notifications" ON public.notifications;
CREATE POLICY "Anyone can read notifications" ON public.notifications AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Owner can delete notifications" ON public.notifications;
CREATE POLICY "Owner can delete notifications" ON public.notifications AS PERMISSIVE FOR DELETE TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));
DROP POLICY IF EXISTS "Anonymous can register push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Anonymous can register push subscriptions" ON public.push_subscriptions AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read shared courses" ON public.shared_department_courses;
CREATE POLICY "Anyone can read shared courses" ON public.shared_department_courses AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Owner can manage shared courses" ON public.shared_department_courses;
CREATE POLICY "Owner can manage shared courses" ON public.shared_department_courses AS PERMISSIVE FOR ALL TO authenticated USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text)) WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text));

-- GRANTS
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.announcements TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.announcements TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.announcements TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.assignment_reminders_sent TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.assignment_reminders_sent TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.assignment_reminders_sent TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.audit_logs TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.audit_logs TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.audit_logs TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.courses TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.courses TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.courses TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.departments TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.departments TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.departments TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.important_links TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.important_links TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.important_links TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.login_attempts TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.login_attempts TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.login_attempts TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.material_categories TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.material_categories TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.material_categories TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.materials TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.materials TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.materials TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.moderator_course_access TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.moderator_course_access TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.moderator_course_access TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.moderators TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.moderators TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.moderators TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.notification_templates TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.notification_templates TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.notification_templates TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.notifications TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.notifications TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.notifications TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.push_subscriptions TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.push_subscriptions TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.shared_department_courses TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.shared_department_courses TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.shared_department_courses TO service_role;
GRANT INSERT, REFERENCES, TRIGGER, TRUNCATE ON public.push_subscriptions TO anon;

-- STORAGE BUCKET
insert into storage.buckets (id, name, public) values ('materials','materials',true) on conflict (id) do nothing;
create policy "materials public read" on storage.objects for select to public using (bucket_id = 'materials');
create policy "materials admin write" on storage.objects for insert to authenticated with check (bucket_id = 'materials');
create policy "materials admin delete" on storage.objects for delete to authenticated using (bucket_id = 'materials');