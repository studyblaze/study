-- UNIFY_EMAILS_AS_FRAGMENTS.sql
-- This script strips the standard <html>/<body> boiler-plate from email templates
-- to allow the central responsive wrapper in /api/email to take over.

UPDATE email_templates
SET body = regexp_replace(
    regexp_replace(
        regexp_replace(
            body, 
            '^.*<div class="body-content"[^>]*>', 
            '', 
            'is'
        ), 
        '</div>\s*</div>\s*<!-- Footer -->.*$', 
        '', 
        'is'
    ),
    '</body>.*$',
    '',
    'is'
)
WHERE body LIKE '%<html%';

-- Specific cleanup for common templates if needed
UPDATE email_templates
SET body = TRIM(body);

-- Update hardcoded app links to point to the new /apps page
UPDATE email_templates
SET body = replace(
    replace(body, 'https://apps.apple.com', 'https://grouptutors.com/apps'),
    'https://play.google.com', 'https://grouptutors.com/apps'
);
