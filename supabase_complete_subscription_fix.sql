-- ==========================================
-- COMPLETE SUBSCRIPTION & RAZORPAY MIGRATION
-- ==========================================

-- 1. Ensure Sessions Table exists (Dependency for bookings)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id INTEGER REFERENCES public.tutors(id),
    topic TEXT,
    date DATE,
    time TIME,
    max_students INTEGER DEFAULT 5,
    status TEXT CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure Bookings Table exists (Dependency for subscription_usage)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id),
    student_id UUID REFERENCES public.profiles(id),
    status TEXT CHECK (status IN ('confirmed', 'pending', 'cancelled')) DEFAULT 'confirmed',
    amount DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES public.tutors(id) ON DELETE CASCADE,
    plan_hours INTEGER NOT NULL,
    balance_hours DECIMAL DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
    billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
    next_billing_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
    razorpay_subscription_id TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Subscription Usage Table
CREATE TABLE IF NOT EXISTS public.subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    hours_deducted DECIMAL NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Public Read Sessions" ON public.sessions;
CREATE POLICY "Public Read Sessions" ON public.sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = student_id OR auth.uid() IN (SELECT profile_id FROM public.tutors WHERE id = tutor_id));

DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can update subscriptions" 
ON public.subscriptions FOR ALL
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Users can view their subscription usage" ON public.subscription_usage;
CREATE POLICY "Users can view their subscription usage" 
ON public.subscription_usage FOR SELECT 
USING (subscription_id IN (SELECT id FROM public.subscriptions WHERE student_id = auth.uid() OR tutor_id IN (SELECT id FROM public.tutors WHERE profile_id = auth.uid())));

-- 7. Add Razorpay column if table existed but column was missing (safety check)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='razorpay_subscription_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN razorpay_subscription_id TEXT;
    END IF;
END $$;
