
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkSchema() {
    const { data, error } = await supabase.from('tutors').select('*').limit(1)
    if (error) {
        console.error('Error fetching tutor:', error)
        return
    }
    if (data && data.length > 0) {
        console.log('Tutor columns:', Object.keys(data[0]))
        console.log('Sample tutor data:', data[0])
    } else {
        console.log('No tutor records found to inspect.')
    }
}

checkSchema()
