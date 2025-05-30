"use server"

import { getDb } from "@/server/db"
import { sesiones, actividades, actividades_fuerza, actividades_duracion, actividades_distancia } from "@/server/db/schema"
import { desc, eq, and, gte, lte } from 'drizzle-orm'

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

// New types for insights
export type WeeklyInsight = {
  currentWeek: {
    sessions: number
    totalActiveTime: number // in minutes
    distribution: {
      fuerza: number
      duracion: number
      distancia: number
    }
  }
  previousWeek: {
    sessions: number
    totalActiveTime: number
  }
}

export type MonthlyStarSport = {
  sportName: string
  category: "Fuerza" | "Duración" | "Distancia + Tiempo"
  sessionsCount: number
  totalTime?: number // for duration and distance sports
}

export type RhythmEvolution = {
  sportName: string
  dataPoints: Array<{
    date: Date
    averageRhythm: number // in seconds per km
  }>
  bestRhythm: number
  averageRhythm: number // last 30 days
}

// Helper function to get week boundaries
function getWeekBoundaries(weekOffset: number = 0) {
  const now = new Date()
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Get the start of the week (Monday)
  const dayOfWeek = currentDate.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - daysToMonday - (weekOffset * 7))
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return { startOfWeek, endOfWeek }
}

export async function getWeeklyInsight(): Promise<WeeklyInsight> {
  const db = await getDb()
  
  const currentWeek = getWeekBoundaries(0)
  const previousWeek = getWeekBoundaries(1)
  
  // Get current week data
  const currentWeekSessions = await db.select()
    .from(sesiones)
    .where(and(
      gte(sesiones.fecha, currentWeek.startOfWeek),
      lte(sesiones.fecha, currentWeek.endOfWeek)
    ))
  
  // Get previous week data
  const previousWeekSessions = await db.select()
    .from(sesiones)
    .where(and(
      gte(sesiones.fecha, previousWeek.startOfWeek),
      lte(sesiones.fecha, previousWeek.endOfWeek)
    ))
  
  // Calculate current week metrics
  let currentWeekActiveTime = 0
  const currentWeekDistribution = { fuerza: 0, duracion: 0, distancia: 0 }
  
  for (const session of currentWeekSessions) {
    const sessionActivities = await db.select()
      .from(actividades)
      .where(eq(actividades.sesion_id, session.id))
    
    for (const activity of sessionActivities) {
      switch (activity.modo) {
        case 'Duración': {
          const durationData = await db.select()
            .from(actividades_duracion)
            .where(eq(actividades_duracion.actividad_id, activity.id))
            .limit(1)
          
          if (durationData.length > 0) {
            currentWeekActiveTime += Math.floor(durationData[0].duracion / 60) // convert to minutes
          }
          currentWeekDistribution.duracion++
          break
        }
        case 'Distancia + Tiempo': {
          const distanceData = await db.select()
            .from(actividades_distancia)
            .where(eq(actividades_distancia.actividad_id, activity.id))
            .limit(1)
          
          if (distanceData.length > 0) {
            currentWeekActiveTime += Math.floor(distanceData[0].tiempo / 60) // convert to minutes
          }
          currentWeekDistribution.distancia++
          break
        }
        case 'Fuerza':
          // Estimate 45 minutes for strength training sessions
          currentWeekActiveTime += 45
          currentWeekDistribution.fuerza++
          break
      }
    }
  }
  
  // Calculate previous week metrics
  let previousWeekActiveTime = 0
  
  for (const session of previousWeekSessions) {
    const sessionActivities = await db.select()
      .from(actividades)
      .where(eq(actividades.sesion_id, session.id))
    
    for (const activity of sessionActivities) {
      switch (activity.modo) {
        case 'Duración': {
          const durationData = await db.select()
            .from(actividades_duracion)
            .where(eq(actividades_duracion.actividad_id, activity.id))
            .limit(1)
          
          if (durationData.length > 0) {
            previousWeekActiveTime += Math.floor(durationData[0].duracion / 60)
          }
          break
        }
        case 'Distancia + Tiempo': {
          const distanceData = await db.select()
            .from(actividades_distancia)
            .where(eq(actividades_distancia.actividad_id, activity.id))
            .limit(1)
          
          if (distanceData.length > 0) {
            previousWeekActiveTime += Math.floor(distanceData[0].tiempo / 60)
          }
          break
        }
        case 'Fuerza':
          previousWeekActiveTime += 45
          break
      }
    }
  }
  
  return {
    currentWeek: {
      sessions: currentWeekSessions.length,
      totalActiveTime: currentWeekActiveTime,
      distribution: currentWeekDistribution
    },
    previousWeek: {
      sessions: previousWeekSessions.length,
      totalActiveTime: previousWeekActiveTime
    }
  }
}

