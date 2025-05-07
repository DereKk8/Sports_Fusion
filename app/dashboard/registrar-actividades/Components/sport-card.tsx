"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SportCardProps {
  sport: {
    id: string
    name: string
  }
  isSelected: boolean
  onToggle: () => void
  category: {
    color: string
    activeColor: string
    borderColor: string
    activeBorderColor: string
    textColor: string
  }
}

export function SportCard({ sport, isSelected, onToggle, category }: SportCardProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-300 h-24 overflow-hidden backdrop-blur-sm",
        isSelected ? category.activeColor : category.color,
        isSelected ? category.activeBorderColor : category.borderColor,
        "hover:border-opacity-80 group",
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
          <Check className={`h-3 w-3 ${category.textColor}`} />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20 group-hover:opacity-10 transition-opacity"></div>

      <SportIcon sportId={sport.id} category={category} isSelected={isSelected} />

      <span
        className={cn(
          "mt-2 text-sm font-medium transition-colors duration-300",
          isSelected ? "text-white" : "text-gray-400",
        )}
      >
        {sport.name}
      </span>
    </button>
  )
}

function SportIcon({
  sportId,
  isSelected
}: {
  sportId: string
  category: { textColor: string }
  isSelected: boolean
}) {
  // Iconos específicos para cada deporte
  const getIconForSport = () => {
    switch (sportId) {
      // Fuerza
      case "musculacion":
        return "💪"
      case "crossfit":
        return "⚡"
      case "calistenia":
        return "🤸"
      case "powerlifting":
        return "🏋️‍♂️"
      case "halterofilia":
        return "🏋️‍♀️"

      // Duración
      case "yoga":
        return "🧘‍♀️"
      case "meditacion":
        return "🧠"
      case "estiramientos":
        return "🤾"
      case "pilates":
        return "🧘"
      case "taichi":
        return "🥋"

      // Distancia + Tiempo
      case "running":
        return "🏃‍♂️"
      case "ciclismo":
        return "🚴‍♀️"
      case "natacion":
        return "🏊‍♂️"
      case "remo":
        return "🚣‍♀️"
      case "caminata":
        return "🚶‍♂️"

      default:
        return "🏅"
    }
  }

  return (
    <div
      className={`text-2xl flex items-center justify-center h-8 transition-transform duration-300 ${isSelected ? "scale-110" : ""}`}
    >
      {getIconForSport()}
    </div>
  )
}
