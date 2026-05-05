-- Remove duplicate endpoints, keep newest
DELETE FROM public.push_subscriptions a
USING public.push_subscriptions b
WHERE a.endpoint = b.endpoint
  AND a.created_at < b.created_at;

-- Enforce uniqueness on endpoint
ALTER TABLE public.push_subscriptions
  ADD CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint);