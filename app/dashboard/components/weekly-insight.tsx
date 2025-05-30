"use client"

import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { WeeklyInsight } from "../actions"

interface WeeklyInsightCardProps {
  insight: WeeklyInsight
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

function ComparisonIndicator({ current, previous, label }: { current: number, previous: number, label: string }) {
  const isIncrease = current > previous
  const isDifferent = current !== previous
  const percentChange = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0
  
  if (!isDifferent) {
    return (
      <div className="text-xs text-gray-500">
        {label}: igual que la semana pasada
      </div>
    )
  }
  
  return (
    <div className={`text-xs flex items-center gap-1 ${isIncrease ? 'text-green-400' : 'text-red-400'}`}>
      {isIncrease ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {label}: {Math.abs(percentChange)}% {isIncrease ? 'más' : 'menos'} que la semana pasada
    </div>
  )
}

export function WeeklyInsightCard({ insight }: WeeklyInsightCardProps) {
  const totalActivities = insight.currentWeek.distribution.fuerza + 
                         insight.currentWeek.distribution.duracion + 
                         insight.currentWeek.distribution.distancia

  const getDistributionPercentage = (value: number) => {
    return totalActivities > 0 ? Math.round((value / totalActivities) * 100) : 0
  }

  return (
    <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center text-white">
          <TrendingUp className="h-5 w-5 mr-2 text-[#4DFF9F]" />
          Flash Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini estadísticas principales */}
        <div className="grid grid-cols-2 gap-4">
          {/* Sesiones */}
          <div>
            <p className="text-gray-400 text-xs mb-1">Sesiones</p>
            <p className="text-2xl font-bold text-white">{insight.currentWeek.sessions}</p>
            <ComparisonIndicator 
              current={insight.currentWeek.sessions} 
              previous={insight.previousWeek.sessions}
              label="Sesiones"
            />
          </div>

          {/* Tiempo Activo */}
          <div>
            <p className="text-gray-400 text-xs mb-1">Tiempo Activo</p>
            <p className="text-2xl font-bold text-white">
              {formatTime(insight.currentWeek.totalActiveTime)}
            </p>
            <ComparisonIndicator 
              current={insight.currentWeek.totalActiveTime} 
              previous={insight.previousWeek.totalActiveTime}
              label="Tiempo"
            />
          </div>
        </div>

        {/* Distribución de actividad */}
        {totalActivities > 0 && (
          <div>
            <p className="text-gray-400 text-xs mb-2">Enfoque Semanal</p>
            
            {/* Barras horizontales de distribución */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4D9FFF]"></div>
                  <span className="text-gray-300">Fuerza</span>
                </div>
                <span className="text-gray-400">{getDistributionPercentage(insight.currentWeek.distribution.fuerza)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-[#4D9FFF] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getDistributionPercentage(insight.currentWeek.distribution.fuerza)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4DFF9F]"></div>
                  <span className="text-gray-300">Duración</span>
                </div>
                <span className="text-gray-400">{getDistributionPercentage(insight.currentWeek.distribution.duracion)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-[#4DFF9F] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getDistributionPercentage(insight.currentWeek.distribution.duracion)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-gray-300">Distancia</span>
                </div>
                <span className="text-gray-400">{getDistributionPercentage(insight.currentWeek.distribution.distancia)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getDistributionPercentage(insight.currentWeek.distribution.distancia)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 