-- Fix handle_new_user function to work with users table instead of profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role, nivel, status)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'role', 'user'),
    COALESCE(new.raw_user_meta_data ->> 'role', 'user'),
    'ativo'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;