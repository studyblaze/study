import { NextResponse } from 'next/server';
import { getServiceSupabase } from '../../_lib/supabase';

export async function POST(req: Request) {
    const { subject, questionNumber, questionText, answerText } = await req.json();

    if (!subject || !questionNumber) {
        return NextResponse.json({ error: 'Subject and Question Number are required' }, { status: 400 });
    }

    try {
        const supabase = getServiceSupabase();
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
