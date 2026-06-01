-- Fix push_subscriptions RLS: remove duplicates, add SELECT, ensure grants
DROP POLICY IF EXISTS "Anyone can insert subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can insert push subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can update own push subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can read push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can delete push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Public insert push subscriptions"
  ON public.push_subscriptions FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update push subscriptions"
  ON public.push_subscriptions FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public read push subscriptions"
  ON public.push_subscriptions FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public delete stale push subscriptions"
  ON public.push_subscriptions FOR DELETE TO anon, authenticated
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO anon, authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;