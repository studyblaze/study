-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES public.tutors(id) ON DELETE CASCADE,
    plan_hours INTEGER NOT NULL,
    balance_hours DECIMAL DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
    billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
    next_billing_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription usage/history table
CREATE TABLE IF NOT EXISTS public.subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    hours_deducted DECIMAL NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = student_id OR auth.uid() IN (SELECT profile_id FROM public.tutors WHERE id = tutor_id));

CREATE POLICY "Users can view their subscription usage" 
ON public.subscription_usage FOR SELECT 
USING (subscription_id IN (SELECT id FROM public.subscriptions WHERE student_id = auth.uid() OR tutor_id IN (SELECT id FROM public.tutors WHERE profile_id = auth.uid())));
