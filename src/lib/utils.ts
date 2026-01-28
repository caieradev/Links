import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the app URL for redirects and callbacks.
 * Checks APP_URL first (server-side only), then NEXT_PUBLIC_APP_URL.
 */
export function getAppUrl(): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  return 'http://localhost:3000'
}
