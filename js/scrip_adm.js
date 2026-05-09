import { createClient } from '@supabase/supabase-client'

const supabaseUrl = 'https://rfptgcsmxgvqxbwzthic.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcHRnY3NteGd2cXhid3p0aGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDY2NTUsImV4cCI6MjA5MzU4MjY1NX0.6p99HIP_BuFuQMKV-4hf4orc2HCBTLQHNfAVUyKnUh4'
export const supabase = createClient(supabaseUrl, supabaseKey)