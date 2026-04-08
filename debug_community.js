const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCommunity() {
    console.log('Checking Community Posts...');

    // 1. Try a simple count
    const { count, error: countError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Count Error:', countError);
    } else {
        console.log('Total Posts found:', count);
    }

    // 2. Fetch one post to see schema
    const { data: onePost, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .limit(1);

    if (fetchError) {
        console.error('Fetch Error:', fetchError);
    } else {
        console.log('One Post Data:', JSON.stringify(onePost, null, 2));
    }

    // 3. Try the exact query from CommunityContext
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
            id, author_id, content, title, category, votes_score, comments_count, is_announcement, created_at,
            author:profiles!posts_author_id_fkey(id, full_name, avatar_url, role)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (postsError) {
        console.error('Full Query Error:', postsError);
    } else {
        console.log('Full Query Results count:', posts?.length);
        if (posts && posts.length > 0) {
            console.log('First result author:', posts[0].author);
        }
    }
}

checkCommunity();
