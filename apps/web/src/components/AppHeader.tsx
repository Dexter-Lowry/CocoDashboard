type AppHeaderProps = {
  isRefreshing: boolean
  onRefresh: () => void
}

export function AppHeader({ isRefreshing, onRefresh }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Cocoa Beach • Live Ops</p>
        <h1>Coco Beach Dashboard</h1>
        <p className="subtitle">
          Launch windows, tides, music, and the beach cam at a glance.
        </p>
      </div>
      <button
        className="refresh-button"
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? 'Refreshing…' : 'Refresh data'}
      </button>
    </header>
  )
}
