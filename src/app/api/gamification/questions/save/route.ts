import { NextResponse } from 'next/server';
import { getServiceSupabase } from '../../_lib/supabase';

export async function POST(req: Request) {
    let payload;
    try {
        payload = await req.json();
    } catch (e) {
        console.error('[QuestionsSave] Failed to parse JSON body');
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { subject, questionNumber, questionText, answerText, formulaText } = payload;

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
                answer_text: answerText,
                formula_text: formulaText
            }, { 
                onConflict: 'subject,question_number' 
            })
            .select()
            .single();

        if (error) {
            console.error('[QuestionsSave] Supabase error:', error.message, error.code);
            throw error;
        }

        return NextResponse.json({ success: true, question: data });
    } catch (e: any) {
        console.error('[QuestionsSave] Unexpected error:', e.message);
        return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
    }
}
