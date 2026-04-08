import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient( process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY! );

export async function POST(req: Request) {
    const { subject, questionNumber, questionText, answerText } = await req.json();

    if (!subject || !questionNumber) {
        return NextResponse.json({ error: 'Subject and Question Number are required' }, { status: 400 });
    }

    try {
        // Upsert question data
        const { data, error } = await supabase
            .from('subject_questions')
            .upsert({
                subject,
                question_number: questionNumber,
                question_text: questionText,
                answer_text: answerText
            }, { 
                onConflict: 'subject,question_number' 
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, question: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
