-- Clear mock marketing campaign data
TRUNCATE TABLE public.marketing_campaigns;

-- Clear mock SEO keywords if desired (optional, but requested for "dummy from Advertising & Promos")
TRUNCATE TABLE public.seo_keywords;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
