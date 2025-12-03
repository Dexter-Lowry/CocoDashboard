import { useEffect, useMemo, useState } from 'react'

const MILLISECOND = 1000
const MINUTE = 60 * MILLISECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

type CountdownSegment = {
  unit: string
  value: string
}

type CountdownState =
  | { kind: 'ticking'; segments: CountdownSegment[] }
  | { kind: 'inProgress'; message: string }

export function useCountdown(targetIso?: string | null): CountdownState | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!targetIso) {
      return
    }
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 30 * 1000)
    return () => clearInterval(interval)
  }, [targetIso])

  return useMemo(() => {
    if (!targetIso) {
      return null
    }
    const targetMs = Date.parse(targetIso)
    if (Number.isNaN(targetMs)) {
      return null
    }
    const diff = targetMs - now
    if (diff <= 0) {
      return { kind: 'inProgress', message: 'Launch in progress' }
    }
    const days = Math.floor(diff / DAY)
    const hours = Math.floor((diff % DAY) / HOUR)
    const minutes = Math.floor((diff % HOUR) / MINUTE)
    const segments: CountdownSegment[] = []

    if (days > 0) {
      segments.push({ unit: 'Days', value: String(days).padStart(2, '0') })
    }

    segments.push(
      { unit: 'Hours', value: String(hours).padStart(2, '0') },
      { unit: 'Minutes', value: String(minutes).padStart(2, '0') }
    )

    return { kind: 'ticking', segments }
  }, [now, targetIso])
}
