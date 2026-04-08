-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id BIGINT REFERENCES tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    currency TEXT DEFAULT 'DKK' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT CHECK (type IN ('payment', 'payout', 'refund', 'bonus')),
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update tutors table with new fields
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS intro_video_url TEXT;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function to update tutor rating stats
CREATE OR REPLACE FUNCTION update_tutor_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tutors
    SET 
        avg_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE tutor_id = NEW.tutor_id),
        review_count = (SELECT COUNT(*) FROM reviews WHERE tutor_id = NEW.tutor_id)
    WHERE id = NEW.tutor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tutor stats on new review
DROP TRIGGER IF EXISTS tr_update_tutor_rating ON reviews;
CREATE TRIGGER tr_update_tutor_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_tutor_rating_stats();
