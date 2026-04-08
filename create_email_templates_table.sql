-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors on re-run
DROP POLICY IF EXISTS "Public Read Email Templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admin CRUD Email Templates" ON public.email_templates;

-- Allow public read
CREATE POLICY "Public Read Email Templates" ON public.email_templates FOR SELECT USING (true);

-- Allow admin updates
CREATE POLICY "Admin CRUD Email Templates" ON public.email_templates 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Insert or Update initial templates with the NEW professional logo header
INSERT INTO public.email_templates (type, subject, body, variables, description)
VALUES 
(
    'booking_received', 
    '📅 New Booking Received: {{topic}}', 
    '
    <div style="margin-bottom: 32px; display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <div style="width: 52px; height: 52px; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; display: block; background: #fff;">
            <img src="{{logoUrl}}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div>
            <span style="font-size: 20px; font-weight: 900; color: #1e293b; letter-spacing: -0.02em; display: block; line-height: 1;">GroupTutors</span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Premium Learning Platform</span>
        </div>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e293b; font-size: 24px; margin: 0;">New lesson scheduled!</h1>
    </div>
    <p style="font-size: 16px; color: #475569;">Hi {{tutorName}},</p>
    <p style="font-size: 16px; color: #475569;">Great news! <strong>{{studentName}}</strong> has just booked a new session with you. Here are the details:</p>
    
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background: #eff6ff; color: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin-right: 16px;">{{studentInitial}}</div>
            <div>
                <div style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Student</div>
                <div style="font-size: 18px; color: #1e293b; font-weight: 700;">{{studentName}}</div>
            </div>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <div style="margin-bottom: 12px;">
                <span style="color: #64748b; font-size: 14px; width: 80px; display: inline-block;">Topic:</span>
                <span style="color: #1e293b; font-weight: 600;">{{topic}}</span>
            </div>
            <div style="margin-bottom: 12px;">
                <span style="color: #64748b; font-size: 14px; width: 80px; display: inline-block;">Date:</span>
                <span style="color: #1e293b; font-weight: 600;">{{date}}</span>
            </div>
            <div>
                <span style="color: #64748b; font-size: 14px; width: 80px; display: inline-block;">Time:</span>
                <span style="color: #1e293b; font-weight: 600;">{{time}}</span>
            </div>
        </div>
    </div>

    <div style="text-align: center; margin-top: 32px;">
        <a href="https://grouplearn.vercel.app/tutor-dashboard" style="background: #4A0404; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block; box-shadow: 0 10px 15px -3px rgba(74, 4, 4, 0.3);">Open Calendar</a>
    </div>
    
    <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 32px;">Prepare for your lesson and reach out to your student if needed.</p>
    ', 
    '["tutorName", "studentName", "studentInitial", "topic", "date", "time"]'::jsonb, 
    'Sent to tutors when a student books a lesson.'
),
(
    'magic_link', 
    'Sign in to GroupTutors', 
    '
    <div style="margin-bottom: 32px; display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <div style="width: 52px; height: 52px; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; display: block; background: #fff;">
            <img src="{{logoUrl}}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div>
            <span style="font-size: 20px; font-weight: 900; color: #1e293b; letter-spacing: -0.02em; display: block; line-height: 1;">GroupTutors</span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Premium Learning Platform</span>
        </div>
    </div>

    <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello{{#if fullName}} <strong>{{fullName}}</strong>{{/if}},</p>
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">Click the button below to sign in. This link expires in 1 hour.</p>
    <div style="text-align: center; margin: 36px 0;">
        <a href="{{finalLink}}" style="background: #4B0000; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block; letter-spacing: 0.02em;">
            Sign In to GroupTutors
        </a>
    </div>
    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">If you didn''t request this, you can safely ignore this email.</p>
    ', 
    '["fullName", "finalLink"]'::jsonb, 
    'SENT TO TUTORS WHEN A USER REQUESTS A MAGIC LINK LOGIN.'
),
(
    'lesson_confirmed', 
    '💰 Payment Received: {{topic}}', 
    '
    <div style="margin-bottom: 32px; display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <div style="width: 52px; height: 52px; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; display: block; background: #fff;">
            <img src="{{logoUrl}}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div>
            <span style="font-size: 20px; font-weight: 900; color: #1e293b; letter-spacing: -0.02em; display: block; line-height: 1;">GroupTutors</span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Premium Learning Platform</span>
        </div>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e293b; font-size: 24px; margin: 0;">Lesson confirmed!</h1>
    </div>
    
    <p style="font-size: 16px; color: #475569;">Hi {{tutorName}},</p>
    <p style="font-size: 16px; color: #475569;">Good news! <strong>{{studentName}}</strong> has confirmed the completion of your lesson. Here are the session details:</p>

    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background: #f0fdf4; color: #166534; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin-right: 16px;">{{studentInitial}}</div>
            <div>
                <div style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Student</div>
                <div style="font-size: 18px; color: #1e293b; font-weight: 700;">{{studentName}}</div>
            </div>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <div style="margin-bottom: 12px;">
                <span style="color: #64748b; font-size: 14px; width: 80px; display: inline-block;">Topic:</span>
                <span style="color: #1e293b; font-weight: 600;">{{topic}}</span>
            </div>
            <div style="margin-bottom: 12px;">
                <span style="color: #64748b; font-size: 14px; width: 80px; display: inline-block;">Date:</span>
                <span style="color: #1e293b; font-weight: 600;">{{date}}</span>
            </div>
            <div>
                <span style="color: #64748b; font-size: 14px; width: 80px; display: inline-block;">Time:</span>
                <span style="color: #1e293b; font-weight: 600;">{{time}}</span>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
                <span style="color: #64748b; font-size: 14px; width: 80px; display: inline-block;">Amount:</span>
                <span style="color: #16a34a; font-weight: 800;">₹{{amount}}</span>
            </div>
        </div>
    </div>

    <div style="text-align: center; margin-top: 32px;">
        <a href="https://grouplearn.vercel.app/tutor-dashboard/wallet" style="background: #4A0404; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block;">View in Wallet</a>
    </div>

    <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 32px;">Payment has been automatically processed and added to your wallet.</p>
    ', 
    '["tutorName", "studentName", "studentInitial", "topic", "date", "time", "amount"]'::jsonb, 
    'Sent to tutors when a student confirms a lesson completion.'
),
(
    'withdrawal_otp',
    'Withdrawal: Access your earnings! 💰',
    '
    <div style="margin-bottom: 32px; display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <div style="width: 52px; height: 52px; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; display: block; background: #fff;">
            <img src="{{logoUrl}}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div>
            <span style="font-size: 20px; font-weight: 900; color: #1e293b; letter-spacing: -0.02em; display: block; line-height: 1;">GroupTutors</span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Premium Learning Platform</span>
        </div>
    </div>
    
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e293b; font-size: 24px; margin: 0;">Access your earnings!</h1>
    </div>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi {{fullName}},</p>
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">There was an attempt to withdraw funds from your account. Please use the verification code below to confirm it''s you:</p>
    
    <div style="text-align: center; margin: 32px 0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: inline-block; min-width: 240px;">
            <div style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Verification Code</div>
            <div style="font-size: 32px; font-weight: 900; color: #e11d48; letter-spacing: 0.2em;">{{code}}</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 12px;">Expires in 30 minutes</div>
        </div>
    </div>

    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">If you didn''t request this, please contact support immediately.</p>
    ',
    '["fullName", "code"]'::jsonb,
    'Sent when a tutor requests a withdrawal OTP.'
)
ON CONFLICT (type) DO UPDATE SET
    subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    variables = EXCLUDED.variables,
    description = EXCLUDED.description,
    updated_at = NOW();
