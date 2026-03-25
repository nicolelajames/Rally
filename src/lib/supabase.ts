import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Family {
  id: string
  name: string
  invite_code: string
  created_at: string
}

export interface Profile {
  id: string
  family_id: string | null
  full_name: string | null
  role: string
  avatar_color: string
  created_at: string
}

export interface Child {
  id: string
  family_id: string
  name: string
  color: string
  grade: string | null
  school: string | null
  created_at: string
}

export interface FeedItem {
  id: string
  family_id: string
  child_id: string | null
  type: 'action_required' | 'event' | 'conflict' | 'upcoming'
  priority: number
  title: string
  description: string | null
  due_at: string | null
  event_at: string | null
  location: string | null
  source_label: string | null
  badge_type: 'urgent' | 'warning' | 'info' | 'change' | null
  badge_label: string | null
  is_done: boolean
  created_at: string
}

export interface Document {
  id: string
  family_id: string
  child_id: string | null
  file_path: string
  file_name: string | null
  extracted_text: string | null
  ai_summary: string | null
  feed_items_created: number
  created_at: string
}
