-- Update email_templates with PREMIUM DARK Preply-style designs
-- Incorporates Caveat font for logo and dark aesthetic from user screenshots

DELETE FROM public.email_templates WHERE type IN ('booking_received', 'booking_confirmed_student', 'lesson_confirmed', 'lesson_cancelled', 'lesson_rescheduled', 'withdrawal_otp', 'magic_link', 'admin_signup_alert');

INSERT INTO public.email_templates (type, subject, body, variables, description)
VALUES 
(
    'booking_received', 
    '📅 New Booking: {{studentName}} scheduled a lesson', 
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
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.02em;">New session scheduled!</h1>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Hi {{tutorName}}, {{studentName}} just booked a new lesson with you. Get ready to help them achieve their goals!
            </p>
            <div style="background: #262626; border: 1px solid #333; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div style="width: 48px; height: 48px; background: #ff4b82; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin-right: 16px;">{{studentInitial}}</div>
                    <div>
                        <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Student</div>
                        <div style="font-size: 18px; color: #ffffff; font-weight: 700;">{{studentName}}</div>
                    </div>
                </div>
                <div style="border-top: 1px solid #333; padding-top: 20px;">
                    <div style="margin-bottom: 8px;"><span style="color: #64748b; width: 100px; display: inline-block;">Topic:</span> <span style="color: #ffffff; font-weight: 600;">{{topic}}</span></div>
                    <div><span style="color: #64748b; width: 100px; display: inline-block;">When:</span> <span style="color: #ffffff; font-weight: 600;">{{date}} @ {{time}}</span></div>
                </div>
            </div>
            <a href="https://grouptutors.com/tutor-dashboard" style="background: #ff4b82; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(255, 75, 130, 0.3);">Open Calendar</a>
        </div>
    </div>
    <div style="max-width: 560px; margin: 32px auto 0; text-align: center; padding: 0 20px;">
        <p style="font-size: 11px; color: #4b5563; line-height: 1.6;">© 2026 GroupTutors Inc. | Mumbai | Aarhus</p>
    </div>
</body>
</html>', 
    '["tutorName", "studentName", "studentInitial", "topic", "date", "time"]'::jsonb, 
    'Premium dark notification for tutors when a student books a lesson.'
),
(
    'booking_confirmed_student', 
    '✅ Lesson Scheduled: {{topic}}', 
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
            <a href="https://grouptutors.com/resources" style="color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Resources</a>
            <a href="https://grouptutors.com/statistics" style="color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Statistics</a>
            <a href="https://grouptutors.com/community" style="color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Community</a>
        </div>
        <div style="padding: 0 40px 48px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 16px 0;">You''re all set!</h1>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Hi {{studentName}}, your lesson with {{tutorName}} is confirmed. We''ve added it to your dashboard.
            </p>
            <div style="background: #262626; border: 1px solid #333; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div style="width: 48px; height: 48px; background: #ff4b82; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin-right: 16px;">{{tutorInitial}}</div>
                    <div>
                        <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Tutor</div>
                        <div style="font-size: 18px; color: #ffffff; font-weight: 700;">{{tutorName}}</div>
                    </div>
                </div>
                <div style="border-top: 1px solid #333; padding-top: 20px;">
                    <div style="margin-bottom: 8px;"><span style="color: #64748b; width: 100px; display: inline-block;">Lesson:</span> <span style="color: #ffffff; font-weight: 600;">{{topic}}</span></div>
                    <div><span style="color: #64748b; width: 100px; display: inline-block;">Time:</span> <span style="color: #ffffff; font-weight: 600;">{{date}} @ {{time}}</span></div>
                </div>
            </div>
            <a href="https://grouptutors.com/dashboard" style="background: #ff4b82; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">Open Classroom</a>
        </div>
    </div>
    <div style="max-width: 560px; margin: 32px auto 0; text-align: center; padding: 0 20px;">
        <p style="font-size: 11px; color: #4b5563; line-height: 1.6;">© 2026 GroupTutors Inc. | Mumbai | Aarhus</p>
    </div>
</body>
</html>', 
    '["studentName", "tutorName", "tutorInitial", "topic", "date", "time"]'::jsonb, 
    'Premium dark notification for students when their booking is confirmed.'
),
(
    'withdrawal_otp', 
    '💰 Withdrawal: Access your earnings!', 
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
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 16px 0;">Access your earnings!</h1>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Hi {{fullName}}. There was an attempt to withdraw funds from your account. Please use the verification code below to confirm it''s you:
            </p>
            <div style="background: #262626; border: 1px solid #333; border-radius: 12px; padding: 24px; display: inline-block; min-width: 240px; margin: 8px 0;">
                <div style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Verification Code: <span style="color: #ff4b82; font-size: 24px;">{{code}}</span></div>
                <div style="font-size: 12px; color: #64748b;">This code will expire in 30 minutes.</div>
            </div>
            <p style="color: #64748b; font-size: 14px; margin-top: 32px;">If this wasn''t you, please email our support team at <a href="mailto:contact@grouptutors.com" style="color: #ff4b82; text-decoration: none; font-weight: 500;">contact@grouptutors.com</a>.</p>
        </div>
    </div>
</body>
</html>', 
    '["fullName", "code"]'::jsonb, 
    'Premium dark withdrawal OTP verification email.'
),
(
    'magic_link', 
    '✨ Sign in to GroupTutors', 
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
        <div style="padding: 0 40px 48px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 16px 0;">Welcome back!</h1>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Hi {{fullName}}, click the button below to sign in to your GroupTutors account.
            </p>
            <a href="{{finalLink}}" style="background: #ff4b82; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(255, 75, 130, 0.3);">Sign In Now</a>
            <p style="color: #64748b; font-size: 12px; margin-top: 32px;">This link will expire soon. If the button doesn''t work, copy this URL: {{finalLink}}</p>
        </div>
    </div>
</body>
</html>', 
    '["fullName", "finalLink"]'::jsonb, 
    'Premium dark magic link sign-in email.'
),
(
    'lesson_cancelled', 
    '❌ Lesson Cancelled: {{topic}}', 
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
        <div style="padding: 0 40px 48px; text-align: center;">
            <h1 style="color: #ef4444; font-size: 28px; font-weight: 800; margin: 0 0 16px 0;">Lesson Cancelled</h1>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Hi {{recipientName}}, we''re sorry to inform you that your lesson on "<strong>{{topic}}</strong>" has been cancelled by {{actorName}}.
            </p>
            <div style="background: #271c1c; border: 1px solid #451a1a; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
                <div style="display: flex; align-items: center;">
                    <div style="width: 48px; height: 48px; background: #ef4444; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px;">📅</div>
                    <div>
                        <div style="font-size: 12px; color: #ef4444; font-weight: 600; text-transform: uppercase;">Cancelled Session</div>
                        <div style="font-size: 16px; color: #ffffff; font-weight: 700;">{{date}} @ {{time}}</div>
                    </div>
                </div>
            </div>
            <a href="https://grouptutors.com/dashboard" style="background: #374151; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">Check Dashboard</a>
        </div>
    </div>
</body>
</html>', 
    '["recipientName", "actorName", "topic", "date", "time"]'::jsonb, 
    'Premium dark lesson cancellation email.'
),
(
    'lesson_rescheduled', 
    '🗓️ Lesson Rescheduled: {{topic}}', 
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
        <div style="padding: 0 40px 48px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 16px 0;">Lesson Rescheduled</h1>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Hi {{recipientName}}, {{actorName}} has moved your lesson on "<strong>{{topic}}</strong>" to a new time.
            </p>
            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Old Time</div>
                        <div style="font-size: 14px; color: #6b7280; text-decoration: line-through;">{{oldDate}} {{oldTime}}</div>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 11px; color: #3b82f6; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">New Time</div>
                        <div style="font-size: 14px; color: #ffffff; font-weight: 700;">{{newDate}} {{newTime}}</div>
                    </div>
                </div>
            </div>
            <a href="https://grouptutors.com/dashboard" style="background: #ff4b82; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">Update Calendar</a>
        </div>
    </div>
</body>
</html>', 
    '["recipientName", "actorName", "topic", "oldDate", "oldTime", "newDate", "newTime"]'::jsonb, 
    'Premium dark lesson reschedule email.'
),
(
    'admin_signup_alert', 
    '🔔 New {{role}} Signup: {{fullName}}', 
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
        <div style="padding: 0 40px 48px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 16px 0;">New User Registration</h1>
            <div style="background: #262626; border: 1px solid #333; border-radius: 20px; padding: 24px; text-align: left;">
                <p style="margin: 8px 0; color: #94a3b8;"><strong style="color: #64748b; width: 100px; display: inline-block;">Name:</strong> <span style="color: #ffffff; font-weight: 600;">{{fullName}}</span></p>
                <p style="margin: 8px 0; color: #94a3b8;"><strong style="color: #64748b; width: 100px; display: inline-block;">Email:</strong> <span style="color: #ffffff; font-weight: 600;">{{email}}</span></p>
                <p style="margin: 8px 0; color: #94a3b8;"><strong style="color: #64748b; width: 100px; display: inline-block;">Role:</strong> <span style="color: #ff4b82; font-weight: 800; text-transform: uppercase;">{{role}}</span></p>
                <p style="margin: 8px 0; color: #94a3b8;"><strong style="color: #64748b; width: 100px; display: inline-block;">Country:</strong> <span style="color: #ffffff; font-weight: 600;">{{country}}</span></p>
                <p style="margin: 8px 0; color: #94a3b8;"><strong style="color: #64748b; width: 100px; display: inline-block;">Timezone:</strong> <span style="color: #ffffff; font-weight: 600;">{{timezone}}</span></p>
            </div>
            <p style="font-size: 12px; color: #4b5563; text-align: center; margin-top: 32px;">
                This is an automated internal alert from GroupTutors.
            </p>
        </div>
    </div>
</body>
</html>', 
    '["fullName", "email", "role", "country", "timezone"]'::jsonb, 
    'Premium dark notification for admins when a new user signs up.'
);
