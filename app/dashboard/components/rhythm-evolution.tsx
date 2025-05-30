"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { RhythmEvolution } from "../actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RhythmEvolutionCardProps {
  rhythmData: RhythmEvolution | null
  availableSports?: string[]
  onSportChange?: (sport: string) => void
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function formatRhythm(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = Math.round(secondsPerKm % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatRhythmForChart(secondsPerKm: number): number {
  // Convert to decimal minutes for easier chart reading
  return Math.round((secondsPerKm / 60) * 100) / 100
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length && label) {
    const data = payload[0]
    const date = new Date(label)
    
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
        <p className="text-gray-300 text-sm mb-1">
          {format(date, "d MMM, yyyy", { locale: es })}
        </p>
        <p className="text-[#4DFF9F] font-medium">
          Ritmo: {formatRhythm(data.value * 60)} min/km
        </p>
      </div>
    )
  }
  
  return null
}

export function RhythmEvolutionCard({ 
  rhythmData, 
  availableSports = [], 
  onSportChange 
}: RhythmEvolutionCardProps) {
  const [showSportSelector, setShowSportSelector] = useState(false)

  if (!rhythmData) {
    return (
      <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center text-white">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
            Evolución del Ritmo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-2">
            <p className="text-gray-400">No hay datos de ritmo disponibles</p>
            <p className="text-gray-500 text-sm">
              Registra actividades de distancia para ver tu evolución
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const chartData = rhythmData.dataPoints.map(point => ({
    date: point.date.toISOString(),
    rhythm: formatRhythmForChart(point.averageRhythm),
    originalRhythm: point.averageRhythm
  }))

  return (
    <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center text-white">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
            Evolución del Ritmo
          </CardTitle>
          
          {/* Sport Selector */}
          {availableSports.length > 1 && onSportChange && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSportSelector(!showSportSelector)}
                className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 text-gray-300"
              >
                {rhythmData.sportName}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              
              {showSportSelector && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 min-w-[150px]">
                  {availableSports.map((sport) => (
                    <button
                      key={sport}
                      onClick={() => {
                        onSportChange(sport)
                        setShowSportSelector(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                        sport === rhythmData.sportName ? 'text-purple-400' : 'text-gray-300'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-gray-400 text-sm mt-1">
          {rhythmData.sportName} - Últimos 30 días
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: es })}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                tickFormatter={(value) => `${value.toFixed(1)}`}
                label={{ 
                  value: 'min/km', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: '12px' }
                }}
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="rhythm" 
                stroke="#4DFF9F" 
                strokeWidth={2}
                dot={{ fill: '#4DFF9F', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#4DFF9F', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
          <div>
            <p className="text-gray-400 text-xs mb-1">Mejor Ritmo</p>
            <p className="text-sm font-medium text-green-400">
              {formatRhythm(rhythmData.bestRhythm)} min/km
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Promedio (30 días)</p>
            <p className="text-sm font-medium text-gray-300">
              {formatRhythm(rhythmData.averageRhythm)} min/km
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 