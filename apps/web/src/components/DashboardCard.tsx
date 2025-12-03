import type { DashboardCardModel } from '../modules/dashboard/types'
import { useCountdown } from '../hooks/useCountdown'
import { SurfCardContent } from './SurfCardContent'

type DashboardCardProps = {
  card: DashboardCardModel
}

export function DashboardCard({ card }: DashboardCardProps) {
  const countdown = useCountdown(card.countdownTargetUtc)
  const heroTitle = card.content?.headline ?? card.subtitle

  return (
    <article className={`dashboard-card tone-${card.tone ?? 'default'}`}>
      <div className="card-inner">
        <div className="card-hero">
          <p className="hero-label">{card.title}</p>
          <p className="hero-title">{heroTitle}</p>
        </div>

        <section className="card-body">
          {!countdown &&
            card.updatedAt &&
            card.id !== 'surf' && (
              <span className="timestamp-chip">
                Updated {card.updatedAt}
              </span>
            )}

          {card.status === 'loading' && (
            <div className="loading-state">
              <span className="spinner" aria-hidden="true" />
              <p>Loading live data...</p>
            </div>
          )}

          {card.status === 'error' && (
            <div className="error-state" role="alert">
              <strong>Heads up:</strong>
              <p>{card.errorMessage ?? 'Unable to fetch this feed.'}</p>
            </div>
          )}

          {card.status === 'ready' && card.content && (
            card.id === 'surf' && card.surfDetails ? (
              <SurfCardContent
                details={card.surfDetails}
                updatedAt={card.updatedAt}
                actionHref={card.content.actionHref}
                actionLabel={card.content.actionLabel}
              />
            ) : (
              <div className="content-state">
                <p className="body">{card.content.body}</p>
                {card.content.actionLabel && card.content.actionHref && (
                  <a
                    className="cta"
                    href={card.content.actionHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {card.content.actionLabel}
                  </a>
                )}
              </div>
            )
          )}
        </section>
      </div>

      {countdown && (
        <CountdownPanel countdown={countdown} />
      )}
    </article>
  )
}

function CountdownPanel({
  countdown
}: {
  countdown: ReturnType<typeof useCountdown>
}) {
  if (!countdown) return null

  if (countdown.kind === 'inProgress') {
    return (
      <div className="countdown-panel">
        <span className="countdown-label">{countdown.message}</span>
      </div>
    )
  }

  return (
    <div className="countdown-panel">
      <span className="countdown-label">Liftoff in</span>
      <div className="countdown-segments">
        {countdown.segments.map((segment) => (
          <div key={segment.unit} className="countdown-segment">
            <span className="countdown-value">{segment.value}</span>
            <span className="countdown-unit">{segment.unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
