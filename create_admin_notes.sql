-- Create admin_notes table
CREATE TABLE IF NOT EXISTS public.admin_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    is_pinned BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Policies for admin_notes (Only admins can manage)
CREATE POLICY "Admins can manage admin_notes" ON public.admin_notes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create storage bucket for admin notes attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-notes-attachments', 'admin-notes-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admin Notes Attachments Upload" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'admin-notes-attachments' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin Notes Attachments Public Access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'admin-notes-attachments');

CREATE POLICY "Admin Notes Attachments Delete" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'admin-notes-attachments' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
