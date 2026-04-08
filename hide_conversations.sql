
-- Table to hide conversations for admins
CREATE TABLE IF NOT EXISTS admin_hidden_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(admin_id, participant_id)
);

-- Enable RLS
ALTER TABLE admin_hidden_conversations ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage hidden conversations') THEN
        CREATE POLICY "Admins can manage hidden conversations" ON admin_hidden_conversations
            FOR ALL TO authenticated
            USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
            WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;
