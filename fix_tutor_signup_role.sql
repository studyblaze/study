-- Fix for Tutor Signup: Respecting the role from metadata
-- This ensures that when a user signs up as a tutor, their public.profile 
-- is correctly initialized with the 'tutor' role instead of defaulting to 'student'.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, country)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'), -- Respect the role from metadata
    new.raw_user_meta_data->>'country' -- Capture country if provided
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
