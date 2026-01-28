import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const leadCaptureSchema = z.object({
  profile_id: z.string().uuid(),
  link_id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = leadCaptureSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados invalidos' },
        { status: 400 }
      )
    }

    const { profile_id, link_id, email, name } = parsed.data

    const supabase = await createClient()

    // Verify link exists and requires email
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id, requires_email, user_id')
      .eq('id', link_id)
      .single()

    if (linkError || !link) {
      return NextResponse.json(
        { error: 'Link não encontrado' },
        { status: 404 }
      )
    }

    if (!link.requires_email) {
      return NextResponse.json(
        { error: 'Este link não requer email' },
        { status: 400 }
      )
    }

    // Check if user has lead gate feature
    const { data: flags } = await supabase
      .from('feature_flags')
      .select('can_use_lead_gate')
      .eq('user_id', link.user_id)
      .single()

    if (!flags?.can_use_lead_gate) {
      return NextResponse.json(
        { error: 'Funcionalidade não disponível' },
        { status: 403 }
      )
    }

    // Add to subscribers (reuse existing table)
    // If subscriber exists, update name if provided
    const subscriberData: { profile_id: string; email: string; name?: string } = {
      profile_id: profile_id,
      email: email,
    }
    if (name) {
      subscriberData.name = name
    }

    const { error: subscriberError } = await supabase
      .from('subscribers')
      .upsert(subscriberData, {
        onConflict: 'profile_id,email',
      })

    if (subscriberError && !subscriberError.message.includes('duplicate')) {
      console.error('Error adding subscriber:', subscriberError)
      return NextResponse.json(
        { error: 'Erro ao processar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
