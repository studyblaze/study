-- Enable Realtime for the messages table
begin;
  -- Remove the table from publication if it exists (to avoid errors)
  -- or just add it. Supabase usually uses 'supabase_realtime' publication.
  alter publication supabase_realtime add table messages;
commit;

-- Ensure RLS is enabled and allows real-time broadcasting
-- Supabase Realtime respects RLS. If a user can SELECT the row, they can receive it via Realtime.
-- Existing RLS for messages should be sufficient if SELECT is working.
