-- RLS FIXES FOR BOOKINGS, SESSIONS, AND TRANSACTIONS

-- 1. PROFILES: Allow public read of basic info (needed for tutor names/locations)
-- Already exists: "Public can view profiles" (assuming)
-- If not, let's ensure it:
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles
FOR SELECT USING (true);

-- 2. BOOKINGS: Allow authenticated users to insert their own bookings
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
CREATE POLICY "Users can insert their own bookings" ON public.bookings
FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings
FOR SELECT USING (
    auth.uid() = student_id OR 
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.tutors t ON s.tutor_id = t.id
        WHERE s.id = session_id AND t.profile_id = auth.uid()
    ) OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. SESSIONS: Allow authenticated tutors to create sessions
DROP POLICY IF EXISTS "Tutors can insert their own sessions" ON public.sessions;
CREATE POLICY "Tutors can insert their own sessions" ON public.sessions
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM tutors WHERE id = tutor_id AND profile_id = auth.uid()));

-- Allow anyone to view sessions
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.sessions;
CREATE POLICY "Anyone can view sessions" ON public.sessions
FOR SELECT USING (true);

-- 4. TRANSACTIONS: Allow users to insert their own transactions
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions" ON public.transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 5. WALLETS: Access control
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet" ON public.wallets
FOR SELECT USING (auth.uid() = user_id);

-- 6. PROFILE VIEWS (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profile_views') THEN
        ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Anyone can insert profile views" ON public.profile_views;
        CREATE POLICY "Anyone can insert profile views" ON public.profile_views
        FOR INSERT WITH CHECK (true); -- Allow anon views
    END IF;
END $$;
