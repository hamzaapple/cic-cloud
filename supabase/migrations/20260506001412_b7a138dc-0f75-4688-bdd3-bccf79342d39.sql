
-- Function for material/assignment notifications
CREATE OR REPLACE FUNCTION public.notify_on_material_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_name text;
  v_dept_id uuid;
  v_dept_name text;
  v_title text;
  v_url text;
  v_key text;
BEGIN
  SELECT c.name, c.department_id INTO v_course_name, v_dept_id
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
      'target_audience', COALESCE(v_dept_name, 'all')
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_material_insert ON public.materials;
CREATE TRIGGER notify_material_insert
AFTER INSERT ON public.materials
FOR EACH ROW EXECUTE FUNCTION public.notify_on_material_insert();

-- Function for announcement notifications
CREATE OR REPLACE FUNCTION public.notify_on_announcement_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

DROP TRIGGER IF EXISTS notify_announcement_insert ON public.announcements;
CREATE TRIGGER notify_announcement_insert
AFTER INSERT ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.notify_on_announcement_insert();
