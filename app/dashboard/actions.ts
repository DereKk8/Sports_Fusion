"use server"

import { getDb } from "@/server/db"
import { sesiones, actividades, actividades_fuerza, actividades_duracion, actividades_distancia } from "@/server/db/schema"
import { desc, eq } from 'drizzle-orm'

export type ActivityData = {
  id: string
  name: string
  mode: "Fuerza" | "Duración" | "Distancia + Tiempo"
  data: {
    series?: number
    repetitions?: number
    weight?: number
    duration?: number
    distance?: number
    time?: number
    ritmo?: number
  }
}

export type SessionWithActivities = {
  id: string
  date: Date
  note: string | null
  activities: ActivityData[]
}

export async function getAllSessions(): Promise<SessionWithActivities[]> {
  const db = await getDb()
  
  // Get all sessions sorted by created_at desc
  const sessions = await db.select()
    .from(sesiones)
    .orderBy(desc(sesiones.created_at))

  // For each session, get its activities and their specific data
  const sessionsWithActivities = await Promise.all(
    sessions.map(async (session) => {
      // Get all activities for this session
      const sessionActivities = await db.select()
        .from(actividades)
        .where(eq(actividades.sesion_id, session.id))

      // For each activity, get its specific data based on mode
      const activitiesWithData = await Promise.all(
        sessionActivities.map(async (activity): Promise<ActivityData> => {
          let specificData = {}

          switch (activity.modo) {
            case 'Fuerza': {
              const strengthData = await db.select({
                series: actividades_fuerza.series,
                repeticiones: actividades_fuerza.repeticiones,
                peso: actividades_fuerza.peso
              })
              .from(actividades_fuerza)
              .where(eq(actividades_fuerza.actividad_id, activity.id))
              .limit(1)

              if (strengthData.length > 0) {
                specificData = {
                  series: strengthData[0].series,
                  repetitions: strengthData[0].repeticiones,
                  weight: strengthData[0].peso
                }
              }
              break
            }
            case 'Duración': {
              const durationData = await db.select({
                duracion: actividades_duracion.duracion
              })
              .from(actividades_duracion)
              .where(eq(actividades_duracion.actividad_id, activity.id))
              .limit(1)

              if (durationData.length > 0) {
                specificData = {
                  duration: durationData[0].duracion
                }
              }
              break
            }
            case 'Distancia + Tiempo': {
              const distanceData = await db.select({
                distancia: actividades_distancia.distancia,
                tiempo: actividades_distancia.tiempo,
                ritmo: actividades_distancia.ritmo
              })
              .from(actividades_distancia)
              .where(eq(actividades_distancia.actividad_id, activity.id))
              .limit(1)

              if (distanceData.length > 0) {
                specificData = {
                  distance: distanceData[0].distancia,
                  time: distanceData[0].tiempo,
                  ritmo: distanceData[0].ritmo
                }
              }
              break
            }
          }

          return {
            id: activity.id,
            name: activity.deporte,
            mode: activity.modo,
            data: specificData
          }
        })
      )

      return {
        id: session.id,
        date: session.fecha,
        note: session.nota,
        activities: activitiesWithData
      }
    })
  )

  return sessionsWithActivities
} 