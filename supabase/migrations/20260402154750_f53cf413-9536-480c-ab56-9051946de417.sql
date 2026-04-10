CREATE OR REPLACE FUNCTION public.authenticate_moderator(p_username text, p_password text)
 RETURNS TABLE(mod_id uuid, mod_display_name text, mod_permissions text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT id, display_name, permissions
  FROM moderators
  WHERE username = p_username
    AND password = crypt(p_password, password);
END;
$$;

-- Also fix the hash trigger search path
CREATE OR REPLACE FUNCTION public.hash_moderator_password()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  IF NEW.password NOT LIKE '$2a$%' AND NEW.password NOT LIKE '$2b$%' THEN
    NEW.password := crypt(NEW.password, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;