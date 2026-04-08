const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const body = `
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
    <p style="font-size: 16px; color: #475569;">Hi {{studentName}},</p>
    <p style="font-size: 16px; color: #475569;">Your lesson with <strong>{{tutorName}}</strong> has been successfully scheduled. Here are the details:</p>
    
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background: #eff6ff; color: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin-right: 16px;">{{tutorInitial}}</div>
            <div>
                <div style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Tutor</div>
                <div style="font-size: 18px; color: #1e293b; font-weight: 700;">{{tutorName}}</div>
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
        <a href="{{siteUrl}}/dashboard" style="background: #4A0404; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block; box-shadow: 0 10px 15px -3px rgba(74, 4, 4, 0.3);">Go to Dashboard</a>
    </div>
    
    <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 32px;">Please be online 5 minutes before the start time. Happy learning!</p>
`;

    const { error } = await supabase.from('email_templates').upsert({ 
        type: 'booking_confirmed_student', 
        subject: '✅ Lesson Scheduled: {{topic}}', 
        body: body 
    }, { onConflict: 'type' });

    if (error) console.error('Error:', error);
    else console.log('Template created/updated successfully');
}

run();
