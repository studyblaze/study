-- Create Institutions Table
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    abbr TEXT,
    color TEXT, -- e.g. "linear-gradient(135deg, #6366f1, #a855f7)"
    is_elite BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add badges column to tutors table
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view institutions"
    ON public.institutions FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to institutions"
    ON public.institutions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Initial elite institutions from existing TrustBadges list
INSERT INTO public.institutions (name, abbr, color)
VALUES 
('IIT Delhi', 'IITD', 'linear-gradient(135deg, #6366f1, #a855f7)'),
('IIT Bombay', 'IITB', 'linear-gradient(135deg, #ec4899, #8b5cf6)'),
('NIT Trichy', 'NITT', 'linear-gradient(135deg, #3b82f6, #2dd4bf)'),
('BITS Pilani', 'BITS', 'linear-gradient(135deg, #f59e0b, #ef4444)'),
('ISI Kolkata', 'ISI', 'linear-gradient(135deg, #10b981, #3b82f6)'),
('IISc Bangalore', 'IISc', 'linear-gradient(135deg, #6366f1, #ec4899)')
ON CONFLICT (name) DO NOTHING;
