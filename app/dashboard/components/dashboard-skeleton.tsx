import { ChevronRight, Dumbbell, Clock, Route, Plus, Filter, Search } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Skeleton } from "@/app/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <div className="fixed inset-0 min-h-screen bg-[#050505] text-white overflow-auto">
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

          <div className="flex items-center gap-2">
            <Button disabled className="bg-gradient-to-r from-[#4D9FFF]/70 to-[#4DFF9F]/70 text-black/70 opacity-70">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
          </div>
        </div>

        {/* Resumen simple - Skeletons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
              <CardContent className="p-4">
                <Skeleton className="h-3 w-16 bg-gray-700 mb-2" />
                <Skeleton className="h-8 w-12 bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar actividades..."
              className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              disabled
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="bg-gray-700 hover:bg-gray-600 opacity-70">
              Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 opacity-70"
            >
              Fuerza
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 opacity-70"
            >
              Duración
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 opacity-70"
            >
              Distancia
            </Button>
          </div>
        </div>

        {/* Lista de actividades - Skeletons */}
        <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-lg font-medium flex items-center">
              <Filter className="h-5 w-5 mr-2 text-gray-400" />
              Actividades Registradas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-700 mr-3" />
                    <div>
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-32 bg-gray-700 mb-2" />
                        <Skeleton className="h-4 w-16 bg-gray-700 ml-2 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-48 bg-gray-700" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-24 bg-gray-700 mb-2 ml-auto" />
                    <Skeleton className="h-4 w-16 bg-gray-700 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones rápidas - Skeletons */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Registrar Nueva Actividad</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <Dumbbell className="h-5 w-5 mr-2 opacity-50" />, label: "Fuerza" },
              { icon: <Clock className="h-5 w-5 mr-2 opacity-50" />, label: "Duración" },
              { icon: <Route className="h-5 w-5 mr-2 opacity-50" />, label: "Distancia" },
            ].map((item, i) => (
              <Button
                key={i}
                disabled
                className="h-auto py-4 flex items-center justify-center gap-2 bg-gray-800/50 border border-gray-700 opacity-70"
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
