-- Update email_templates with PREMIUM Preply-style designs
INSERT INTO public.email_templates (type, subject, body, variables, description)
VALUES 
(
    'booking_received', 
    '📅 New Booking: {{studentName}} scheduled a lesson', 
    '
    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
            <!-- Logo Header -->
            <div style="text-align: center; margin-bottom: 32px;">
                <img src="{{logoUrl}}" alt="GroupTutors" style="height: 40px; width: auto;" />
                <div style="margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Premium Learning Platform</div>
            </div>

            <!-- Main Card -->
            <div style="background-color: #ffffff; border-radius: 24px; padding: 48px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #f1f5f9;">
                <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; text-align: center; letter-spacing: -0.02em;">Your student scheduled a new lesson</h1>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
                    Hi {{tutorName}}, prepare for more excellent teaching. Make sure you check the lesson details and reach out to your student if you need to.
                </p>

                <!-- Lesson Info Box -->
                <div style="background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 24px; margin-bottom: 32px;">
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <div style="width: 48px; height: 48px; background-color: #e11d48; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin-right: 16px; flex-shrink: 0;">{{studentInitial}}</div>
                        <div style="flex: 1;">
                            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">Student</div>
                            <div style="font-size: 18px; color: #1e293b; font-weight: 700;">{{studentName}}</div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; display: grid; gap: 12px;">
                        <div style="display: flex; align-items: center;">
                            <span style="font-size: 14px; color: #64748b; width: 100px;">Topic:</span>
                            <span style="font-size: 14px; color: #1e293b; font-weight: 600;">{{topic}}</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <span style="font-size: 14px; color: #64748b; width: 100px;">Lesson time:</span>
                            <span style="font-size: 14px; color: #1e293b; font-weight: 600;">{{date}} {{time}}</span>
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <div style="text-align: center;">
                    <a href="{{siteUrl}}/tutor-dashboard" style="background-color: #ff4b82; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(255, 75, 130, 0.2);">
                        Open calendar
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px;">
                <div style="margin-bottom: 20px;">
                    <a href="#" style="margin: 0 12px; text-decoration: none; color: #94a3b8;">Instagram</a>
                    <a href="#" style="margin: 0 12px; text-decoration: none; color: #94a3b8;">LinkedIn</a>
                    <a href="#" style="margin: 0 12px; text-decoration: none; color: #94a3b8;">YouTube</a>
                </div>
                <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    © 2026 GroupTutors Inc.<br/>
                    This is an automated notification. Please do not reply.
                </p>
            </div>
        </div>
    </div>
    ', 
    '["tutorName", "studentName", "studentInitial", "topic", "date", "time"]'::jsonb, 
    'Premium notification for tutors when a student books a lesson.'
),
(
    'booking_confirmed_student', 
    '✅ Lesson Scheduled: {{topic}}', 
    '
    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 32px;">
                <img src="{{logoUrl}}" alt="GroupTutors" style="height: 40px; width: auto;" />
            </div>

            <div style="background-color: #ffffff; border-radius: 24px; padding: 48px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #f1f5f9;">
                <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">Your lesson is scheduled!</h1>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
                    Hi {{studentName}}, you''re all set for your lesson with {{tutorName}}. Get ready to learn and achieve your goals.
                </p>

                <div style="background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 24px; margin-bottom: 32px;">
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <div style="width: 48px; height: 48px; background-color: #e11d48; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin-right: 16px;">{{tutorInitial}}</div>
                        <div style="flex: 1;">
                            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Tutor</div>
                            <div style="font-size: 18px; color: #1e293b; font-weight: 700;">{{tutorName}}</div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; display: grid; gap: 12px;">
                        <div>
                            <span style="font-size: 14px; color: #64748b; width: 100px; display: inline-block;">Topic:</span>
                            <span style="font-size: 14px; color: #1e293b; font-weight: 600;">{{topic}}</span>
                        </div>
                        <div>
                            <span style="font-size: 14px; color: #64748b; width: 100px; display: inline-block;">Time:</span>
                            <span style="font-size: 14px; color: #1e293b; font-weight: 600;">{{date}} {{time}}</span>
                        </div>
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="{{siteUrl}}/dashboard" style="background-color: #ff4b82; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
                        Open classroom
                    </a>
                </div>
            </div>
        </div>
    </div>
    ', 
    '["studentName", "tutorName", "tutorInitial", "topic", "date", "time"]'::jsonb, 
    'Premium notification for students when their booking is confirmed.'
),
(
    'lesson_confirmed', 
    '💰 Payment Received: {{topic}}', 
    '
    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 32px;">
                <img src="{{logoUrl}}" alt="GroupTutors" style="height: 40px; width: auto;" />
            </div>

            <div style="background-color: #ffffff; border-radius: 24px; padding: 48px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #f1f5f9;">
                <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">Lesson confirmed & paid!</h1>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
                    Hi {{tutorName}}, {{studentName}} has confirmed the lesson completion. Your payment has been added to your wallet.
                </p>

                <div style="background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 24px; margin-bottom: 32px;">
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <div style="width: 48px; height: 48px; background-color: #10b981; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin-right: 16px;">{{studentInitial}}</div>
                        <div style="flex: 1;">
                            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Student</div>
                            <div style="font-size: 18px; color: #1e293b; font-weight: 700;">{{studentName}}</div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; display: grid; gap: 12px;">
                        <div>
                            <span style="font-size: 14px; color: #64748b; width: 100px; display: inline-block;">Lesson:</span>
                            <span style="font-size: 14px; color: #1e293b; font-weight: 600;">{{topic}}</span>
                        </div>
                        <div>
                            <span style="font-size: 14px; color: #64748b; width: 100px; display: inline-block;">Earnings:</span>
                            <span style="font-size: 18px; color: #10b981; font-weight: 800;">₹{{amount}}</span>
                        </div>
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="{{siteUrl}}/tutor-dashboard/wallet" style="background-color: #ff4b82; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
                        View Wallet
                    </a>
                </div>
            </div>
        </div>
    </div>
    ', 
    '["tutorName", "studentName", "studentInitial", "topic", "amount"]'::jsonb, 
    'Premium notification for tutors when a lesson is confirmed by the student.'
),
(
    'lesson_cancelled', 
    '❌ Lesson Cancelled: {{topic}}', 
    '
    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 32px;">
                <img src="{{logoUrl}}" alt="GroupTutors" style="height: 40px; width: auto;" />
            </div>

            <div style="background-color: #ffffff; border-radius: 24px; padding: 48px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #f1f5f9;">
                <h1 style="color: #ef4444; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">Lesson has been cancelled</h1>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
                    Hi {{recipientName}}, we''re sorry to inform you that your lesson on "<strong>{{topic}}</strong>" has been cancelled by {{actorName}}.
                </p>

                <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 20px; padding: 24px; margin-bottom: 32px;">
                    <div style="display: flex; align-items: center;">
                        <div style="width: 48px; height: 48px; background-color: #ef4444; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px;">📅</div>
                        <div>
                            <div style="font-size: 12px; color: #ef4444; font-weight: 600; text-transform: uppercase;">Cancelled Session</div>
                            <div style="font-size: 16px; color: #1e293b; font-weight: 700;">{{date}} @ {{time}}</div>
                        </div>
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="{{siteUrl}}/dashboard" style="background-color: #1e293b; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
                        Check my dashboard
                    </a>
                </div>
            </div>
        </div>
    </div>
    ', 
    '["recipientName", "actorName", "topic", "date", "time"]'::jsonb, 
    'Premium notification for when a lesson is cancelled.'
),
(
    'lesson_rescheduled', 
    '🗓️ Lesson Rescheduled: {{topic}}', 
    '
    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 32px;">
                <img src="{{logoUrl}}" alt="GroupTutors" style="height: 40px; width: auto;" />
            </div>

            <div style="background-color: #ffffff; border-radius: 24px; padding: 48px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #f1f5f9;">
                <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">Lesson has been rescheduled</h1>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
                    Hi {{recipientName}}, {{actorName}} has moved your lesson on "<strong>{{topic}}</strong>" to a new time.
                </p>

                <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 20px; padding: 24px; margin-bottom: 32px;">
                    <div style="display: flex; gap: 20px;">
                        <div style="flex: 1;">
                            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Previous Time</div>
                            <div style="font-size: 14px; color: #94a3b8; text-decoration: line-through;">{{oldDate}} {{oldTime}}</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 11px; color: #2563eb; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">New Time</div>
                            <div style="font-size: 14px; color: #1e293b; font-weight: 700;">{{newDate}} {{newTime}}</div>
                        </div>
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="{{siteUrl}}/dashboard" style="background-color: #ff4b82; color: #ffffff; padding: 16px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
                        Update my calendar
                    </a>
                </div>
            </div>
        </div>
    </div>
    ', 
    '["recipientName", "actorName", "topic", "oldDate", "oldTime", "newDate", "newTime"]'::jsonb, 
    'Premium notification for when a lesson is rescheduled.'
)
ON CONFLICT (type) DO UPDATE SET
    subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    variables = EXCLUDED.variables,
    description = EXCLUDED.description,
    updated_at = NOW();
