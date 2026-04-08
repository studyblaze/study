-- FIX: Messaging Error & Profile Visibility
-- Run this in your Supabase SQL Editor to allow users to see each other's basic info for chat.

-- 1. Drop the restrictive old policy if it exists
DROP POLICY IF EXISTS "Allow individual read" ON public.profiles;

-- 2. Create a new policy that allows everyone to see basic profile info 
-- (This is necessary so the chat can show the name/avatar of the person you are talking to)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- 3. Ensure users can still only update THEIR OWN profile
DROP POLICY IF EXISTS "Allow individual updates" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- 4. Verify Messaging Policies (Should already be correct from schema)
-- These allow you to see messages where you are either the sender or receiver
DROP POLICY IF EXISTS "View my messages" ON public.messages;
CREATE POLICY "View my messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Send messages" ON public.messages;
CREATE POLICY "Send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);
