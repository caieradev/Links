'use server'

import { createClient } from '@supabase/supabase-js'

export async function trackLinkClick(linkId: string) {
  // Use admin client to bypass RLS for click tracking
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Increment click count using SQL function
  await supabase.rpc('increment_link_click', { link_id: linkId })
}
