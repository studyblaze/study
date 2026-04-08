-- Add notification_preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "lesson_reminders": true,
    "new_messages": true,
    "payment_receipts": true,
    "platform_updates": false
}'::JSONB;

-- Update existing profiles that might have null if needed (though DEFAULT handles new)
UPDATE public.profiles 
SET notification_preferences = '{
    "lesson_reminders": true,
    "new_messages": true,
    "payment_receipts": true,
    "platform_updates": false
}'::JSONB
WHERE notification_preferences IS NULL;
