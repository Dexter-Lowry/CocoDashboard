const BASE_URL = 'https://ll.thespacedevs.com/2.2.0'
const PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
]
const CAPE_LOCATION_IDS = '12,27'

type LaunchListResponse = {
  results?: LaunchRecord[]
}

type LaunchRecord = {
  id: string
  url?: string
  name?: string
  net?: string
  pad?: {
    name?: string
    location?: {
      name?: string
    }
  }
  mission?: {
    name?: string
    description?: string
    type?: string
  }
  rocket?: {
    configuration?: {
      full_name?: string
    }
  }
  launch_service_provider?: {
    name?: string
  }
  status?: {
    name?: string
  }
}

export type LaunchSummary = {
  id: string
  detailUrl?: string
  displayName: string
  netUtc?: string
  padName?: string
  locationName?: string
  provider?: string
  rocketName?: string
  payloadName?: string
  payloadDescription?: string
  missionType?: string
}

export async function fetchUpcomingCapeLaunches(
  signal?: AbortSignal
): Promise<LaunchSummary[]> {
  const params = new URLSearchParams({
    limit: '4',
    ordering: 'net',
    'location__ids': CAPE_LOCATION_IDS
  })
  const url = `${BASE_URL}/launch/upcoming/?${params}`
  const data = await fetchWithCors(url, signal)
  const launches = data.results ?? []
  return launches.map(mapLaunchToSummary)
}

async function fetchWithCors(url: string, signal?: AbortSignal) {
  try {
    const direct = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' }
    })
    if (direct.ok) {
      return (await direct.json()) as LaunchListResponse
    }
  } catch {
    // likely CORS or network; fall through to proxy
  }

  for (const proxy of PROXIES) {
    try {
      const proxied = await fetch(proxy(url), {
        signal,
        headers: { Accept: 'application/json' }
      })
      if (proxied.ok) {
        return (await proxied.json()) as LaunchListResponse
      }
    } catch {
      // try next proxy
    }
  }

  throw new Error('Failed to fetch launch data')
}

function mapLaunchToSummary(record: LaunchRecord): LaunchSummary {
  return {
    id: record.id,
    detailUrl: record.url,
    displayName: record.name ?? 'Unnamed launch',
    netUtc: record.net,
    padName: record.pad?.name,
    locationName: record.pad?.location?.name,
    provider: record.launch_service_provider?.name,
    rocketName: record.rocket?.configuration?.full_name,
    payloadName: record.mission?.name,
    payloadDescription:
      record.mission?.description ?? 'Payload description not available.',
    missionType: record.mission?.type
  }
}
