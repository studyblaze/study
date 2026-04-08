-- corrected Master SQL Migration for Unified Email Templates
-- This script ensures ALL system emails use the new Modern Light Burgundy theme.
-- Fix: Using to_jsonb() to cast ARRAY text to jsonb for the variables column.

DO $$
DECLARE
    -- The shared CSS and Header/Footer parts
    v_template_start TEXT := '<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>body{margin:0;padding:0;background-color:#f2f5f8;font-family:''Inter'',sans-serif;-webkit-font-smoothing:antialiased}.wrapper{width:100%;background-color:#f2f5f8;padding-bottom:60px}.main-container{max-width:600px;margin:0 auto;text-align:center}.header{padding:40px 0 20px}.logo-text{font-family:''Caveat'',cursive;font-size:44px;font-weight:700}.nav-links{margin-top:10px;margin-bottom:30px}.nav-link{color:#2563eb;text-decoration:none;font-size:14px;font-weight:500;margin:0 12px}.card{background:#ffffff;border:1px solid #e1e7ec;border-radius:32px;padding:60px 48px;box-shadow:0 12px 40px rgba(0,0,0,0.04);margin-bottom:40px}h1{color:#111827;font-size:32px;font-weight:800;margin:0 0 24px;letter-spacing:-0.02em}p{color:#4b5563;font-size:16px;line-height:1.7;margin-bottom:32px;max-width:440px;margin-left:auto;margin-right:auto}.button{background:#4a0404;color:#ffffff !important;padding:18px 54px;border-radius:16px;text-decoration:none;font-weight:700;font-size:17px;display:inline-block;box-shadow:0 10px 20px rgba(74,4,4,0.15)}.social-icons{margin-bottom:24px}.social-icon{display:inline-block;margin:0 8px;width:32px;height:32px;vertical-align:middle}.footer-info{color:#64748b;font-size:12px;line-height:1.8;margin-bottom:40px}.footer-link{color:#2563eb;text-decoration:none;font-weight:500}.app-section{border-top:1px solid #e1e7ec;padding-top:40px}.app-title{font-size:11px;font-weight:700;color:#111827;letter-spacing:0.15em;margin-bottom:20px}.app-badge{height:44px;margin:0 8px;vertical-align:middle}</style></head><body><div class="wrapper"><div class="main-container"><div class="header"><div class="logo-text"><span style="color:#111827">Group</span><span style="color:#4a0404;margin-left:-2px">Tutors</span></div><div class="nav-links"><a href="https://grouptutors.com/resources" class="nav-link">Resources</a><a href="https://grouptutors.com/statistics" class="nav-link">Statistics</a><a href="https://grouptutors.com/community" class="nav-link">Community</a></div></div><div class="card">';
    
    v_template_end TEXT := '</div><div class="social-icons"><a href="https://www.facebook.com/Grouptutors/"><img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" class="social-icon"></a><a href="https://www.instagram.com/grouptutors_com/"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" class="social-icon"></a><a href="https://linkedin.com/company/grouptutors"><img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" class="social-icon"></a><a href="https://www.youtube.com/@GroupTutors"><img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" class="social-icon"></a></div><div class="footer-info">Subscribed email address: <span style="color:#2563eb">{{email}}</span><br><div style="margin-top:10px"><a href="https://grouptutors.com/dashboard/settings" class="footer-link">Manage notifications</a> | <a href="https://grouptutors.com/contact" class="footer-link">Contact us</a></div><div style="margin-top:25px;opacity:0.82">Copyright © 2026 GroupTutors Inc.<br>Mumbai, India | Aarhus, Denmark<br><span style="font-size:11px;opacity:0.6">Please do not forward or share this email as it is intended to be used only by you.</span></div></div><div class="app-section"><div class="app-title">GET THE MOBILE APP</div><a href="https://apps.apple.com/app/grouptutors"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" class="app-badge"></a><a href="https://play.google.com/store/apps/details?id=com.grouptutors"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" class="app-badge"></a></div></div></div></body></html>';
