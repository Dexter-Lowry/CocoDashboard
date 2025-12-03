const STATION_ID = '41114'
const DATA_URL = `https://www.ndbc.noaa.gov/data/realtime2/${STATION_ID}.txt`

export const STATION_PAGE_URL = `https://www.ndbc.noaa.gov/station_page.php?station=${STATION_ID}`

export type WaveObservation = {
  stationId: string
  timestampUtc: string
  waveHeightMeters: number
  dominantPeriodSeconds?: number
  meanDirectionDeg?: number
  waterTempC?: number
}

export async function fetchLatestWaveObservation(
  signal?: AbortSignal
): Promise<WaveObservation | null> {
  const response = await fetch(DATA_URL, { signal })
  if (!response.ok) {
    throw new Error('Failed to fetch buoy data')
  }

  const lines = (await response.text())
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    if (line.startsWith('#')) continue
    const observation = parseObservation(line)
    if (observation) {
      return observation
    }
  }

  return null
}

function parseObservation(line: string): WaveObservation | null {
  const parts = line.split(/\s+/)
  if (parts.length < 9) {
    return null
  }

  const [year, month, day, hour, minute] = parts
    .slice(0, 5)
    .map((value) => Number.parseInt(value, 10))

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null
  }

  const waveHeightMeters = toNumber(parts[8])
  if (waveHeightMeters === undefined) {
    return null
  }

  const timestampUtc = new Date(
    Date.UTC(year, month - 1, day, hour, minute)
  ).toISOString()

  return {
    stationId: STATION_ID,
    timestampUtc,
    waveHeightMeters,
    dominantPeriodSeconds: toNumber(parts[9]),
    meanDirectionDeg: toNumber(parts[11]),
    waterTempC: toNumber(parts[14])
  }
}

function toNumber(value: string): number | undefined {
  const num = Number.parseFloat(value)
  return Number.isFinite(num) ? num : undefined
}
