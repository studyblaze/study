-- 1. Ensure the support admin profile exists
INSERT INTO public.profiles (id, full_name, email, role)
VALUES ('db1994ef-754b-469d-9c21-8da397b40245', 'GroupTutors Support', 'grouptutorsnew@gmail.com', 'admin')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'GroupTutors Support';

-- 2. Create a trigger to automatically sync auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'student' -- Default role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger should be on auth.users (requires superuser or the right permissions in SQL Editor)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill missing profiles for existing users
INSERT INTO public.profiles (id, full_name, email, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
  email, 
  'student'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Set RLS for messages more explicitly
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can send" ON public.messages;
CREATE POLICY "Anyone authenticated can send" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