BEGIN

    -- CORE TRANSACTIONAL
    
    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('magic_link', 'Your Sign In Link', v_template_start || '<h1>Welcome back!</h1><p>Click the button below to sign in to your GroupTutors account instantly. This link is valid for 15 minutes.</p><a href="{{finalLink}}" class="button">Sign In Now</a>' || v_template_end, to_jsonb(ARRAY['finalLink', 'email']), 'Sent when a user requests a magic link login.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('withdrawal_otp', 'Security Verification Code', v_template_start || '<h1>Withdrawal Request</h1><p>Hi {{name}}, use the security code below to authorize your withdrawal request.</p><div style="font-size:40px;font-weight:800;color:#4a0404;margin:20px 0;letter-spacing:10px">{{otp}}</div><p style="font-size:12px;color:#94a3b8">If you did not request this, please contact support immediately.</p>' || v_template_end, to_jsonb(ARRAY['name', 'otp', 'email']), 'One-time password for student/tutor withdrawals.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('admin_signup_alert', 'New Platform Registration', v_template_start || '<h1>New User Joined!</h1><p>A new user has just created an account on GroupTutors.</p><p style="text-align:left;background:#f8fafc;padding:20px;border-radius:12px"><strong>Name:</strong> {{name}}<br><strong>Email:</strong> {{email}}</p><a href="https://grouptutors.com/admin" class="button">View Admin Panel</a>' || v_template_end, to_jsonb(ARRAY['name', 'email']), 'Internal alert sent to admins when a new user signs up.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    -- BOOKINGS & LESSONS

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('booking_received', 'New Booking Received!', v_template_start || '<h1>New Booking!</h1><p>Hi {{tutorName}}, you have received a new booking for <strong>{{topic}}</strong> on <strong>{{date}}</strong> at <strong>{{time}}</strong>.</p><a href="https://grouptutors.com/dashboard" class="button">Accept Booking</a>' || v_template_end, to_jsonb(ARRAY['tutorName', 'studentName', 'topic', 'date', 'time', 'email']), 'Sent to tutor when a student books a session.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('booking_confirmed_student', 'Your Lesson is Confirmed', v_template_start || '<h1>Booking Confirmed</h1><p>Hi {{studentName}}, your lesson for <strong>{{topic}}</strong> with {{tutorName}} is confirmed for <strong>{{date}}</strong> at <strong>{{time}}</strong>.</p><a href="https://grouptutors.com/dashboard" class="button">Go to Dashboard</a>' || v_template_end, to_jsonb(ARRAY['studentName', 'tutorName', 'topic', 'date', 'time', 'email']), 'Sent to student after a successful booking.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('lesson_confirmed', 'Payment Processed Successfully', v_template_start || '<h1>Payment Success</h1><p>Hi {{tutorName}}, the payment for {{topic}} with {{studentName}} has been successfully processed.</p><a href="https://grouptutors.com/dashboard" class="button">View Details</a>' || v_template_end, to_jsonb(ARRAY['tutorName', 'studentName', 'topic', 'amount', 'email']), 'Sent to tutor when payment is confirmed.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('trial_confirmed_tutor', 'New Free Trial Scheduled', v_template_start || '<h1>Trial Confirmed</h1><p>Hi {{tutorName}}, a new student has booked a free trial for <strong>{{topic}}</strong>.</p><a href="https://grouptutors.com/dashboard" class="button">View Schedule</a>' || v_template_end, to_jsonb(ARRAY['tutorName', 'studentName', 'topic', 'email']), 'Sent to tutor when a free trial is booked.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('lesson_cancelled', 'Lesson Cancellation Notice', v_template_start || '<h1>Lesson Cancelled</h1><p>Hi {{recipientName}}, the lesson for <strong>{{topic}}</strong> scheduled for {{date}} at {{time}} has been cancelled by {{actorName}}.</p><a href="https://grouptutors.com/dashboard" class="button">View Dashboard</a>' || v_template_end, to_jsonb(ARRAY['recipientName', 'actorName', 'topic', 'date', 'time', 'email']), 'Sent to both parties when a lesson is cancelled.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('lesson_rescheduled', 'Lesson Time Updated', v_template_start || '<h1>Lesson Rescheduled</h1><p>Hi {{recipientName}}, the lesson for <strong>{{topic}}</strong> has been rescheduled by {{actorName}}.</p><p style="font-size:14px;color:#94a3b8">Old: {{oldDate}} {{oldTime}}<br>New: <strong>{{newDate}} {{newTime}}</strong></p><a href="https://grouptutors.com/dashboard" class="button">Accept Changes</a>' || v_template_end, to_jsonb(ARRAY['recipientName', 'actorName', 'topic', 'oldDate', 'oldTime', 'newDate', 'newTime', 'email']), 'Sent to both parties when a lesson is rescheduled.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('class_starting_soon', 'Reminder: Class Starts in 1 Hour', v_template_start || '<h1>Starting Soon!</h1><p>Hi {{name}}, your lesson for <strong>{{topic}}</strong> starts in just one hour. Get ready!</p><a href="{{roomLink}}" class="button">Join Classroom Now</a>' || v_template_end, to_jsonb(ARRAY['name', 'topic', 'tutorName', 'startTime', 'roomLink', 'email']), 'Reminder sent 1 hour before a lesson.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    -- LIFECYCLE & ONBOARDING

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('welcome_student', 'Welcome to GroupTutors!', v_template_start || '<h1>Welcome Aboard!</h1><p>Hi {{name}}, you are now part of the world''s #1 group tutoring platform. Find your expert tutor and start learning today!</p><a href="https://grouptutors.com/tutors" class="button">Browse Tutors</a>' || v_template_end, to_jsonb(ARRAY['name', 'email']), 'Sent to new students after registration.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('welcome_tutor', 'Application Received', v_template_start || '<h1>Application Received</h1><p>Hi {{name}}, thank you for applying to be a tutor! Our team will review your application within 48 hours.</p><a href="https://grouptutors.com/dashboard" class="button">Complete Profile</a>' || v_template_end, to_jsonb(ARRAY['name', 'email']), 'Sent to tutors after submitting their application.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('post_class_review', 'How was your lesson?', v_template_start || '<h1>Rate Your Lesson</h1><p>Hi {{studentName}}, you just finished a session with {{tutorName}}. How was it? Leave a review to help others!</p><a href="{{reviewLink}}" class="button">Write a Review</a>' || v_template_end, to_jsonb(ARRAY['studentName', 'tutorName', 'topic', 'duration', 'reviewLink', 'email']), 'Sent after a lesson is completed.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('tutor_retention_reminder', 'Help your students progress', v_template_start || '<h1>Boost Enrollments</h1><p>Hi {{tutorName}}, some of your students haven''t scheduled a lesson recently. Reach out to them to keep the momentum going!</p><a href="https://grouptutors.com/dashboard/messages" class="button">Send Messages</a>' || v_template_end, to_jsonb(ARRAY['tutorName', 'studentNames', 'email']), 'Sent to tutors when students become inactive.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    -- SUBSCRIPTION & BILLING

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('subscription_reactivated', 'Student Reactivated!', v_template_start || '<h1>Great News!</h1><p>A student has reactivated their subscription to learn with you. Check your calendar for new bookings.</p><a href="https://grouptutors.com/dashboard" class="button">View Dashboard</a>' || v_template_end, to_jsonb(ARRAY['studentName', 'planDetails', 'renewalDate', 'email']), 'Sent to tutor when a student reactivates.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('subscription_downgraded', 'Subscription Plan Update', v_template_start || '<h1>Plan Updated</h1><p>A student has updated their learning plan. They are still learning with you but on a modified schedule.</p><a href="https://grouptutors.com/dashboard" class="button">Check Plan</a>' || v_template_end, to_jsonb(ARRAY['studentName', 'newHours', 'email']), 'Sent to tutor when a student changes plan.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('payment_receipt', 'Invoice for your Payment', v_template_start || '<h1>Payment Receipt</h1><p>Thank you for your payment. Your transaction has been processed and a receipt is attached below.</p><a href="https://grouptutors.com/dashboard/billing" class="button">View Invoices</a>' || v_template_end, to_jsonb(ARRAY['name', 'amount', 'description', 'transactionId', 'date', 'method', 'email']), 'Formal receipt sent after checkout.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('calendar_density_alert', 'Calendar is Filling Up!', v_template_start || '<h1>High Demand!</h1><p>Your calendar is almost full for the coming week. Consider adding more slots to accommodate your regular students.</p><a href="https://grouptutors.com/dashboard/calendar" class="button">Manage Calendar</a>' || v_template_end, to_jsonb(ARRAY['studentNames', 'email']), 'Sent to tutors when availability is low.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    -- MARKETING & SYSTEM

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('abandoned_booking', 'Ready to start learning?', v_template_start || '<h1>Finish Your Booking</h1><p>Hi {{name}}, we noticed you didn''t complete your booking. Your expert tutor is waiting for you!</p><a href="https://grouptutors.com/tutors" class="button">Resume Booking</a>' || v_template_end, to_jsonb(ARRAY['name', 'email']), 'Sent when a user leaves the checkout process.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('admin_alert', 'System Alert: Action Required', v_template_start || '<h1>System Notification</h1><p>A system event occurred that requires your attention. Check the details table below.</p><a href="https://grouptutors.com/admin" class="button">Admin Dashboard</a>' || v_template_end, to_jsonb(ARRAY['error', 'details', 'email']), 'Internal system failure alert.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

    INSERT INTO public.email_templates (type, subject, body, variables, description)
    VALUES ('milestone_reached', 'Congratulations on your Milestone!', v_template_start || '<h1>Amazing Work!</h1><p>You have just reached a major learning milestone on GroupTutors. Check your dashboard for your new badge!</p><a href="https://grouptutors.com/dashboard" class="button">View Achievement</a>' || v_template_end, to_jsonb(ARRAY['name', 'count', 'reward', 'email']), 'Sent when a student hits a lesson count milestone.')
    ON CONFLICT (type) DO UPDATE SET body = EXCLUDED.body, subject = EXCLUDED.subject, variables = EXCLUDED.variables, description = EXCLUDED.description;

END $$;
