"use client"

import { useState } from "react"
import { SportCategory } from "./sport-category"
import { ArrowRight, ChevronRight } from "lucide-react"
import { persistSelectedActivities } from "../actions"
import { LoadingState } from "./loading-state"
import { useRouter } from "next/navigation"

// Definición de los deportes por categoría
const sportsData = [
  {
    id: "strength",
    title: "Fuerza",
    emoji: "🏋️‍♀️",
    color: "bg-gradient-to-br from-[#111111] to-[#0D0D0D]",
    activeColor: "bg-gradient-to-br from-[#FF4D4D]/10 to-[#FF4D4D]/5",
    borderColor: "border-[#222222]",
    activeBorderColor: "border-[#FF4D4D]",
    textColor: "text-[#FF4D4D]",
    sports: [
      { id: "musculacion", name: "Musculación" },
      { id: "crossfit", name: "CrossFit" },
      { id: "calistenia", name: "Calistenia" },
      { id: "powerlifting", name: "Powerlifting" },
      { id: "halterofilia", name: "Halterofilia" },
    ],
  },
  {
    id: "duration",
    title: "Duración",
    emoji: "🧘",
    color: "bg-gradient-to-br from-[#111111] to-[#0D0D0D]",
    activeColor: "bg-gradient-to-br from-[#4D9FFF]/10 to-[#4D9FFF]/5",
    borderColor: "border-[#222222]",
    activeBorderColor: "border-[#4D9FFF]",
    textColor: "text-[#4D9FFF]",
    sports: [
      { id: "yoga", name: "Yoga" },
      { id: "meditacion", name: "Meditación" },
      { id: "estiramientos", name: "Estiramientos" },
      { id: "pilates", name: "Pilates" },
      { id: "taichi", name: "Tai chi" },
    ],
  },
  {
    id: "distance",
    title: "Distancia + Tiempo",
    emoji: "🏃",
    color: "bg-gradient-to-br from-[#111111] to-[#0D0D0D]",
    activeColor: "bg-gradient-to-br from-[#4DFF9F]/10 to-[#4DFF9F]/5",
    borderColor: "border-[#222222]",
    activeBorderColor: "border-[#4DFF9F]",
    textColor: "text-[#4DFF9F]",
    sports: [
      { id: "running", name: "Running" },
      { id: "ciclismo", name: "Ciclismo" },
      { id: "natacion", name: "Natación" },
      { id: "remo", name: "Remo" },
      { id: "caminata", name: "Caminata deportiva" },
    ],
  },
]

export function SportSelectionScreen() {
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) => (prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]))
  }

  const handleContinue = async () => {
    if (selectedSports.length === 0) return

    setIsLoading(true)
    setError("")
    
    try {
      // Ensure unique sport IDs only
      const uniqueSports = Array.from(new Set(selectedSports))
      
      // Map selected sports to the required format
      const selectedSportsData = uniqueSports.map(sportId => {
        const category = sportsData.find(cat => cat.sports.some(s => s.id === sportId))
        const sport = category?.sports.find(s => s.id === sportId)
        
        return {
          id: sportId,
          name: sport?.name || '',
          category: {
            id: category?.id || '',
            title: category?.title || ''
          }
        }
      })

      const result = await persistSelectedActivities(selectedSportsData)
      
      if (result.success) {
        // Store the sessionId and the full activities data with database IDs in session storage
        sessionStorage.setItem('currentSessionId', result.sessionId || '')
        sessionStorage.setItem('selectedActivities', JSON.stringify(result.activities || []))
        
        // Navigate to the first step of registration flow
        router.push("/dashboard/registrar-actividades/flujo-registro")
      } else {
        setError("Error al guardar las actividades: " + (result.error || "Inténtalo nuevamente"))
      }
    } catch (error) {
      console.error('Error:', error)
      setError("Ocurrió un error al guardar las actividades")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-8 py-12 bg-[#050505] min-h-screen text-white">
      {isLoading && <LoadingState />}
      
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0A0A0A] to-transparent opacity-50 pointer-events-none"></div>

      {/* Header con navegación */}
      <div className="flex justify-between items-center mb-12 relative z-10">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Registro de Entrenamiento
            </span>
          </h1>
          <div className="flex items-center text-gray-400 mt-2">
            <span>Inicio</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-white">Selección de Deportes</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 rounded-md border border-[#222222] text-gray-300 hover:bg-[#111111] transition-colors"
            onClick={() => router.push("/dashboard")}
          >
            Cancelar
          </button>
          <button
            disabled={selectedSports.length === 0 || isLoading}
            onClick={handleContinue}
            className={`px-6 py-2 rounded-md flex items-center justify-center gap-2 font-medium transition-all ${
              selectedSports.length > 0 && !isLoading
                ? "bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90 active:scale-[0.98]"
                : "bg-[#111111] text-gray-600 cursor-not-allowed"
            }`}
          >
            {isLoading ? 'Guardando...' : 'Continuar'}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex gap-8">
        {/* Panel lateral */}
        <div className="w-64 shrink-0">
          <div className="bg-[#0A0A0A] rounded-xl p-5 border border-[#222222]">
            <h2 className="text-lg font-medium mb-4">Progreso</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#4D9FFF] flex items-center justify-center text-xs">1</div>
                <span className="text-white">Selección de deportes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#111111] flex items-center justify-center text-xs text-gray-400">
                  2
                </div>
                <span className="text-gray-400">Detalles de la sesión</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#111111] flex items-center justify-center text-xs text-gray-400">
                  3
                </div>
                <span className="text-gray-400">Resumen y guardar</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#222222]">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Deportes seleccionados</h3>
              {selectedSports.length > 0 ? (
                <ul className="space-y-2">
                  {selectedSports.map((sportId) => {
                    const category = sportsData.find((cat) => cat.sports.some((sport) => sport.id === sportId))
                    const sport = category?.sports.find((s) => s.id === sportId)

                    return sport ? (
                      <li key={sportId} className="flex items-center gap-2 text-sm">
                        <span className={category?.textColor}>{getEmojiForSport(sportId)}</span>
                        <span>{sport.name}</span>
                      </li>
                    ) : null
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No hay deportes seleccionados</p>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#222222]">
            <h2 className="text-xl font-medium mb-6">Selecciona tus deportes</h2>
            <p className="text-gray-400 mb-8">Elige uno o más deportes para tu sesión de entrenamiento</p>

            <div className="space-y-8">
              {sportsData.map((category) => (
                <SportCategory
                  key={category.id}
                  category={category}
                  selectedSports={selectedSports}
                  onToggleSport={toggleSport}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Función auxiliar para obtener el emoji de un deporte
function getEmojiForSport(sportId: string): string {
  const emojis: Record<string, string> = {
    // Fuerza
    musculacion: "💪",
    crossfit: "⚡",
    calistenia: "🤸",
    powerlifting: "🏋️‍♂️",
    halterofilia: "🏋️‍♀️",

    // Duración
    yoga: "🧘‍♀️",
    meditacion: "🧠",
    estiramientos: "🤾",
    pilates: "🧘",
    taichi: "🥋",

    // Distancia + Tiempo
    running: "🏃‍♂️",
    ciclismo: "🚴‍♀️",
    natacion: "🏊‍♂️",
    remo: "🚣‍♀️",
    caminata: "🚶‍♂️",
  }

  return emojis[sportId] || "🏅"
}
