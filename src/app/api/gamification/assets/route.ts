import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = process.env.SUPABASE_M4_ASSETS_BUCKET || 'm4-assets';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) {
        return new Response('Missing path', { status: 400 });
    }

    const { data, error } = await supabase.storage.from(BUCKET).download(path);

    if (error || !data) {
        return new Response('Not found', { status: 404 });
    }

    return new Response(data, {
        headers: {
            'Content-Type': data.type || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
