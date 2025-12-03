import type { DashboardCardModel } from '../dashboard/types'
import type { DashboardModuleDefinition } from '../dashboard/moduleRegistry'

const base: Pick<DashboardCardModel, 'id' | 'title' | 'subtitle'> = {
  id: 'tides',
  title: 'Tide Tracker',
  subtitle: 'Cocoa Beach Pier (NOAA 8721604)'
}

export const tidesModule: DashboardModuleDefinition = {
  ...base,
  createLoadingCard: () => ({
    ...base,
    status: 'loading'
  }),
  createDemoCard: () => ({
    ...base,
    status: 'ready',
    updatedAt: 'Updated 6:40 PM',
    content: {
      headline: 'High tide 4:32 PM • 4.5 ft',
      body: 'Next low tide 10:41 PM • -0.2 ft. Sunrise rip current risk: low.'
    }
  })
}
