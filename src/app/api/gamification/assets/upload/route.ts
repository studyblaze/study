import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = process.env.SUPABASE_M4_ASSETS_BUCKET || 'm4-assets';

function sanitizeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
        }

        const ext = file.name.split('.').pop() || 'png';
        const path = `cloud/${Date.now()}-${sanitizeFileName(file.name || `image.${ext}`)}`;
        const arrayBuffer = await file.arrayBuffer();

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, arrayBuffer, {
                contentType: file.type || 'image/png',
                upsert: false,
            });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            path,
            url: `/api/gamification/assets?path=${encodeURIComponent(path)}`,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
    }
}
