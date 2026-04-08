-- Fix the handle_new_user trigger to use email prefix instead of full email
-- And also update existing profiles that have email as their full_name

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    display_name TEXT;
BEGIN
    -- Get full_name from metadata or use email prefix
    display_name := COALESCE(
        new.raw_user_meta_data->>'full_name', 
        split_part(new.email, '@', 1)
    );

    -- Capitalize first letter if it's the prefix
    IF display_name = split_part(new.email, '@', 1) THEN
        display_name := initcap(display_name);
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        display_name,
        COALESCE(new.raw_user_meta_data->>'role', 'student')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles where full_name is an email address
UPDATE public.profiles
SET full_name = initcap(split_part(email, '@', 1))
WHERE full_name LIKE '%@%' OR full_name IS NULL OR full_name = 'Anonymous';

-- Also update specific admin user if needed
UPDATE public.profiles
SET full_name = 'Shreyash'
WHERE email = 'grouptutorsnew@gmail.com';
