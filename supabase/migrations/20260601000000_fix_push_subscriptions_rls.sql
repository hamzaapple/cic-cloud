-- Fix push_subscriptions upsert failing for anonymous users due to RLS SELECT restriction
CREATE OR REPLACE FUNCTION public.register_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text,
  p_department text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.push_subscriptions (endpoint, p256dh, auth, user_agent, department)
  VALUES (p_endpoint, p_p256dh, p_auth, p_user_agent, p_department)
  ON CONFLICT (endpoint) DO UPDATE SET
    p256dh = EXCLUDED.p256dh,
    auth = EXCLUDED.auth,
    user_agent = EXCLUDED.user_agent,
    department = COALESCE(EXCLUDED.department, 'all'),
    created_at = now();
END;
$$;
