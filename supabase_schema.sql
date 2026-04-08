-- 1. PROFILES (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('student', 'tutor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TUTORS
CREATE TABLE public.tutors (
  id SERIAL PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) UNIQUE,
  subject TEXT,
  bio TEXT,
  hourly_rate DECIMAL,
  rating DECIMAL DEFAULT 0,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE, -- Legacy support
  application_data JSONB, -- Stores certificates, video link, etc.
  identity_docs_url TEXT,
  earnings DECIMAL DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SESSIONS
CREATE TABLE public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id INTEGER REFERENCES public.tutors(id),
  topic TEXT,
  date DATE,
  time TIME,
  max_students INTEGER DEFAULT 5,
  status TEXT CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id),
  student_id UUID REFERENCES public.profiles(id),
  status TEXT CHECK (status IN ('confirmed', 'pending', 'cancelled')) DEFAULT 'confirmed',
  amount DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MESSAGES
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id),
  receiver_id UUID REFERENCES public.profiles(id),
  text TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  file_size TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow public read for tutors and sessions
CREATE POLICY "Public Read Tutors" ON public.tutors FOR SELECT USING (true);
CREATE POLICY "Public Read Sessions" ON public.sessions FOR SELECT USING (true);

-- Allow users to see their own profiles
CREATE POLICY "Allow individual read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow individual updates" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Messaging Policies
CREATE POLICY "View my messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
