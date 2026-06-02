CREATE OR REPLACE FUNCTION public.register_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text,
  p_department text DEFAULT 'all'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_endpoint IS NULL OR length(trim(p_endpoint)) = 0 THEN
    RAISE EXCEPTION 'Missing push endpoint';
  END IF;

  INSERT INTO public.push_subscriptions (endpoint, p256dh, auth, user_agent, department)
  VALUES (
    p_endpoint,
    p_p256dh,
    p_auth,
    p_user_agent,
    COALESCE(NULLIF(trim(p_department), ''), 'all')
  )
  ON CONFLICT (endpoint) DO UPDATE SET
    p256dh = EXCLUDED.p256dh,
    auth = EXCLUDED.auth,
    user_agent = EXCLUDED.user_agent,
    department = COALESCE(EXCLUDED.department, 'all'),
    created_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_push_subscription(text, text, text, text, text) TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
REVOKE SELECT, UPDATE, DELETE ON public.push_subscriptions FROM anon;

DROP POLICY IF EXISTS "Public read push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Public update push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Public delete stale push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Public insert push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anonymous can register push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Anonymous can register push subscriptions"
ON public.push_subscriptions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
