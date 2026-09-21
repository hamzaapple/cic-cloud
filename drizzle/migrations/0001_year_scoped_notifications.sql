ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS academic_year text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_year text;

DROP FUNCTION IF EXISTS public.register_push_subscription(text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.register_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text,
  p_department text DEFAULT 'all'::text,
  p_academic_year text DEFAULT NULL
)
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
$function$;