import type { DashboardCardModel } from '../dashboard/types'
import type { DashboardModuleDefinition } from '../dashboard/moduleRegistry'

const base: Pick<DashboardCardModel, 'id' | 'title' | 'subtitle'> = {
  id: 'liveView',
  title: 'Beach Cam',
  subtitle: 'Shepard Park overlook'
}

export const liveViewModule: DashboardModuleDefinition = {
  ...base,
  createLoadingCard: () => ({
    ...base,
    status: 'loading'
  }),
  createDemoCard: () => ({
    ...base,
    status: 'ready',
    updatedAt: 'Streaming now',
    tone: 'warning',
    content: {
      headline: 'Visibility: 6/10',
      body: 'Mid-level clouds drifting inland. Tap for live webcam + lightning tracker.',
      actionLabel: 'Open live view',
      actionHref: 'https://www.youtube.com/watch?v=DGIXT7ce3vQ'
    }
  })
}
