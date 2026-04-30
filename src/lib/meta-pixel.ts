import { createHash } from 'crypto'

const PIXEL_ID = process.env.META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN
const API_VERSION = 'v21.0'

function hashSHA256(value: string): string {
  return createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex')
}

interface UserData {
  email?: string
  clientIpAddress?: string
  clientUserAgent?: string
  fbc?: string
  fbp?: string
}

interface CustomData {
  content_name?: string
  currency?: string
  value?: number
  status?: boolean
}

export async function sendConversionEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData,
  customData,
}: {
  eventName: string
  eventId: string
  eventSourceUrl: string
  userData: UserData
  customData?: CustomData
}) {
  if (!PIXEL_ID || !ACCESS_TOKEN) return

  const hashedUserData: Record<string, unknown> = {}

  if (userData.email) {
    hashedUserData.em = [hashSHA256(userData.email)]
  }
  if (userData.clientIpAddress) {
    hashedUserData.client_ip_address = userData.clientIpAddress
  }
  if (userData.clientUserAgent) {
    hashedUserData.client_user_agent = userData.clientUserAgent
  }
  if (userData.fbc) {
    hashedUserData.fbc = userData.fbc
  }
  if (userData.fbp) {
    hashedUserData.fbp = userData.fbp
  }

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: hashedUserData,
    ...(customData && { custom_data: customData }),
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [event],
          access_token: ACCESS_TOKEN,
        }),
      }
    )

    if (!response.ok) {
      const body = await response.text()
      console.error('Meta CAPI error:', response.status, body)
    }
  } catch (error) {
    console.error('Meta CAPI request failed:', error)
  }
}
