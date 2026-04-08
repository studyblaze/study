import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient( process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY! );

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const num = searchParams.get('num');

    if (!subject || !num) {
        return NextResponse.json({ error: 'subject and num are required' }, { status: 400 });
    }

    try {
        const { data: question, error } = await supabase
            .from('subject_questions')
            .select('*')
            .eq('subject', subject)
            .eq('question_number', parseInt(num))
            .single();

        if (error) {
            // No question found, but we let client handle fallback
            return NextResponse.json({ question: null });
        }

        return NextResponse.json({ question });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
