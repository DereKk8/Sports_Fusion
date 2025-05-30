import { getAllSessions, getWeeklyInsight, getMonthlyStarSport, getRhythmEvolution } from "./actions"
import { DashboardContent } from "./components/dashboard-content"

// Revalidar cada 60 segundos como fallback para asegurar que los datos se actualicen
export const revalidate = 60

export default async function DashboardPage() {
  // Get all data in parallel for better performance
  const [sessions, weeklyInsight, monthlyStarSport, rhythmEvolution] = await Promise.all([
    getAllSessions(),
    getWeeklyInsight(),
    getMonthlyStarSport(),
    getRhythmEvolution()
  ])

  return (
    <DashboardContent 
      initialSessions={sessions}
      weeklyInsight={weeklyInsight}
      monthlyStarSport={monthlyStarSport}
      rhythmEvolution={rhythmEvolution}
    />
  )
}
