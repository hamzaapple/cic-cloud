-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated can read moderators" ON public.moderators;

-- Create a new policy that only allows owner to read moderators
CREATE POLICY "Owner can read moderators"
ON public.moderators
FOR SELECT
USING (((auth.jwt() -> 'app_metadata'::text) ->> 'app_role'::text) = 'owner'::text);