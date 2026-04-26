import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grmurtiihprlswfowggi.supabase.co'
const supabaseKey = 'sb_publishable_mHAtGJBbj1U1-h42DczWng_Ui26vD2H'

export const supabase = createClient(supabaseUrl, supabaseKey)