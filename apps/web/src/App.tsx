import './App.css'
import { AppHeader } from './components/AppHeader'
import { DashboardCard } from './components/DashboardCard'
import { ManagerConsole } from './components/ManagerConsole'
import { useDashboardCards } from './modules/dashboard/useDashboardCards'

function App() {
  const { cards, isRefreshing, refresh } = useDashboardCards()

  return (
    <div className="app-shell">
      <AppHeader onRefresh={refresh} isRefreshing={isRefreshing} />
      <ManagerConsole />
      <main className="dashboard-grid">
        {cards.map((card) => (
          <DashboardCard key={card.id} card={card} />
        ))}
      </main>
    </div>
  )
}

export default App
