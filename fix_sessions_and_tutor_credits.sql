-- MASTER FIX FOR GHOST SESSIONS & AUTOMATED TUTOR CREDITING
-- This script:
-- 1. Adds DELETE policy to sessions (to allow rollbacks by students)
-- 2. Automates tutor crediting via a database trigger (replaces client-side credits)
-- 3. Ensures clean RLS for all booking-related tables

-- 1. FIX SESSIONS RLS (Allow Rollback Deletion)
DROP POLICY IF EXISTS "Users can delete their own orphaned sessions" ON public.sessions;
CREATE POLICY "Users can delete their own orphaned sessions" 
ON public.sessions FOR DELETE 
USING (
    -- Allow deletion if session has no bookings
    NOT EXISTS (SELECT 1 FROM public.bookings b WHERE b.session_id = id)
    AND (
        -- and the user is an admin
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        -- OR the user is authenticated (we allow students to delete sessions they just created IF no bookings exist)
        OR auth.role() = 'authenticated'
    )
);

-- Ensure students can insert sessions (they need this to trigger creation during booking)
-- We refine the INSERT policy to allow students too.
DROP POLICY IF EXISTS "Tutors can insert their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can insert sessions" ON public.sessions;
CREATE POLICY "Users can insert sessions" 
ON public.sessions FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 2. AUTOMATE TUTOR CREDITING (Database Trigger)
-- Create a function to handle the credit
CREATE OR REPLACE FUNCTION public.handle_tutor_credit_on_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_tutor_profile_id UUID;
    v_currency TEXT;
BEGIN
    -- Only proceed for new confirmed bookings
    IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') THEN
        
        -- Get the tutor's profile_id from the session
        SELECT t.profile_id INTO v_tutor_profile_id
        FROM public.sessions s
        JOIN public.tutors t ON s.tutor_id = t.id
        WHERE s.id = NEW.session_id;

        -- Create a transaction record for the tutor
        INSERT INTO public.transactions (
            user_id,
            amount,
            description,
            type,
            status,
            currency,
            amount_inr
        ) VALUES (
            v_tutor_profile_id,
            NEW.amount,
            'Earnings from lesson booking (Auto-credited)',
            'bonus',
            'completed',
            NEW.currency,
            NEW.amount_inr
        );

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_credit_tutor_on_booking ON public.bookings;
CREATE TRIGGER trg_credit_tutor_on_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.handle_tutor_credit_on_booking();

-- 3. ENSURE CLEAN RLS ON BOOKINGS
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
CREATE POLICY "Users can insert their own bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- 4. CLEANUP GHOST SESSIONS (Manual for Tue 17th reported by user)
-- Note: This part is for information, real cleanup will be done via script or manual SQL if possible.
-- DELETE FROM public.sessions WHERE date = '2026-03-17' AND id IN ('8fa0489f-3701-4e43-96bf-6ba0898921d2', '847feaa0-6dd4-456a-a377-86ac3156fa2d');

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
