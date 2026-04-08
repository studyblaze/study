create table if not exists recordings (
  id uuid default gen_random_uuid() primary key,
  tutor_id uuid references auth.users(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete set null,
  booking_id uuid references bookings(id) on delete cascade,
  title text not null,
  video_url text,
  size_mb text,
  duration text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table recordings enable row level security;

-- Policies
create policy "Users can view their own recordings"
  on recordings for select
  using (
    auth.uid() = tutor_id or 
    auth.uid() = student_id or
    (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "Tutors can update their own recordings"
  on recordings for update
  using (auth.uid() = tutor_id);

-- System service role can do anything
create policy "Service role has full access"
  on recordings for all
  using (true);
