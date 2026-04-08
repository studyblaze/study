import { NextResponse } from 'next/server';
import { getServiceSupabase } from '../_lib/supabase';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const subject = searchParams.get('subject') || 'M4';

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const supabase = getServiceSupabase();
        const today = new Date().toISOString();
        const { data, error } = await supabase
            .from('spaced_repetition_revisions')
            .select('*')
            .eq('user_id', userId)
            .eq('subject', subject)
            .lte('next_revision_at', today)
            .order('next_revision_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ revisions: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
