import './App.css'
import { AppHeader } from './components/AppHeader'
import { DashboardCard } from './components/DashboardCard'
import { useDashboardCards } from './modules/dashboard/useDashboardCards'

function App() {
  const { cards, isRefreshing, refresh } = useDashboardCards()

  return (
    <div className="app-shell">
      <AppHeader onRefresh={refresh} isRefreshing={isRefreshing} />
      <main className="dashboard-grid">
        {cards.map((card) => (
          <DashboardCard key={card.id} card={card} />
        ))}
      </main>
    </div>
  )
}

export default App
