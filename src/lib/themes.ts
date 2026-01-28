import type { PageSettings } from '@/types/database'

export interface Theme {
  id: string
  name: string
  preview: {
    background: string
    text: string
    button: string
  }
  settings: Partial<PageSettings>
}

export const themes: Theme[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Claro',
    preview: {
      background: '#ffffff',
      text: '#000000',
      button: '#f3f4f6',
    },
    settings: {
      background_type: 'solid',
      background_color: '#ffffff',
      text_color: '#000000',
      link_background_color: '#f3f4f6',
      link_text_color: '#000000',
      link_hover_color: '#e5e7eb',
      link_style: 'rounded',
      link_shadow: false,
    },
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Escuro',
    preview: {
      background: '#0f172a',
      text: '#ffffff',
      button: '#1e293b',
    },
    settings: {
      background_type: 'solid',
      background_color: '#0f172a',
      text_color: '#ffffff',
      link_background_color: '#1e293b',
      link_text_color: '#ffffff',
      link_hover_color: '#334155',
      link_style: 'rounded',
      link_shadow: false,
    },
  },
  {
    id: 'ocean',
    name: 'Oceano',
    preview: {
      background: 'linear-gradient(to bottom, #0ea5e9, #0284c7)',
      text: '#ffffff',
      button: 'rgba(255,255,255,0.2)',
    },
    settings: {
      background_type: 'gradient',
      background_gradient_start: '#0ea5e9',
      background_gradient_end: '#0284c7',
      background_gradient_direction: 'to bottom',
      text_color: '#ffffff',
      link_background_color: 'rgba(255,255,255,0.2)',
      link_text_color: '#ffffff',
      link_hover_color: 'rgba(255,255,255,0.3)',
      link_style: 'rounded',
      link_shadow: true,
    },
  },
  {
    id: 'sunset',
    name: 'Por do Sol',
    preview: {
      background: 'linear-gradient(to bottom right, #f97316, #ec4899)',
      text: '#ffffff',
      button: 'rgba(255,255,255,0.25)',
    },
    settings: {
      background_type: 'gradient',
      background_gradient_start: '#f97316',
      background_gradient_end: '#ec4899',
      background_gradient_direction: 'to bottom right',
      text_color: '#ffffff',
      link_background_color: 'rgba(255,255,255,0.25)',
      link_text_color: '#ffffff',
      link_hover_color: 'rgba(255,255,255,0.35)',
      link_style: 'rounded',
      link_shadow: true,
    },
  },
  {
    id: 'forest',
    name: 'Floresta',
    preview: {
      background: 'linear-gradient(to bottom, #22c55e, #15803d)',
      text: '#ffffff',
      button: 'rgba(255,255,255,0.2)',
    },
    settings: {
      background_type: 'gradient',
      background_gradient_start: '#22c55e',
      background_gradient_end: '#15803d',
      background_gradient_direction: 'to bottom',
      text_color: '#ffffff',
      link_background_color: 'rgba(255,255,255,0.2)',
      link_text_color: '#ffffff',
      link_hover_color: 'rgba(255,255,255,0.3)',
      link_style: 'rounded',
      link_shadow: true,
    },
  },
  {
    id: 'midnight',
    name: 'Meia-Noite',
    preview: {
      background: 'linear-gradient(to bottom, #312e81, #1e1b4b)',
      text: '#ffffff',
      button: 'rgba(255,255,255,0.15)',
    },
    settings: {
      background_type: 'gradient',
      background_gradient_start: '#312e81',
      background_gradient_end: '#1e1b4b',
      background_gradient_direction: 'to bottom',
      text_color: '#ffffff',
      link_background_color: 'rgba(255,255,255,0.15)',
      link_text_color: '#ffffff',
      link_hover_color: 'rgba(255,255,255,0.25)',
      link_style: 'rounded',
      link_shadow: true,
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    preview: {
      background: '#fdf2f8',
      text: '#9d174d',
      button: '#fce7f3',
    },
    settings: {
      background_type: 'solid',
      background_color: '#fdf2f8',
      text_color: '#9d174d',
      link_background_color: '#fce7f3',
      link_text_color: '#9d174d',
      link_hover_color: '#fbcfe8',
      link_style: 'rounded',
      link_shadow: false,
    },
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    preview: {
      background: '#f5f3ff',
      text: '#5b21b6',
      button: '#ede9fe',
    },
    settings: {
      background_type: 'solid',
      background_color: '#f5f3ff',
      text_color: '#5b21b6',
      link_background_color: '#ede9fe',
      link_text_color: '#5b21b6',
      link_hover_color: '#ddd6fe',
      link_style: 'rounded',
      link_shadow: false,
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    preview: {
      background: '#18181b',
      text: '#22d3ee',
      button: '#27272a',
    },
    settings: {
      background_type: 'solid',
      background_color: '#18181b',
      text_color: '#22d3ee',
      link_background_color: '#27272a',
      link_text_color: '#22d3ee',
      link_hover_color: '#3f3f46',
      link_style: 'pill',
      link_shadow: true,
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    preview: {
      background: 'linear-gradient(to bottom right, #4f46e5, #06b6d4, #22c55e)',
      text: '#ffffff',
      button: 'rgba(255,255,255,0.2)',
    },
    settings: {
      background_type: 'gradient',
      background_gradient_start: '#4f46e5',
      background_gradient_end: '#22c55e',
      background_gradient_direction: 'to bottom right',
      text_color: '#ffffff',
      link_background_color: 'rgba(255,255,255,0.2)',
      link_text_color: '#ffffff',
      link_hover_color: 'rgba(255,255,255,0.3)',
      link_style: 'rounded',
      link_shadow: true,
    },
  },
  {
    id: 'coffee',
    name: 'Cafe',
    preview: {
      background: '#292524',
      text: '#fef3c7',
      button: '#44403c',
    },
    settings: {
      background_type: 'solid',
      background_color: '#292524',
      text_color: '#fef3c7',
      link_background_color: '#44403c',
      link_text_color: '#fef3c7',
      link_hover_color: '#57534e',
      link_style: 'rounded',
      link_shadow: false,
    },
  },
  {
    id: 'candy',
    name: 'Candy',
    preview: {
      background: 'linear-gradient(to bottom right, #f472b6, #c084fc)',
      text: '#ffffff',
      button: 'rgba(255,255,255,0.3)',
    },
    settings: {
      background_type: 'gradient',
      background_gradient_start: '#f472b6',
      background_gradient_end: '#c084fc',
      background_gradient_direction: 'to bottom right',
      text_color: '#ffffff',
      link_background_color: 'rgba(255,255,255,0.3)',
      link_text_color: '#ffffff',
      link_hover_color: 'rgba(255,255,255,0.4)',
      link_style: 'pill',
      link_shadow: true,
    },
  },
]

export function getThemeById(id: string): Theme | undefined {
  return themes.find((theme) => theme.id === id)
}
