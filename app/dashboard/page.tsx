import { getAllSessions } from "./actions"
import { DashboardContent } from "./components/dashboard-content"

// Revalidar cada 60 segundos como fallback para asegurar que los datos se actualicen
export const revalidate = 60

export default async function DashboardPage() {
  const sessions = await getAllSessions()

  return <DashboardContent initialSessions={sessions} />
}
