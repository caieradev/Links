const VERCEL_API_URL = 'https://api.vercel.com'

interface VercelDomainResponse {
  name: string
  verified: boolean
  verification?: {
    type: string
    domain: string
    value: string
    reason: string
  }[]
  error?: {
    code: string
    message: string
  }
}

interface VercelDomainConfig {
  configuredBy: 'CNAME' | 'A' | 'http' | null
  acceptedChallenges?: ('dns-01' | 'http-01')[]
  misconfigured: boolean
}

export async function addDomainToVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  const projectId = process.env.VERCEL_PROJECT_ID
  const apiToken = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID

  if (!projectId || !apiToken) {
    console.error('Missing VERCEL_PROJECT_ID or VERCEL_API_TOKEN')
    return { success: false, error: 'Configuracao do Vercel incompleta' }
  }

  try {
    const url = new URL(`${VERCEL_API_URL}/v10/projects/${projectId}/domains`)
    if (teamId) {
      url.searchParams.set('teamId', teamId)
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    })

    const data: VercelDomainResponse = await response.json()

    if (!response.ok) {
      // Domain might already exist, which is fine
      if (data.error?.code === 'domain_already_in_use') {
        return { success: true }
      }
      console.error('Vercel API error:', data.error)
      return { success: false, error: data.error?.message || 'Erro ao adicionar dominio no Vercel' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error adding domain to Vercel:', error)
    return { success: false, error: 'Erro de conexao com Vercel API' }
  }
}

export async function removeDomainFromVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  const projectId = process.env.VERCEL_PROJECT_ID
  const apiToken = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID

  if (!projectId || !apiToken) {
    console.error('Missing VERCEL_PROJECT_ID or VERCEL_API_TOKEN')
    return { success: false, error: 'Configuracao do Vercel incompleta' }
  }

  try {
    const url = new URL(`${VERCEL_API_URL}/v9/projects/${projectId}/domains/${domain}`)
    if (teamId) {
      url.searchParams.set('teamId', teamId)
    }

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    })

    if (!response.ok && response.status !== 404) {
      const data = await response.json()
      console.error('Vercel API error:', data.error)
      return { success: false, error: data.error?.message || 'Erro ao remover dominio do Vercel' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing domain from Vercel:', error)
    return { success: false, error: 'Erro de conexao com Vercel API' }
  }
}

export async function getVercelDomainConfig(domain: string): Promise<{
  success: boolean
  verified?: boolean
  configured?: boolean
  error?: string
}> {
  const apiToken = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID

  if (!apiToken) {
    console.error('Missing VERCEL_API_TOKEN')
    return { success: false, error: 'Configuracao do Vercel incompleta' }
  }

  try {
    const url = new URL(`${VERCEL_API_URL}/v6/domains/${domain}/config`)
    if (teamId) {
      url.searchParams.set('teamId', teamId)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return { success: false, error: data.error?.message || 'Erro ao verificar dominio' }
    }

    const data: VercelDomainConfig = await response.json()

    return {
      success: true,
      verified: !data.misconfigured,
      configured: data.configuredBy !== null
    }
  } catch (error) {
    console.error('Error checking domain config:', error)
    return { success: false, error: 'Erro de conexao com Vercel API' }
  }
}

export async function verifyDomainOnVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  const projectId = process.env.VERCEL_PROJECT_ID
  const apiToken = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID

  if (!projectId || !apiToken) {
    console.error('Missing VERCEL_PROJECT_ID or VERCEL_API_TOKEN')
    return { success: false, error: 'Configuracao do Vercel incompleta' }
  }

  try {
    const url = new URL(`${VERCEL_API_URL}/v9/projects/${projectId}/domains/${domain}/verify`)
    if (teamId) {
      url.searchParams.set('teamId', teamId)
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    })

    const data: VercelDomainResponse = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Dominio nao verificado' }
    }

    return { success: data.verified }
  } catch (error) {
    console.error('Error verifying domain on Vercel:', error)
    return { success: false, error: 'Erro de conexao com Vercel API' }
  }
}
