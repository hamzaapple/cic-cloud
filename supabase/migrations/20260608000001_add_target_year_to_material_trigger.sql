-- Update material trigger to include target_year
CREATE OR REPLACE FUNCTION public.notify_on_material_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Ensure permissions are retained securely
REVOKE EXECUTE ON FUNCTION public.notify_on_material_insert() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_material_insert() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_on_material_insert() FROM authenticated;
