-- ============================================
-- MARKETING & SEO TABLES SETUP
-- Run this in your Supabase SQL editor
-- ============================================

-- 1. MARKETING CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('meta', 'instagram', 'google', 'email', 'other')) DEFAULT 'other',
    spend DECIMAL DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'paused', 'completed', 'draft')) DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ANALYTICS VISITS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL,
    source TEXT CHECK (source IN ('direct', 'organic', 'social', 'referral', 'paid')) DEFAULT 'direct',
    session_duration_seconds INTEGER DEFAULT 0,
    bounced BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEO KEYWORDS TABLE
CREATE TABLE IF NOT EXISTS public.seo_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL,
    rank INTEGER,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE RLS (Admin only access)
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (Admin Read/Write, Public can INSERT visits)
DROP POLICY IF EXISTS "Admin read campaigns" ON public.marketing_campaigns;
CREATE POLICY "Admin read campaigns" ON public.marketing_campaigns FOR ALL
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Public insert visits" ON public.analytics_visits;
CREATE POLICY "Public insert visits" ON public.analytics_visits FOR INSERT
WITH CHECK (true); -- Anyone can log a page visit

DROP POLICY IF EXISTS "Admin read visits" ON public.analytics_visits;
CREATE POLICY "Admin read visits" ON public.analytics_visits FOR SELECT
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admin manage keywords" ON public.seo_keywords;
CREATE POLICY "Admin manage keywords" ON public.seo_keywords FOR ALL
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 6. SEED INITIAL CAMPAIGN DATA
INSERT INTO public.marketing_campaigns (name, platform, spend, conversions, clicks, status) VALUES
('Meta - Spring Sale', 'meta', 25000, 450, 3800, 'active'),
('Instagram - Reels Ads', 'instagram', 18500, 320, 2900, 'active'),
('Google - Search Ads', 'google', 42000, 890, 5200, 'active'),
('Promotional Email', 'email', 5000, 120, 4500, 'active')
ON CONFLICT DO NOTHING;

-- 7. SEED INITIAL SEO KEYWORDS
INSERT INTO public.seo_keywords (keyword, rank, clicks, impressions) VALUES
('online math tutor', 1, 1200, 8900),
('best science classes', 3, 840, 6200),
('group study platform', 2, 720, 5100),
('learn physics online', 5, 610, 4300),
('JEE coaching online', 4, 580, 4100)
ON CONFLICT DO NOTHING;

-- 8. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
