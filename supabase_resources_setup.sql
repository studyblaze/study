-- Setup Resource Library Table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g. Math, English, Science
    type TEXT NOT NULL, -- e.g. PDF, IMG, WEB, ZIP
    size TEXT, -- e.g. 2.4 MB
    url TEXT, -- Link to the resource file/page
    icon_name TEXT, -- Lucide icon name if applicable
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view resources"
    ON public.resources FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to resources"
    ON public.resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Insert dummy data for initialization
INSERT INTO public.resources (title, category, type, size, icon_name, order_index)
VALUES 
('Algebra Fundamentals', 'Math', 'PDF', '2.4 MB', 'Library', 1),
('Grammar & Syntax Guide', 'English', 'PDF', '1.8 MB', 'Library', 2),
('Periodic Table Interactive', 'Science', 'WEB', '420 KB', 'Library', 3),
('Historical Timeline', 'History', 'IMG', '5.2 MB', 'Library', 4);
