import type { DashboardCardModel } from '../dashboard/types'
import type { DashboardModuleDefinition } from '../dashboard/moduleRegistry'

const base: Pick<DashboardCardModel, 'id' | 'title' | 'subtitle'> = {
  id: 'music',
  title: 'Live Music',
  subtitle: 'Upcoming shows within 10 miles'
}

export const musicModule: DashboardModuleDefinition = {
  ...base,
  createLoadingCard: () => ({
    ...base,
    status: 'loading'
  }),
  createDemoCard: () => ({
    ...base,
    status: 'ready',
    updatedAt: 'Updated hourly',
    content: {
      headline: 'Juice & the Jets — Bandshell',
      body: 'Friday • 8:00 PM. Also: DJ Nova (Coconuts, Sat 9 PM), Brett Michaels (Rikki Tiki, Sun 3 PM).',
      actionLabel: 'Full lineup',
      actionHref:
        'https://www.visitcocoabeach.com/events/live-music?utm_source=dashboard'
    }
  })
}
