import type {
  SurfCardDetails,
  SurfWavePoint,
  TidePoint,
  WeatherHour
} from '../modules/surf/types'

type SurfCardContentProps = {
  details: SurfCardDetails
  updatedAt?: string
  actionLabel?: string
  actionHref?: string
}

export function SurfCardContent({
  details,
  updatedAt,
  actionHref,
  actionLabel
}: SurfCardContentProps) {
  return (
    <div className="surf-layout">
      <div className="surf-top-grid">
        <StatCard
          label="Temperature"
          value={`${details.temperatureF} F`}
        />
        <StatCard
          label="Rain chance"
          value={`${details.rainChancePercent}%`}
        />
      </div>

      <div className="surf-chart-block">
        <div className="surf-chart-header">
          <span className="chart-title">Surf + tide (next 8h)</span>
          <span className="chart-updated">
            {updatedAt ? `Updated ${updatedAt}` : 'Hourly'}
          </span>
        </div>
        <MultiSparkline
          wavePoints={details.wavePoints}
          tidePoints={details.tidePoints}
          weatherHours={details.weatherHours}
        />
        <HourlyWeather hours={details.weatherHours} />
      </div>

      <div className="surf-bottom-grid">
        <StatCard
          label={details.surfScore.label}
          value={`${details.surfScore.value}`}
        />
        <StatCard
          label={details.sunriseScore.label}
          value={`${details.sunriseScore.value}`}
        />
      </div>

      {details.note && (
        <p className="surf-note">{details.note}</p>
      )}

      {actionHref && actionLabel && (
        <a
          className="cta"
          href={actionHref}
          target="_blank"
          rel="noreferrer"
        >
          {actionLabel}
        </a>
      )}
    </div>
  )
}

function StatCard({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div className="surf-stat-card">
      <p className="surf-stat-label">{label}</p>
      <p className="surf-stat-value">{value}</p>
    </div>
  )
}

function MultiSparkline({
  wavePoints,
  tidePoints,
  weatherHours
}: {
  wavePoints: SurfWavePoint[]
  tidePoints: TidePoint[]
  weatherHours: WeatherHour[]
}) {
  if (!wavePoints.length || !tidePoints.length) return null

  const width = 340
  const height = 170
  const paddingY = 18
  const allFeet = [...wavePoints, ...tidePoints].map((p) => p.feet)
  const rawMin = Math.min(...allFeet)
  const rawMax = Math.max(...allFeet)
  const minFeet = Math.max(0, rawMin - 0.3)
  const maxFeet = rawMax + 0.3
  const range = Math.max(0.5, maxFeet - minFeet)
  const step = Math.min(
    wavePoints.length > 1 ? width / (wavePoints.length - 1) : width,
    tidePoints.length > 1 ? width / (tidePoints.length - 1) : width
  )

  const toPoints = (points: Array<{ label: string; feet: number }>) =>
    points
      .map((point, index) => {
        const x = index * step
        const normalized = (point.feet - minFeet) / range
        const y =
          height - paddingY - normalized * (height - paddingY * 2)
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')

  const waveString = toPoints(wavePoints)
  const tideString = toPoints(tidePoints)

  const ticks = buildTicks(minFeet, maxFeet, 4)

  return (
    <div className="surf-sparkline">
      <div className="sparkline-area">
        <div className="sparkline-yaxis">
          {ticks.map((tick) => (
            <span key={tick} className="yaxis-tick">
              {tick.toFixed(1)} ft
            </span>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Wave and tide height"
        >
          <polyline
            fill="none"
            stroke="rgba(79, 195, 247, 0.9)"
            strokeWidth="4"
            points={waveString}
            strokeLinecap="round"
          />
          <polyline
            fill="none"
            stroke="rgba(111, 207, 151, 0.9)"
            strokeWidth="3"
            strokeDasharray="6 4"
            points={tideString}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="sparkline-legend">
        <span className="legend-chip wave">Wave height</span>
        <span className="legend-chip tide">Tide height</span>
      </div>
      <div className="sparkline-icons">
        {weatherHours.slice(0, wavePoints.length).map((hour) => (
          <span
            key={hour.label}
            className="sparkline-icon"
            title={hour.condition}
            aria-label={hour.condition}
          >
            {conditionIcon(hour.condition)}
          </span>
        ))}
      </div>
      <div className="surf-sparkline-labels">
        {wavePoints.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  )
}

function buildTicks(min: number, max: number, count: number) {
  if (count < 2) return [max, min]
  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, i) => max - i * step)
}

function HourlyWeather({ hours }: { hours: WeatherHour[] }) {
  if (!hours.length) return null

  return (
    <div className="hourly-grid">
      {hours.map((hour) => (
        <div key={hour.label} className="hour-card">
          <span className="hour-label">{hour.label}</span>
          <span
            className="hour-icon"
            aria-label={hour.condition}
            title={hour.condition}
          >
            {conditionIcon(hour.condition)}
          </span>
          <span className="hour-temp">{hour.temperatureF}°F</span>
          <span className="hour-wave">{hour.waveFeet.toFixed(1)} ft waves</span>
          <span className="hour-tide">{hour.tideFeet.toFixed(1)} ft tide</span>
          <span className="hour-rain">{hour.rainChancePercent}% rain</span>
        </div>
      ))}
    </div>
  )
}

function conditionIcon(condition: WeatherHour['condition']) {
  switch (condition) {
    case 'sun':
      return '☀'
    case 'cloud':
      return '☁'
    case 'rain':
      return '🌧'
    case 'storm':
      return '⛈'
    default:
      return '☀'
  }
}
