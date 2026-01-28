'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email('Email invalido'),
  name: z.string().max(100, 'Nome muito longo').optional(),
  profile_id: z.string().uuid('Profile invalido'),
})

export type SubscriberActionState = {
  error?: string
  success?: string
}

export async function addSubscriber(
  prevState: SubscriberActionState,
  formData: FormData
): Promise<SubscriberActionState> {
  const supabase = await createClient()

  const parsed = subscribeSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name') || undefined,
    profile_id: formData.get('profile_id'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
  }

  // Check if the profile has subscriber collection enabled
  const { data: settings } = await supabase
    .from('page_settings')
    .select('subscriber_form_enabled')
    .eq('user_id', parsed.data.profile_id)
    .single()

  if (!settings?.subscriber_form_enabled) {
    return { error: 'Formulario de inscrição não esta habilitado' }
  }

  // Check if the profile owner has the feature flag
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_collect_subscribers')
    .eq('user_id', parsed.data.profile_id)
    .single()

  if (!flags?.can_collect_subscribers) {
    return { error: 'Coleta de subscribers não esta disponível' }
  }

  const { error } = await supabase.from('subscribers').insert({
    profile_id: parsed.data.profile_id,
    email: parsed.data.email,
    name: parsed.data.name || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Este email ja esta inscrito' }
    }
    return { error: 'Erro ao inscrever' }
  }

  return { success: 'Inscrito com sucesso!' }
}

export async function getSubscribers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado', data: null, count: 0 }
  }

  const { data, error, count } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact' })
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: 'Erro ao buscar inscritos', data: null, count: 0 }
  }

  return { error: null, data, count: count ?? 0 }
}

export async function deleteSubscriber(subscriberId: string): Promise<SubscriberActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('id', subscriberId)
    .eq('profile_id', user.id)

  if (error) {
    return { error: 'Erro ao deletar inscrito' }
  }

  revalidatePath('/subscribers')
  return { success: 'Inscrito removido com sucesso' }
}

export async function exportSubscribersCSV(): Promise<{ csv: string | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { csv: null, error: 'Não autenticado' }
  }

  const { data, error } = await supabase
    .from('subscribers')
    .select('email, name, created_at')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { csv: null, error: 'Erro ao buscar inscritos' }
  }

  if (!data || data.length === 0) {
    return { csv: null, error: 'Nenhum inscrito para exportar' }
  }

  // Build CSV
  const headers = ['email', 'name', 'created_at']
  const rows = data.map((sub) => [
    sub.email,
    sub.name || '',
    new Date(sub.created_at).toISOString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  return { csv: csvContent, error: null }
}
