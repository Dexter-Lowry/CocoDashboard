import type { DashboardCardModel } from '../dashboard/types'
import type { DashboardModuleDefinition } from '../dashboard/moduleRegistry'
import {
  fetchLatestWaveObservation,
  STATION_PAGE_URL,
  type WaveObservation
} from './api'
import type { SurfCardDetails } from './types'

const base: Pick<DashboardCardModel, 'id' | 'title' | 'subtitle'> = {
  id: 'surf',
  title: 'Surf Report',
  subtitle: '2nd St N / NOAA 41114'
}

export const surfModule: DashboardModuleDefinition = {
  ...base,
  createLoadingCard: () => ({
    ...base,
    status: 'loading'
  }),
  createDemoCard: () => ({
    ...base,
    status: 'ready',
    updatedAt: '6:40 PM',
    tone: 'success',
    surfDetails: buildSurfDetails({
      waveHeightFeet: 3.1,
      periodSeconds: 7,
      waterTempF: 77
    }),
    content: {
      headline: 'Surf 3.1 ft @ 7s (ESE)',
      body: 'Waist to chest with a steady 7s period and light winds. Water 77F. Tap through for full buoy obs.',
      actionLabel: 'Buoy 41114',
      actionHref: STATION_PAGE_URL
    }
  }),
  loadCard: async (signal) => {
    try {
      const observation = await fetchLatestWaveObservation(signal)
      if (!observation) {
        return createFallbackCard('No recent wave readings from buoy 41114. Showing placeholders.')
      }
      return buildCardFromObservation(observation)
    } catch (error) {
      console.warn('Surf module falling back to placeholder data', error)
      return createFallbackCard('Live buoy data blocked. Showing placeholders.')
    }
  }
}

function buildCardFromObservation(
  observation: WaveObservation
): DashboardCardModel {
  const heightFt = metersToFeet(observation.waveHeightMeters)
  const heightLabel = `${heightFt.toFixed(1)} ft`
  const periodSeconds = observation.dominantPeriodSeconds
  const periodLabel =
    typeof periodSeconds === 'number' && Number.isFinite(periodSeconds)
      ? `${Math.round(periodSeconds)}s`
      : null
  const directionLabel = formatDirection(observation.meanDirectionDeg)

  const headlineParts = ['Surf', heightLabel]
  if (periodLabel) headlineParts.push(`@ ${periodLabel}`)
  if (directionLabel) headlineParts.push(`(${directionLabel})`)

  const waterTempF =
    typeof observation.waterTempC === 'number'
      ? celsiusToFahrenheit(observation.waterTempC)
      : null

  const details = [
    `Buoy ${observation.stationId} shows ${heightLabel}${periodLabel ? ` @ ${periodLabel}` : ''}${directionLabel ? ` from ${directionLabel}` : ''}.`,
    waterTempF ? `Water temp ${Math.round(waterTempF)}F.` : null,
    'Tap for full marine obs.'
  ].filter((line): line is string => Boolean(line))

  return {
    ...base,
    status: 'ready',
    tone: 'success',
    updatedAt: formatUpdatedAt(observation.timestampUtc) ?? undefined,
    surfDetails: buildSurfDetails({
      waveHeightFeet: heightFt,
      periodSeconds: periodSeconds ?? null,
      waterTempF: waterTempF ?? null
    }),
    content: {
      headline: headlineParts.join(' '),
      body: details.join('\n'),
      actionLabel: 'Open buoy page',
      actionHref: STATION_PAGE_URL
    }
  }
}

function formatDirection(degrees?: number) {
  if (typeof degrees !== 'number' || !Number.isFinite(degrees)) {
    return null
  }
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round((degrees % 360) / 45) % 8
  const cardinal = dirs[index]
  return `${cardinal} ${Math.round(degrees)}`
}

function metersToFeet(value: number) {
  return value * 3.28084
}

function celsiusToFahrenheit(value: number) {
  return (value * 9) / 5 + 32
}

function formatUpdatedAt(isoString?: string) {
  if (!isoString) {
    return null
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York'
    })
    return `${formatter.format(new Date(isoString))} ET`
  } catch {
    return null
  }
}

function buildSurfDetails(input: {
  waveHeightFeet: number
  periodSeconds: number | null
  waterTempF: number | null
}): SurfCardDetails {
  const { waveHeightFeet, periodSeconds, waterTempF } = input
  const baseTemp = waterTempF ?? 78
  const rainChancePercent = 15

  const waveMultipliers = [
    1,
    1.05,
    1.12,
    1.22,
    1.18,
    1.1,
    1.05,
    0.98,
    0.9
  ]
  const wavePoints = waveMultipliers.map((multiplier, index) => ({
    label: index === 0 ? 'Now' : `+${index}h`,
    feet: Math.max(0.5, waveHeightFeet * multiplier)
  }))

  const tidePoints = [
    { label: 'Now', feet: 0.6 },
    { label: '+1h', feet: 1.2 },
    { label: '+2h', feet: 2.0 },
    { label: '+3h', feet: 2.9 },
    { label: '+4h', feet: 3.4 },
    { label: '+5h', feet: 2.6 },
    { label: '+6h', feet: 1.8 },
    { label: '+7h', feet: 1.0 },
    { label: '+8h', feet: 0.5 }
  ]

  const weatherHours = tidePoints.map((tidePoint, index) => {
    const baseTempFall = Math.min(index * 1, 6)
    const temp = Math.max(70, baseTemp - baseTempFall)
    const waveForHour = wavePoints[index]?.feet ?? waveHeightFeet
    const rain = Math.min(10 + index * 4, 60)
    const condition: 'sun' | 'cloud' | 'rain' | 'storm' =
      rain >= 50 ? 'storm' : rain >= 30 ? 'rain' : index >= 2 ? 'cloud' : 'sun'

    return {
      label: tidePoint.label,
      temperatureF: Math.round(temp),
      rainChancePercent: rain,
      condition,
      tideFeet: tidePoint.feet,
      waveFeet: waveForHour
    }
  })

  const surfScoreValue = Math.min(
    100,
    Math.max(
      10,
      Math.round(waveHeightFeet * 15 + (periodSeconds ?? 0) * 2)
    )
  )
  const sunriseScoreValue = 68

  return {
    temperatureF: Math.round(baseTemp),
    rainChancePercent,
    wavePoints,
    tidePoints,
    weatherHours,
    surfScore: { label: 'Surf score', value: surfScoreValue },
    sunriseScore: { label: 'Sunrise score', value: sunriseScoreValue },
    note: 'Forecast placeholders - real weather APIs pending.'
  }
}

function createFallbackCard(reason: string): DashboardCardModel {
  return {
    ...base,
    status: 'ready',
    tone: 'warning',
    surfDetails: buildSurfDetails({
      waveHeightFeet: 2.8,
      periodSeconds: 7,
      waterTempF: 77
    }),
    content: {
      headline: 'Surf 2.8 ft @ 7s (placeholder)',
      body: reason,
      actionLabel: 'Buoy 41114',
      actionHref: STATION_PAGE_URL
    }
  }
}
