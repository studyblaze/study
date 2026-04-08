-- add_trial_confirmed_template.sql
-- Adds a specialized trial confirmation email template for tutors

INSERT INTO public.email_templates (type, subject, body, variables, description)
VALUES 
(
    'trial_confirmed_tutor', 
    '{{studentName}} confirmed a trial lesson!', 
    '<div style="background-color: #fdfcf8; padding: 20px; font-family: ''Inter'', sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="padding: 32px; text-align: center;">
            <h2 style="color: #1a202c; font-size: 24px; font-weight: 700; margin-bottom: 24px;">{{studentName}} confirmed a trial lesson!</h2>
            
            <div style="background-color: #fff5f7; border-left: 4px solid #f687b3; padding: 16px; margin-bottom: 24px; text-align: left;">
                <p style="color: #9b2c2c; font-size: 14px; margin: 0;">
                    <strong>!</strong> GroupTutors takes 100% commission for trial lessons.
                </p>
            </div>

            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                {{studentName}} confirmed that your trial lesson took place. Now''s a good time to motivate them to continue learning by <strong>subscribing to you!</strong>
            </p>

            <a href="{{siteUrl}}/messages" style="display: inline-block; background-color: #f687b3; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-bottom: 32px;">Send message</a>
            
            <div style="border-top: 1px solid #edf2f7; padding-top: 32px; text-align: left;">
                <h3 style="color: #2d3748; font-size: 18px; font-weight: 700; margin-bottom: 16px;">You''re approaching a lower commission rate!</h3>
                
                <div style="background-color: #fff5f7; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; align-items: center;">
                    <span style="margin-right: 12px;">✅</span>
                    <span style="color: #4a5568; font-size: 14px;">Current commission: 18%</span>
                </div>
                
                <div style="background-color: #fff5f7; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; align-items: center;">
                    <span style="margin-right: 12px;">📊</span>
                    <span style="color: #4a5568; font-size: 14px;">Your next milestone: Lower rate!</span>
                </div>
                
                <div style="background-color: #fff5f7; border-radius: 8px; padding: 12px; margin-bottom: 24px; display: flex; align-items: center;">
                    <span style="margin-right: 12px;">⏰</span>
                    <span style="color: #4a5568; font-size: 14px;">Lessons left to complete: 0 (Refresh to see update)</span>
                </div>

                <p style="color: #718096; font-size: 13px; margin-bottom: 16px;">Book a lesson to progress toward your next milestone.</p>
                <a href="{{siteUrl}}/tutor-dashboard/calendar" style="display: inline-block; background-color: #f687b3; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Book lesson</a>
            </div>
        </div>
    </div>
</div>', 
    '["studentName", "siteUrl"]'::jsonb, 
    'Specialized trial confirmation email for tutors.'
)
ON CONFLICT (type) DO UPDATE SET
    subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    variables = EXCLUDED.variables,
    description = EXCLUDED.description,
    updated_at = NOW();
