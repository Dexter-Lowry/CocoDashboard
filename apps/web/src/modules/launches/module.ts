import type { DashboardCardModel } from '../dashboard/types'
import type { DashboardModuleDefinition } from '../dashboard/moduleRegistry'
import {
  fetchUpcomingCapeLaunches,
  type LaunchSummary
} from './api'

const base: Pick<DashboardCardModel, 'id' | 'title' | 'subtitle'> = {
  id: 'launches',
  title: 'Rocket Tracker',
  subtitle: 'Cape & KSC launch outlook'
}

export const launchesModule: DashboardModuleDefinition = {
  ...base,
  createLoadingCard: () => ({
    ...base,
    status: 'loading'
  }),
  createDemoCard: () => ({
    ...base,
    status: 'ready',
    tone: 'success',
    updatedAt: 'NET 9:36 PM ET',
    content: {
      headline: 'Falcon 9 • Starlink 8-4',
      body: 'SLC-40 • 80% favorable — winds calm, clouds <20%. Crew ferry Monday remains on track.',
      actionLabel: 'Full launch details',
      actionHref: 'https://www.visitspacecoast.com/launches/'
    }
  }),
  loadCard: async (signal) => {
    const launches = await fetchUpcomingCapeLaunches(signal)
    if (!launches.length) {
      return {
        ...base,
        status: 'ready',
        content: {
          headline: 'No Cape launches scheduled',
          body: 'Launch Library 2 has no Kennedy Space Center or Cape Canaveral attempts on the calendar right now.'
        }
      }
    }
    return buildCardFromLaunch(launches[0])
  }
}

function buildCardFromLaunch(launch: LaunchSummary): DashboardCardModel {
  const localNet = formatEasternLocal(launch.netUtc)
  const padParts: string[] = []
  if (launch.padName) padParts.push(launch.padName)
  if (launch.locationName) padParts.push(launch.locationName)
  const padLabel = padParts.join(' — ')
  const lines = [
    launch.rocketName ? `Rocket: ${launch.rocketName}` : null,
    launch.payloadName ? `Payload: ${launch.payloadName}` : null,
    padLabel ? `Pad: ${padLabel}` : null,
    localNet ? `NET (${localNet})` : null,
    launch.missionType ? `Mission type: ${launch.missionType}` : null,
    '',
    launch.payloadDescription ?? 'Payload description not available.'
  ]

  const body = lines
    .filter((line): line is string => Boolean(line))
    .join('\n')

  return {
    ...base,
    status: 'ready',
    tone: 'success',
    countdownTargetUtc: launch.netUtc,
    content: {
      headline: launch.displayName,
      body,
      actionLabel: 'Full launch details',
      actionHref: launch.detailUrl ?? 'https://www.visitspacecoast.com/launches/'
    }
  }
}

function formatEasternLocal(iso?: string) {
  if (!iso) {
    return null
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/New_York'
    })
    return formatter.format(new Date(iso))
  } catch {
    return null
  }
}
