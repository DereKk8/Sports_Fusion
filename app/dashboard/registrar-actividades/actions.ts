"use server"

import { getDb } from "@/server/db"
import { sesiones, actividades } from "@/server/db/schema"
import { createId } from '@paralleldrive/cuid2'

type SelectedSport = {
  id: string
  name: string
  category: {
    title: string
  }
}

export async function persistSelectedActivities(selectedSports: SelectedSport[]) {
  try {
    const db = await getDb()
    
    // Create a new session
    const sessionId = createId()
    await db.insert(sesiones).values({
      id: sessionId,
      fecha: new Date(),
      nota: 'registro',
      created_at: new Date(),
      updated_at: new Date()
    })

    // Insert all activities in a single transaction
    const activitiesToInsert = selectedSports.map(sport => ({
      id: createId(),
      sesion_id: sessionId,
      modo: sport.category.title as "fuerza" | "duracion" | "distancia_tiempo",
      deporte: sport.name
    }))

    await db.insert(actividades).values(activitiesToInsert)

    return { success: true, sessionId }
  } catch (error) {
    console.error('Error persisting activities:', error)
    return { success: false, error: 'Failed to persist activities' }
  }
} 