-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage NUMERIC NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    max_uses INTEGER DEFAULT NULL,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to promo_codes"
ON public.promo_codes
FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'email' = 'grouptutorsnew@gmail.com' OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    auth.jwt() ->> 'email' = 'grouptutorsnew@gmail.com' OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Users can view active, non-expired, and non-exhausted promo codes (for validation)
CREATE POLICY "Users can view valid promo_codes"
ON public.promo_codes
FOR SELECT
TO authenticated
USING (
    is_active = TRUE AND 
    (expires_at IS NULL OR expires_at > NOW()) AND
    (max_uses IS NULL OR used_count < max_uses)
);

-- Function to increment promo uses
CREATE OR REPLACE FUNCTION public.increment_promo_uses(promo_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.promo_codes
    SET used_count = used_count + 1
    WHERE id = promo_id;
END;
$$;
