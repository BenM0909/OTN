import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ksoljnznrvqxxlldeapc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzb2xqbnpucnZxeHhsbGRlYXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTc1NzYsImV4cCI6MjA5NDA5MzU3Nn0.-4ESJLMjGcrx0uwlUGM4JPBH2Mm_Gfvs1eJGg4QUG1A'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface ConversionRequest {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  tape_type: string
  quantity: number
  output_format: string | null
  turnaround: string | null
  delivery: string | null
  notes: string | null
  status: string
  user_id: string | null
  file_url: string | null
}

export interface TapeItem {
  id: string
  order_id: string
  tape_number: number
  name: string | null
  length_hours: number
  length_minutes: number
  file_url: string | null
  created_at: string
}

export function calcTapePrice(hours: number, minutes: number): number {
  const totalHours = hours + (minutes >= 60 ? Math.floor(minutes / 60) : 0)
  if (totalHours < 2) return 15
  return 15 + (totalHours - 1) * 2
}
