import type { SurfCardDetails } from '../surf/types'

export type CardStatus = 'loading' | 'ready' | 'error'

export type CardTone = 'default' | 'success' | 'warning'

export type CardId = 'launches' | 'tides' | 'surf' | 'music' | 'liveView'

export type CardContent = {
  headline: string
  body: string
  actionLabel?: string
  actionHref?: string
}

export type DashboardCardModel = {
  id: CardId
  title: string
  subtitle: string
  status: CardStatus
  content?: CardContent
  updatedAt?: string
  tone?: CardTone
  errorMessage?: string
  countdownTargetUtc?: string
  surfDetails?: SurfCardDetails
}
