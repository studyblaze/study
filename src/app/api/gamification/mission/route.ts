import { NextResponse } from 'next/server';
import { getServiceSupabase } from '../_lib/supabase';

const JUMPS: Record<string, Record<number, number>> = {
    "M4": { 4: 25, 13: 46, 33: 49, 42: 63, 50: 69, 27: 5, 40: 21, 43: 18 },
    "WEBX": { 4: 15, 12: 24, 21: 8 },
    "TCS": { 10: 25, 35: 50, 20: 5, 45: 30 },
    "M3": { 4: 25, 13: 46, 33: 49, 27: 5, 40: 21 }
};

const DEFAULT_SUBJECTS = {
  "M4": { "completed": 0, "target": 4, "total": 120, "position": 1, "color": "#a855f7", "d_day": "2026-05-12" },
  "WEBX": { "completed": 0, "target": 1, "total": 30, "position": 1, "color": "#3b82f6", "d_day": "2026-05-17" },
  "TCS": { "completed": 0, "target": 2, "total": 60, "position": 1, "color": "#10b981", "d_day": "2026-06-02" },
  "M3": { "completed": 0, "target": 3, "total": 120, "position": 1, "color": "#f59e0b", "d_day": "2026-06-04" }
};

export async function POST(req: Request) {
    const { userId, type, topicName, subject = "M4" } = await req.json();

    try {
        const supabase = getServiceSupabase();
        const { data: mission, error: missionError } = await supabase
            .from('user_daily_missions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (missionError) throw missionError;

        const subjectData = mission.subject_data || DEFAULT_SUBJECTS;
        const sub = subjectData[subject];

        if (!sub) throw new Error(`Invalid subject: ${subject}`);

        let newPos = sub.position;
        let xpGained = 0;

        if (type === 'revision') {
            newPos += 1;
            xpGained = 30;
            sub.completed += 1;
        }

        // Apply Jumps
        const subjectJumps = JUMPS[subject] || {};
        if (subjectJumps[newPos]) {
            newPos = subjectJumps[newPos];
        }

        // Cap at total
        newPos = Math.min(newPos, sub.total);
        sub.position = newPos;

        // Update DB
        const { error: updateError } = await supabase
            .from('user_daily_missions')
            .update({
                subject_data: subjectData,
                total_xp: mission.total_xp + xpGained
            })
            .eq('user_id', userId);

        if (updateError) throw updateError;

        // Update Spaced Repetition (if applicable)
        if (type === 'revision' && topicName) {
            const { data: rev } = await supabase
                .from('spaced_repetition_revisions')
                .select('*')
                .eq('user_id', userId)
                .eq('topic_name', topicName)
                .single();

            if (rev) {
                const stages = [1, 3, 7, 30];
                const nextInterval = stages[rev.interval_stage] || 30;
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + nextInterval);

                await supabase
                    .from('spaced_repetition_revisions')
                    .update({
                        interval_stage: Math.min(rev.interval_stage + 1, 3),
                        next_revision_at: nextDate.toISOString()
                    })
                    .eq('id', rev.id);
            }
        }

        return NextResponse.json({ success: true, newPosition: newPos });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    try {
        const supabase = getServiceSupabase();
        let { data: mission, error } = await supabase
            .from('user_daily_missions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            const { data: newMission } = await supabase
                .from('user_daily_missions')
                .insert({ user_id: userId, board_position: 1, daily_streak: 1, subject_data: DEFAULT_SUBJECTS })
                .select()
                .single();
            mission = newMission;
        } else if (mission && !mission.subject_data) {
           await supabase.from('user_daily_missions').update({ subject_data: DEFAULT_SUBJECTS }).eq('user_id', userId);
           mission.subject_data = DEFAULT_SUBJECTS;
        }

        return NextResponse.json({ mission });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
