INSERT INTO public.email_templates (type, subject, body)
VALUES ('admin_signup_alert', '🔔 New {role} Signup: {fullName}', '
    <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; border-bottom: 2px solid #333; padding-bottom: 12px;">New User Registration</h2>
    <div style="background: #262626; padding: 24px; border-radius: 12px; margin: 20px 0; border: 1px solid #333; text-align: left;">
        <p style="margin: 8px 0; color: #94a3b8;"><strong>Name:</strong> <span style="color: #ffffff;">{fullName}</span></p>
        <p style="margin: 8px 0; color: #94a3b8;"><strong>Email:</strong> <span style="color: #ffffff;">{email}</span></p>
        <p style="margin: 8px 0; color: #94a3b8;"><strong>Role:</strong> <span style="color: #ff4b82; font-weight: 800; text-transform: uppercase;">{role}</span></p>
        <p style="margin: 8px 0; color: #94a3b8;"><strong>Country:</strong> <span style="color: #ffffff;">{country}</span></p>
        <p style="margin: 8px 0; color: #94a3b8;"><strong>Timezone:</strong> <span style="color: #ffffff;">{timezone}</span></p>
    </div>
    <p style="font-size: 12px; color: #4b5563; text-align: center; margin-top: 32px;">
        This is an automated admin alert from GroupTutors.
    </p>
')
ON CONFLICT (type) DO UPDATE 
SET subject = EXCLUDED.subject, body = EXCLUDED.body;
