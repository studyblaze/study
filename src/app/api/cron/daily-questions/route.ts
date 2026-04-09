import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getServiceSupabase } from '../../gamification/_lib/supabase';
import {
    DAILY_QUESTION_QUOTA,
    DailyQuestionItem,
    DailySubject,
    sampleQuestions,
    stripHtml,
    truncateText,
} from '../../gamification/_lib/daily-questions';

function getAuthorized(request: Request) {
    const cronSecret = process.env.CRON_SECRET?.trim();
    if (!cronSecret) return true;

    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${cronSecret}`;
}

function formatSubjectLabel(subject: string) {
    switch (subject) {
        case 'M4':
            return 'Mathematics 4';
        case 'M3':
            return 'Mathematics 3';
        case 'TCS':
            return 'TCS';
        case 'WEBX':
            return 'WEB X';
        default:
            return subject;
    }
}

function buildEmailHtml(groupedQuestions: Record<DailySubject, DailyQuestionItem[]>) {
    const dateLabel = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const sections = (Object.keys(DAILY_QUESTION_QUOTA) as DailySubject[])
        .map((subject) => {
            const items = groupedQuestions[subject] || [];
            const quota = DAILY_QUESTION_QUOTA[subject];

            const questionList = items
                .map((question, index) => {
                    const preview = truncateText(stripHtml(question.question_text || ''));
                    return `
                        <li style="margin: 0 0 14px; padding: 14px 16px; border-radius: 14px; background: #111827; color: #f9fafb;">
                            <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #f87171; margin-bottom: 6px;">
                                ${formatSubjectLabel(subject)} - Q${question.question_number}
                            </div>
                            <div style="font-size: 14px; line-height: 1.6; color: #e5e7eb;">
                                ${preview || `Question ${index + 1}`}
                            </div>
                            ${question.formula_text ? `
                                <div style="margin-top: 8px; font-size: 11px; font-style: italic; color: #9ca3af;">
                                    + Formula Reference Available
                                </div>
                            ` : ''}
                        </li>
                    `;
                })
                .join('');

            return `
                <section style="margin: 0 0 28px;">
                    <h2 style="margin: 0 0 12px; font-size: 18px; color: #111827;">
                        ${formatSubjectLabel(subject)} (${items.length}/${quota})
                    </h2>
                    <ol style="padding-left: 0; margin: 0; list-style: none;">
                        ${questionList || '<li style="color:#6b7280;">No questions available in the database yet.</li>'}
                    </ol>
                </section>
            `;
        })
        .join('');

    return `
        <div style="font-family: Arial, sans-serif; background: #f3f4f6; padding: 32px; color: #111827;">
            <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);">
                <div style="margin-bottom: 24px;">
                    <div style="display: inline-block; padding: 6px 12px; border-radius: 999px; background: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;">
                        Daily Neural Mission
                    </div>
                    <h1 style="margin: 16px 0 8px; font-size: 30px;">Today's Question Pack</h1>
                    <p style="margin: 0; color: #4b5563; font-size: 15px;">
                        ${dateLabel}. Complete all 10 questions today at any cost.
                    </p>
                </div>
                ${sections}
            </div>
        </div>
    `;
}

export async function GET(request: Request) {
    if (!getAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const emailTo = process.env.DAILY_QUESTIONS_EMAIL_TO?.trim();
    const emailFrom = process.env.DAILY_QUESTIONS_EMAIL_FROM?.trim() || 'Study Daily <onboarding@resend.dev>';

    if (!resendApiKey) {
        return NextResponse.json({ error: 'Production Error: RESEND_API_KEY is not defined in environment variables.' }, { status: 500 });
    }
    if (!emailTo) {
        return NextResponse.json({ error: 'Production Error: DAILY_QUESTIONS_EMAIL_TO is not defined.' }, { status: 500 });
    }
    if (!resendApiKey.startsWith('re_')) {
        return NextResponse.json({ error: 'Production Error: RESEND_API_KEY format is invalid (should start with re_).' }, { status: 500 });
    }

    try {
        const supabase = getServiceSupabase();
        const groupedQuestions = {} as Record<DailySubject, DailyQuestionItem[]>;

        for (const subject of Object.keys(DAILY_QUESTION_QUOTA) as DailySubject[]) {
            const quota = DAILY_QUESTION_QUOTA[subject];
            const { data, error } = await supabase
                .from('subject_questions')
                .select('id,subject,question_number,question_text,answer_text,formula_text')
                .eq('subject', subject);

            if (error) throw error;

            groupedQuestions[subject] = sampleQuestions((data || []) as DailyQuestionItem[], quota);
        }

        const resend = new Resend(resendApiKey);
        const totalQuestions = Object.values(groupedQuestions).reduce((sum, items) => sum + items.length, 0);

        const sendResult = await resend.emails.send({
            from: emailFrom,
            to: [emailTo],
            subject: `Today's Study Questions (${totalQuestions})`,
            html: buildEmailHtml(groupedQuestions),
        });

        return NextResponse.json({
            success: true,
            totalQuestions,
            groupedQuestions,
            emailId: sendResult.data?.id || null,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Daily question email failed.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