export async function getMonthlyStarSport(): Promise<MonthlyStarSport | null> {
  const db = await getDb()
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  // Get all sessions from current month
  const monthSessions = await db.select()
    .from(sesiones)
    .where(and(
      gte(sesiones.fecha, startOfMonth),
      lte(sesiones.fecha, endOfMonth)
    ))
  
  if (monthSessions.length === 0) return null
  
  const sportStats: Record<string, { count: number, totalTime: number, category: string }> = {}
  
  for (const session of monthSessions) {
    const sessionActivities = await db.select()
      .from(actividades)
      .where(eq(actividades.sesion_id, session.id))
    
    for (const activity of sessionActivities) {
      if (!sportStats[activity.deporte]) {
        sportStats[activity.deporte] = { count: 0, totalTime: 0, category: activity.modo }
      }
      
      sportStats[activity.deporte].count++
      
      // Calculate time based on activity type
      switch (activity.modo) {
        case 'Duración': {
          const durationData = await db.select()
            .from(actividades_duracion)
            .where(eq(actividades_duracion.actividad_id, activity.id))
            .limit(1)
          
          if (durationData.length > 0) {
            sportStats[activity.deporte].totalTime += Math.floor(durationData[0].duracion / 60)
          }
          break
        }
        case 'Distancia + Tiempo': {
          const distanceData = await db.select()
            .from(actividades_distancia)
            .where(eq(actividades_distancia.actividad_id, activity.id))
            .limit(1)
          
          if (distanceData.length > 0) {
            sportStats[activity.deporte].totalTime += Math.floor(distanceData[0].tiempo / 60)
          }
          break
        }
        case 'Fuerza':
          sportStats[activity.deporte].totalTime += 45
          break
      }
    }
  }
  
  // Find the sport with most sessions
  let maxSessions = 0
  let starSport: MonthlyStarSport | null = null
  
  for (const [sportName, stats] of Object.entries(sportStats)) {
    if (stats.count > maxSessions) {
      maxSessions = stats.count
      starSport = {
        sportName,
        category: stats.category as "Fuerza" | "Duración" | "Distancia + Tiempo",
        sessionsCount: stats.count,
        totalTime: stats.totalTime
      }
    }
  }
  
  return starSport
}

export async function getRhythmEvolution(sportName?: string): Promise<RhythmEvolution | null> {
  const db = await getDb()
  
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
  
  // Get all distance activities from the last 30 days
  const recentSessions = await db.select()
    .from(sesiones)
    .where(gte(sesiones.fecha, thirtyDaysAgo))
    .orderBy(desc(sesiones.fecha))
  
  let targetSport = sportName
  
  // If no sport specified, find the most frequent distance sport
  if (!targetSport) {
    const sportCounts: Record<string, number> = {}
    
    for (const session of recentSessions) {
      const distanceActivities = await db.select()
        .from(actividades)
        .where(and(
          eq(actividades.sesion_id, session.id),
          eq(actividades.modo, 'Distancia + Tiempo')
        ))
      
      for (const activity of distanceActivities) {
        sportCounts[activity.deporte] = (sportCounts[activity.deporte] || 0) + 1
      }
    }
    
    let maxCount = 0
    for (const [sport, count] of Object.entries(sportCounts)) {
      if (count > maxCount) {
        maxCount = count
        targetSport = sport
      }
    }
  }
  
  if (!targetSport) return null
  
  const dataPoints: Array<{ date: Date, averageRhythm: number }> = []
  let totalRhythm = 0
  let rhythmCount = 0
  let bestRhythm = Infinity
  
  for (const session of recentSessions) {
    const distanceActivities = await db.select()
      .from(actividades)
      .where(and(
        eq(actividades.sesion_id, session.id),
        eq(actividades.modo, 'Distancia + Tiempo'),
        eq(actividades.deporte, targetSport)
      ))
    
    if (distanceActivities.length === 0) continue
    
    let sessionTotalRhythm = 0
    let sessionRhythmCount = 0
    
    for (const activity of distanceActivities) {
      const distanceData = await db.select()
        .from(actividades_distancia)
        .where(eq(actividades_distancia.actividad_id, activity.id))
        .limit(1)
      
      if (distanceData.length > 0 && distanceData[0].ritmo) {
        const rhythm = distanceData[0].ritmo
        sessionTotalRhythm += rhythm
        sessionRhythmCount++
        totalRhythm += rhythm
        rhythmCount++
        
        if (rhythm < bestRhythm) {
          bestRhythm = rhythm
        }
      }
    }
    
    if (sessionRhythmCount > 0) {
      dataPoints.push({
        date: session.fecha,
        averageRhythm: sessionTotalRhythm / sessionRhythmCount
      })
    }
  }
  
  if (dataPoints.length === 0) return null
  
  return {
    sportName: targetSport,
    dataPoints: dataPoints.reverse(), // Oldest first for chart
    bestRhythm: bestRhythm === Infinity ? 0 : bestRhythm,
    averageRhythm: rhythmCount > 0 ? totalRhythm / rhythmCount : 0
  }
} 