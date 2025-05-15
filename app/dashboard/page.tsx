import { getAllSessions } from "./actions"
import { DashboardContent } from "./components/dashboard-content"

export default async function DashboardPage() {
  const sessions = await getAllSessions()

  return <DashboardContent initialSessions={sessions} />
}
