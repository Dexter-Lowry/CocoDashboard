import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createErrorCard,
  createLoadingCards,
  dashboardModules
} from './moduleRegistry'
import type { DashboardCardModel } from './types'

export const useDashboardCards = () => {
  const [cards, setCards] = useState<DashboardCardModel[]>(() =>
    createLoadingCards()
  )
  const [isRefreshing, setIsRefreshing] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const hydrateModules = useCallback(() => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    setIsRefreshing(true)
    setCards(createLoadingCards())

    const loaders = dashboardModules.map((module) => {
      if (!module.loadCard) {
        return Promise.resolve(module.createDemoCard())
      }
      return module.loadCard(controller.signal).catch((error) => {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          throw error
        }
        if (controller.signal.aborted) {
          throw error
        }
        console.error(`Failed to load module ${module.id}`, error)
        return createErrorCard(module)
      })
    })

    Promise.all(loaders)
      .then((resolvedCards) => {
        if (controller.signal.aborted) {
          return
        }
        setCards(resolvedCards)
        setIsRefreshing(false)
      })
      .catch((error) => {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }
        console.error('Dashboard refresh failed', error)
        setCards(dashboardModules.map((module) => createErrorCard(module)))
        setIsRefreshing(false)
      })
  }, [])

  useEffect(() => {
    hydrateModules()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [hydrateModules])

  const refresh = useCallback(() => {
    hydrateModules()
  }, [hydrateModules])

  return { cards, isRefreshing, refresh }
}
