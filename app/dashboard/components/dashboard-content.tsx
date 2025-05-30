"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ChevronRight, Dumbbell, Clock, Route, Plus, Filter, Search } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { useRouter } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { SessionWithActivities } from "../actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LoadingState } from "@/app/dashboard/registrar-actividades/Components/loading-state"

type Activity = {
  id: string
  tipo: "Fuerza" | "Duración" | "Distancia + Tiempo"
  nombre: string
  fecha: Date
  detalles: string
  icono: React.ReactElement
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

function mapSessionToActivities(sessions: SessionWithActivities[]): Activity[] {
  return sessions.flatMap(session => 
    session.activities.map(activity => {
      let tipo: "Fuerza" | "Duración" | "Distancia + Tiempo"
      let detalles: string
      let icono: React.ReactElement

      switch (activity.mode) {
        case 'Fuerza':
          tipo = "Fuerza"
          detalles = `${activity.data.series} series - ${activity.data.repetitions} repeticiones - ${activity.data.weight} kg`
          icono = <Dumbbell className="h-4 w-4" />
          break
        case 'Duración':
          tipo = "Duración"
          detalles = formatTime(activity.data.duration!)
          icono = <Clock className="h-4 w-4" />
          break
        case 'Distancia + Tiempo':
          tipo = "Distancia + Tiempo"
          const timeFormatted = formatTime(activity.data.time!)
          detalles = `${activity.data.distance} km - ${timeFormatted} - ${activity.data.ritmo} km/min`
          icono = <Route className="h-4 w-4" />
          break
        default:
          tipo = "Duración"
          detalles = "Sin detalles"
          icono = <Clock className="h-4 w-4" />
      }

      return {
        id: activity.id,
        tipo,
        nombre: activity.name,
        fecha: session.date,
        detalles,
        icono
      }
    })
  )
}

export function DashboardContent({ initialSessions }: { initialSessions: SessionWithActivities[] }) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const actividades = mapSessionToActivities(initialSessions)

  // Refrescar datos cuando el usuario regrese de registrar actividades
  useEffect(() => {
    const handleFocus = () => {
      // Refrescar datos del servidor cuando la ventana recupere el foco
      router.refresh()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [router])

  const handleNuevaActividad = () => {
    setIsLoading(true)
    router.push('/dashboard/registrar-actividades')
  }

  // Filtrar actividades según el tipo seleccionado y la búsqueda
  const actividadesFiltradas = actividades.filter((actividad) => {
    const coincideTipo = filtro === "todos" || actividad.tipo === filtro
    const coincideBusqueda =
      actividad.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      actividad.detalles.toLowerCase().includes(busqueda.toLowerCase())

    return coincideTipo && coincideBusqueda
  })

  // Obtener conteo de actividades por tipo
  const conteoActividades = {
    total: actividades.length,
    fuerza: actividades.filter((a) => a.tipo === "Fuerza").length,
    duracion: actividades.filter((a) => a.tipo === "Duración").length,
    distancia: actividades.filter((a) => a.tipo === "Distancia + Tiempo").length,
  }

  return (
    <div className="fixed inset-0 min-h-screen bg-[#050505] text-white overflow-auto">
      {isLoading && (
        <div className="fixed inset-0 bg-[#050505]/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingState />
            <p className="mt-4 text-gray-400">Cargando...</p>
          </div>
        </div>
      )}
      {/* Gradient background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0A0A0A] to-transparent opacity-50 pointer-events-none z-0"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Mis Actividades
              </span>
            </h1>
            <div className="flex items-center text-gray-400 mt-2">
              <span>Inicio</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-white">Actividades</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90"
              onClick={handleNuevaActividad}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
            
            {/* User Button para gestión de cuenta */}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "bg-gray-900 border-gray-700",
                  userButtonPopoverActionButton: "text-white hover:bg-gray-800",
                  userButtonPopoverActionButtonText: "text-white",
                  userButtonPopoverFooter: "bg-gray-900 border-gray-700"
                }
              }}
            />
          </div>
        </div>

        {/* Resumen simple */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">Total</p>
              <p className="text-2xl font-bold">{conteoActividades.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">Fuerza</p>
              <p className="text-2xl font-bold">{conteoActividades.fuerza}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">Duración</p>
              <p className="text-2xl font-bold">{conteoActividades.duracion}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">Distancia</p>
              <p className="text-2xl font-bold">{conteoActividades.distancia}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar actividades..."
              className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filtro === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("todos")}
              className={
                filtro === "todos"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-800/50 border-gray-700 hover:bg-gray-700"
              }
            >
              Todos
            </Button>
            <Button
              variant={filtro === "Fuerza" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("Fuerza")}
              className={
                filtro === "Fuerza"
                  ? "bg-[#4D9FFF] hover:bg-[#4D9FFF]/90 text-black"
                  : "bg-gray-800/50 border-gray-700 hover:bg-gray-700"
              }
            >
              Fuerza
            </Button>
            <Button
              variant={filtro === "Duración" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("Duración")}
              className={
                filtro === "Duración"
                  ? "bg-[#4DFF9F] hover:bg-[#4DFF9F]/90 text-black"
                  : "bg-gray-800/50 border-gray-700 hover:bg-gray-700"
              }
            >
              Duración
            </Button>
            <Button
              variant={filtro === "Distancia + Tiempo" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("Distancia + Tiempo")}
              className={
                filtro === "Distancia + Tiempo"
                  ? "bg-purple-500 hover:bg-purple-500/90 text-white"
                  : "bg-gray-800/50 border-gray-700 hover:bg-gray-700"
              }
            >
              Distancia
            </Button>
          </div>
        </div>

        {/* Lista de actividades */}
        <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-lg font-medium flex items-center">
              <Filter className="h-5 w-5 mr-2 text-gray-400" />
              Actividades Registradas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {actividadesFiltradas.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {actividadesFiltradas.map((actividad) => (
                  <div
                    key={actividad.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                          actividad.tipo === "Fuerza"
                            ? "bg-[#4D9FFF]/20 text-[#4D9FFF]"
                            : actividad.tipo === "Duración"
                              ? "bg-[#4DFF9F]/20 text-[#4DFF9F]"
                              : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {actividad.icono}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{actividad.nombre}</p>
                          <Badge
                            className={`ml-2 ${
                              actividad.tipo === "Fuerza"
                                ? "bg-[#4D9FFF]/20 text-[#4D9FFF] hover:bg-[#4D9FFF]/30"
                                : actividad.tipo === "Duración"
                                  ? "bg-[#4DFF9F]/20 text-[#4DFF9F] hover:bg-[#4DFF9F]/30"
                                  : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                            }`}
                          >
                            {actividad.tipo === "Fuerza"
                              ? "Fuerza"
                              : actividad.tipo === "Duración"
                                ? "Duración"
                                : "Distancia"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{actividad.detalles}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {format(actividad.fecha, "d MMM, yyyy", { locale: es })}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-gray-400 hover:text-white hover:bg-transparent"
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p>No se encontraron actividades que coincidan con los filtros.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 