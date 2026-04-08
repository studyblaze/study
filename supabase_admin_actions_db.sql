-- Add timezone and country columns to profiles table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'status') THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'timezone') THEN
        ALTER TABLE public.profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'country') THEN
        ALTER TABLE public.profiles ADD COLUMN country TEXT;
    END IF;
END $$;

-- Update the handle_new_user trigger to include default status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    display_name TEXT;
BEGIN
    display_name := COALESCE(
        new.raw_user_meta_data->>'full_name', 
        split_part(new.email, '@', 1)
    );
    IF display_name = split_part(new.email, '@', 1) THEN
        display_name := initcap(display_name);
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, status, timezone, country)
    VALUES (
        new.id,
        new.email,
        display_name,
        COALESCE(new.raw_user_meta_data->>'role', 'student'),
        'active',
        COALESCE(new.raw_user_meta_data->>'timezone', 'UTC'),
        new.raw_user_meta_data->>'country'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
