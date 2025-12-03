import type { CardId, DashboardCardModel } from './types'
import { launchesModule } from '../launches/module'
import { surfModule } from '../surf/module'

export type DashboardModuleDefinition = {
  id: CardId
  title: string
  subtitle: string
  createLoadingCard: () => DashboardCardModel
  createDemoCard: () => DashboardCardModel
  loadCard?: (signal: AbortSignal) => Promise<DashboardCardModel>
}

export const dashboardModules: DashboardModuleDefinition[] = [
  launchesModule,
  surfModule
]

export const createLoadingCards = (): DashboardCardModel[] =>
  dashboardModules.map((module) => module.createLoadingCard())

export const createDemoCards = (): DashboardCardModel[] =>
  dashboardModules.map((module) => module.createDemoCard())

export const createErrorCard = (
  module: DashboardModuleDefinition,
  message = 'Broken'
): DashboardCardModel => ({
  id: module.id,
  title: module.title,
  subtitle: module.subtitle,
  status: 'error',
  errorMessage: message
})
