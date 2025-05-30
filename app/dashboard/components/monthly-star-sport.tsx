"use client"

import { Star, Dumbbell, Clock, Route, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { MonthlyStarSport } from "../actions"

interface MonthlyStarSportCardProps {
  starSport: MonthlyStarSport | null
}

function getSportIcon(category: string) {
  switch (category) {
    case 'Fuerza':
      return <Dumbbell className="h-8 w-8" />
    case 'Duración':
      return <Clock className="h-8 w-8" />
    case 'Distancia + Tiempo':
      return <Route className="h-8 w-8" />
    default:
      return <Trophy className="h-8 w-8" />
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'Fuerza':
      return {
        bg: 'from-[#4D9FFF]/20 to-[#4D9FFF]/5',
        border: 'border-[#4D9FFF]/30',
        icon: 'text-[#4D9FFF]',
        accent: 'text-[#4D9FFF]'
      }
    case 'Duración':
      return {
        bg: 'from-[#4DFF9F]/20 to-[#4DFF9F]/5',
        border: 'border-[#4DFF9F]/30',
        icon: 'text-[#4DFF9F]',
        accent: 'text-[#4DFF9F]'
      }
    case 'Distancia + Tiempo':
      return {
        bg: 'from-purple-500/20 to-purple-500/5',
        border: 'border-purple-500/30',
        icon: 'text-purple-400',
        accent: 'text-purple-400'
      }
    default:
      return {
        bg: 'from-gray-500/20 to-gray-500/5',
        border: 'border-gray-500/30',
        icon: 'text-gray-400',
        accent: 'text-gray-400'
      }
  }
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

function getEncouragementMessage(sportName: string, category: string) {
  const messages = {
    'Fuerza': [
      `¡Tu dedicación a ${sportName} es admirable!`,
      `¡Sigue construyendo esa fuerza!`,
      `¡${sportName} te está fortaleciendo!`
    ],
    'Duración': [
      `¡Tu resistencia en ${sportName} es increíble!`,
      `¡Sigue manteniendo esa constancia!`,
      `¡${sportName} está mejorando tu resistencia!`
    ],
    'Distancia + Tiempo': [
      `¡Sigue recorriendo hacia tus metas!`,
      `¡Cada kilómetro cuenta!`,
      `¡Tu progreso en ${sportName} es notable!`
    ]
  }
  
  const categoryMessages = messages[category as keyof typeof messages] || [
    `¡Excelente trabajo con ${sportName}!`
  ]
  
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)]
}

export function MonthlyStarSportCard({ starSport }: MonthlyStarSportCardProps) {
  if (!starSport) {
    return (
      <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <Star className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Aún no hay datos suficientes</p>
              <p className="text-gray-500 text-xs">¡Registra más actividades este mes!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const colors = getCategoryColor(starSport.category)
  
  return (
    <Card className={`bg-gradient-to-br ${colors.bg} ${colors.border} border-2 shadow-lg relative overflow-hidden`}>
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center text-white">
          <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
          Conquista del Mes
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Sport Icon */}
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${colors.icon} shadow-lg`}>
            {getSportIcon(starSport.category)}
          </div>

          {/* Sport Name */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">
              {starSport.sportName}
            </h3>
          </div>

          {/* Key Metric */}
          <div className="space-y-1">
            <p className={`text-lg font-medium ${colors.accent}`}>
              {starSport.sessionsCount} sesiones este mes
            </p>
            {starSport.totalTime && starSport.totalTime > 0 && (
              <p className="text-gray-400 text-sm">
                {formatTime(starSport.totalTime)} dedicadas
              </p>
            )}
          </div>

          {/* Encouragement Message */}
          <p className="text-gray-300 text-sm italic">
            {getEncouragementMessage(starSport.sportName, starSport.category)}
          </p>

          {/* Decorative stars */}
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <Star 
                key={i} 
                className="h-4 w-4 text-yellow-400 fill-current" 
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 