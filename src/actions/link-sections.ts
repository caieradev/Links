'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const sectionSchema = z.object({
  title: z.string().min(1, 'Titulo obrigatorio').max(50, 'Título muito longo'),
})

export type SectionActionState = {
  error?: string
  success?: string
}

export async function createSection(
  prevState: SectionActionState,
  formData: FormData
): Promise<SectionActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Check feature flag
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_use_link_sections')
    .eq('user_id', user.id)
    .single()

  if (!flags?.can_use_link_sections) {
    return { error: 'Seções de links não estao disponiveis no seu plano' }
  }

  const parsed = sectionSchema.safeParse({
    title: formData.get('title'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
  }

  // Get the highest position
  const { data: lastSection } = await supabase
    .from('link_sections')
    .select('position')
    .eq('profile_id', user.id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = (lastSection?.position ?? -1) + 1

  const { error } = await supabase.from('link_sections').insert({
    profile_id: user.id,
    title: parsed.data.title,
    position: nextPosition,
  })

  if (error) {
    return { error: 'Erro ao criar secao' }
  }

  revalidatePath('/dashboard')
  return { success: 'Secao criada com sucesso' }
}

export async function updateSection(
  sectionId: string,
  title: string
): Promise<SectionActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const parsed = sectionSchema.safeParse({ title })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
  }

  const { error } = await supabase
    .from('link_sections')
    .update({ title: parsed.data.title })
    .eq('id', sectionId)
    .eq('profile_id', user.id)

  if (error) {
    return { error: 'Erro ao atualizar secao' }
  }

  revalidatePath('/dashboard')
  return { success: 'Secao atualizada com sucesso' }
}

export async function deleteSection(sectionId: string): Promise<SectionActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Links in this section will have section_id set to null (ON DELETE SET NULL)
  const { error } = await supabase
    .from('link_sections')
    .delete()
    .eq('id', sectionId)
    .eq('profile_id', user.id)

  if (error) {
    return { error: 'Erro ao deletar secao' }
  }

  revalidatePath('/dashboard')
  return { success: 'Secao deletada com sucesso' }
}

export async function reorderSections(
  orderedIds: string[]
): Promise<SectionActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('link_sections')
      .update({ position: index })
      .eq('id', id)
      .eq('profile_id', user.id)
  )

  const results = await Promise.all(updates)
  const hasError = results.some((result) => result.error)

  if (hasError) {
    return { error: 'Erro ao reordenar seções' }
  }

  revalidatePath('/dashboard')
  return { success: 'Seções reordenadas com sucesso' }
}

export async function assignLinkToSection(
  linkId: string,
  sectionId: string | null
): Promise<SectionActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { error } = await supabase
    .from('links')
    .update({ section_id: sectionId })
    .eq('id', linkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao mover link' }
  }

  revalidatePath('/dashboard')
  return { success: 'Link movido com sucesso' }
}

export async function getUserSections() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('link_sections')
    .select('*')
    .eq('profile_id', user.id)
    .order('position', { ascending: true })

  if (error) {
    return { error: 'Erro ao buscar seções', data: null }
  }

  return { error: null, data }
}
