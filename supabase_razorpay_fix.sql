-- Add Razorpay Subscription ID support
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- Update RLS for better support
CREATE POLICY "Admins can update subscriptions" 
ON public.subscriptions FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
