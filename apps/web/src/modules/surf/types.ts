export type SurfWavePoint = {
  label: string
  feet: number
}

export type TidePoint = {
  label: string
  feet: number
}

export type WeatherHour = {
  label: string
  temperatureF: number
  rainChancePercent: number
  condition: 'sun' | 'cloud' | 'rain' | 'storm'
  tideFeet: number
  waveFeet: number
}

export type SurfCardDetails = {
  temperatureF: number
  rainChancePercent: number
  wavePoints: SurfWavePoint[]
  tidePoints: TidePoint[]
  weatherHours: WeatherHour[]
  surfScore: { label: string; value: number }
  sunriseScore: { label: string; value: number }
  note?: string
  ctaLabel?: string
  ctaHref?: string
}
