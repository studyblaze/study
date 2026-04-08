
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY // Use service role to check columns or just try update

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function probe() {
    console.log('Probing video_thumbnail_url column...')
    const { error } = await supabase.from('tutors').update({ video_thumbnail_url: 'https://test.com/thumb.jpg' }).eq('id', -999)
    if (error && error.message.includes('column "video_thumbnail_url" does not exist')) {
        console.log('Column "video_thumbnail_url" DOES NOT exist.')
    } else if (error) {
        console.log('Update error (might exist but failed for other reasons):', error.message)
    } else {
        console.log('Column "video_thumbnail_url" EXISTS!')
    }

    console.log('Probing intro_video_thumbnail_url column...')
    const { error: error2 } = await supabase.from('tutors').update({ intro_video_thumbnail_url: 'https://test.com/thumb.jpg' }).eq('id', -999)
     if (error2 && error2.message.includes('column "intro_video_thumbnail_url" does not exist')) {
        console.log('Column "intro_video_thumbnail_url" DOES NOT exist.')
    } else if (error2) {
        console.log('Update error 2:', error2.message)
    } else {
        console.log('Column "intro_video_thumbnail_url" EXISTS!')
    }
}

probe()
