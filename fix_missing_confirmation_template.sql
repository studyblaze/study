-- fix_missing_confirmation_template.sql
-- Restores the missing 'lesson_confirmed' template with premium dark styling

INSERT INTO public.email_templates (type, subject, body, variables, description)
VALUES 
(
    'lesson_confirmed', 
    '💰 Payment Received: {{topic}}', 
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="background: #111827; padding: 40px 10px; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; margin: 0; color: #ffffff;">
    <div style="max-width: 560px; margin: auto; background: #1a1a1a; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); border: 1px solid #333;">
        <div style="padding: 32px 40px 12px; text-align: center;">
            <a href="https://grouptutors.com" style="text-decoration: none; display: inline-block;">
                <span style="font-family: ''Caveat'', cursive; font-size: 42px; color: #ffffff; font-weight: 700; line-height: 1;">Group</span><span style="font-family: ''Caveat'', cursive; font-size: 42px; color: #ff4b82; font-weight: 700; margin-left: -2px; line-height: 1;">Tutors</span>
            </a>
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://grouptutors.com/tutor-dashboard/training" style="color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Resources</a>
            <a href="https://grouptutors.com/tutor-dashboard/insights" style="color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Statistics</a>
            <a href="https://grouptutors.com/tutor-dashboard/community" style="color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Community</a>
        </div>
        <div style="padding: 0 40px 48px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.02em;">Lesson confirmed & paid!</h1>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Hi {{tutorName}}, {{studentName}} has confirmed the lesson completion. Your payment has been added to your wallet.
            </p>
            <div style="background: #262626; border: 1px solid #333; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div style="width: 48px; height: 48px; background: #10b981; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin-right: 16px;">{{studentInitial}}</div>
                    <div>
                        <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Student</div>
                        <div style="font-size: 18px; color: #ffffff; font-weight: 700;">{{studentName}}</div>
                    </div>
                </div>
                <div style="border-top: 1px solid #333; padding-top: 20px;">
                    <div style="margin-bottom: 8px;"><span style="color: #64748b; width: 100px; display: inline-block;">Lesson:</span> <span style="color: #ffffff; font-weight: 600;">{{topic}}</span></div>
                    <div><span style="color: #64748b; width: 100px; display: inline-block;">Earnings:</span> <span style="color: #10b981; font-weight: 800;">₹{{amount}}</span></div>
                </div>
            </div>
            <a href="https://grouptutors.com/tutor-dashboard/wallet" style="background: #ff4b82; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(255, 75, 130, 0.3);">View Wallet</a>
        </div>
    </div>
    <div style="max-width: 560px; margin: 32px auto 0; text-align: center; padding: 0 20px;">
        <p style="font-size: 11px; color: #4b5563; line-height: 1.6;">© 2026 GroupTutors Inc. | Mumbai | Aarhus</p>
    </div>
</body>
</html>', 
    '["tutorName", "studentName", "studentInitial", "topic", "amount"]'::jsonb, 
    'Premium dark notification for tutors when a lesson is confirmed by the student.'
)
ON CONFLICT (type) DO UPDATE SET
    subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    variables = EXCLUDED.variables,
    description = EXCLUDED.description,
    updated_at = NOW();
