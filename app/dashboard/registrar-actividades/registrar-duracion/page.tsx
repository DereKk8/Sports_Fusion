"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Save, RotateCcw, Clock, Check } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent } from "@/app/components/ui/card"
import { persistDurationActivity } from "../actions"
import { useRouter } from "next/navigation"
import { LoadingState } from "@/app/dashboard/registrar-actividades/Components/loading-state"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function RegistroDuracionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get activity details from URL params
  const activityId = searchParams.get('activityId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const activityName = searchParams.get('name') || 'Actividad';
  
  const [horas, setHoras] = useState<number | string>("")
  const [minutos, setMinutos] = useState<number | string>("")
  const [segundos, setSegundos] = useState<number | string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessState, setShowSuccessState] = useState(false);
  
  // Verify required parameters
  useEffect(() => {
    if (!activityId || !sessionId) {
      router.replace('/dashboard/registrar-actividades');
    }
  }, [activityId, sessionId, router]);

  // Función para convertir horas, minutos y segundos a segundos totales
  const convertToSeconds = (h: number | string, m: number | string, s: number | string): number => {
    const hours = h === "" ? 0 : parseInt(h.toString())
    const minutes = m === "" ? 0 : parseInt(m.toString())
    const seconds = s === "" ? 0 : parseInt(s.toString())
    
    return (hours * 3600) + (minutes * 60) + seconds
  }

  // Función para manejar cambios en los campos de entrada
  const handleHorasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || (Number.parseInt(value) >= 0 && !isNaN(Number.parseInt(value)))) {
      setHoras(value)
    }
  }

  const handleMinutosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (
      value === "" ||
      (Number.parseInt(value) >= 0 && Number.parseInt(value) <= 59 && !isNaN(Number.parseInt(value)))
    ) {
      setMinutos(value)
    }
  }

  const handleSegundosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (
      value === "" ||
      (Number.parseInt(value) >= 0 && Number.parseInt(value) <= 59 && !isNaN(Number.parseInt(value)))
    ) {
      setSegundos(value)
    }
  }

  // Función para añadir tiempo
  const addTime = (horasToAdd = 0, minutosToAdd = 0, segundosToAdd = 0) => {
    // Convertir valores actuales a números, tratando strings vacíos como 0
    const currentHoras = horas === "" ? 0 : Number.parseInt(horas.toString())
    const currentMinutos = minutos === "" ? 0 : Number.parseInt(minutos.toString())
    const currentSegundos = segundos === "" ? 0 : Number.parseInt(segundos.toString())

    // Calcular nuevos valores
    let newSegundos = currentSegundos + segundosToAdd
    let newMinutos = currentMinutos + minutosToAdd
    let newHoras = currentHoras + horasToAdd

    // Ajustar si los segundos superan 59
    if (newSegundos > 59) {
      newMinutos += Math.floor(newSegundos / 60)
      newSegundos = newSegundos % 60
    }

    // Ajustar si los minutos superan 59
    if (newMinutos > 59) {
      newHoras += Math.floor(newMinutos / 60)
      newMinutos = newMinutos % 60
    }

    // Actualizar el estado
    setHoras(newHoras)
    setMinutos(newMinutos)
    setSegundos(newSegundos)
  }

  // Funciones para los botones de incremento rápido
  const add5Minutes = () => addTime(0, 5)
  const add10Minutes = () => addTime(0, 10)
  const add30Minutes = () => addTime(0, 30)
  const add1Hour = () => addTime(1)

  // Función para reiniciar el formulario
  const handleReset = () => {
    setHoras("")
    setMinutos("")
    setSegundos("")
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    setError("")
    setIsLoading(true)
    
    try {
      // Convertir tiempo a segundos
      const totalSeconds = convertToSeconds(horas, minutos, segundos)
      
      if (totalSeconds === 0) {
        setError("Por favor ingresa un tiempo válido")
        setIsLoading(false)
        return
      }

      const result = await persistDurationActivity({
        id: '',
        activityId: activityId,
        duration: totalSeconds
      })

      if (result.success) {
        setSuccess(true)
        setShowSuccessState(true)
        
        // Store the activity data in local storage for summary
        const existingData = localStorage.getItem('registeredActivities') || '{}';
        const parsedData = JSON.parse(existingData);
        
        parsedData[activityId] = {
          type: 'duration',
          name: activityName,
          duration: totalSeconds
        };
        
        localStorage.setItem('registeredActivities', JSON.stringify(parsedData));
        
        // Auto-navigate back to the flow after success
        setTimeout(() => {
          router.push(`/dashboard/registrar-actividades/flujo-registro`);
        }, 1500);
      } else {
        setError("Error al guardar el registro: " + result.error)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Error al guardar el registro")
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 min-h-screen bg-[#050505] text-white overflow-auto">
      {isLoading && (
        <div className="fixed inset-0 bg-[#050505]/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingState />
            <p className="mt-4 text-gray-400">Guardando registro...</p>
          </div>
        </div>
      )}

      {showSuccessState && (
        <div className="fixed inset-0 bg-[#050505]/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-2">¡Registro guardado!</h3>
            <p className="text-gray-400">Redirigiendo al flujo de registro...</p>
          </div>
        </div>
      )}

      {/* Gradient background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0A0A0A] to-transparent opacity-50 pointer-events-none z-0"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Button 
              onClick={() => router.push('/dashboard/registrar-actividades/flujo-registro')}
              variant="outline" className="text-black border-gray-700 hover:bg-gray-800">
                Volver
              </Button>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Registro de {activityName}
              </span>
            </h1>
            <div className="flex items-center text-gray-400 mt-2">
              <span>Inicio</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span>Selección de Deportes</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-gray-400">Flujo de Registro</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-white">{activityName}</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Form card */}
          <Card className="col-span-1 md:col-span-2 bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                <h2 className="text-xl font-semibold text-white">Nuevo Registro: {activityName}</h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Tiempo input - destacado */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-[#4D9FFF]" />
                      <Label htmlFor="tiempo" className="text-white text-lg font-medium">
                        TIEMPO
                      </Label>
                    </div>

                    {/* Campo de tiempo destacado */}
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#4D9FFF]/30 to-[#4DFF9F]/30 rounded-lg blur-sm"></div>
                      <div className="relative bg-gray-800/80 rounded-lg p-6 border border-[#4D9FFF]/50">
                        <div className="flex flex-col items-center">
                          {/* Selector de tiempo grande */}
                          <div className="flex items-center justify-center gap-2 w-full">
                            <div className="flex-1 max-w-[100px]">
                              <Label htmlFor="horas" className="text-gray-400 text-sm block text-center mb-1">
                                Horas
                              </Label>
                              <Input
                                id="horas"
                                type="number"
                                min="0"
                                placeholder="00"
                                value={horas}
                                onChange={handleHorasChange}
                                className="bg-gray-900/80 border-gray-700 text-white text-center text-2xl h-16 placeholder:text-gray-600 focus:border-[#4D9FFF] focus:ring-[#4D9FFF]"
                              />
                            </div>
                            <span className="text-3xl font-light text-gray-400">:</span>
                            <div className="flex-1 max-w-[100px]">
                              <Label htmlFor="minutos" className="text-gray-400 text-sm block text-center mb-1">
                                Minutos
                              </Label>
                              <Input
                                id="minutos"
                                type="number"
                                min="0"
                                max="59"
                                placeholder="00"
                                value={minutos}
                                onChange={handleMinutosChange}
                                className="bg-gray-900/80 border-gray-700 text-white text-center text-2xl h-16 placeholder:text-gray-600 focus:border-[#4D9FFF] focus:ring-[#4D9FFF]"
                              />
                            </div>
                            <span className="text-3xl font-light text-gray-400">:</span>
                            <div className="flex-1 max-w-[100px]">
                              <Label htmlFor="segundos" className="text-gray-400 text-sm block text-center mb-1">
                                Segundos
                              </Label>
                              <Input
                                id="segundos"
                                type="number"
                                min="0"
                                max="59"
                                placeholder="00"
                                value={segundos}
                                onChange={handleSegundosChange}
                                className="bg-gray-900/80 border-gray-700 text-white text-center text-2xl h-16 placeholder:text-gray-600 focus:border-[#4D9FFF] focus:ring-[#4D9FFF]"
                              />
                            </div>
                          </div>

                          {/* Botones rápidos */}
                          <div className="flex flex-wrap gap-2 mt-4 justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={add5Minutes}
                              className="bg-gray-900/50 text-white border-gray-700 hover:bg-gray-800 text-xs"
                            >
                              +5 min
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={add10Minutes}
                              className="bg-gray-900/50 text-white border-gray-700 hover:bg-gray-800 text-xs"
                            >
                              +10 min
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={add30Minutes}
                              className="bg-gray-900/50 text-white border-gray-700 hover:bg-gray-800 text-xs"
                            >
                              +30 min
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={add1Hour}
                              className="bg-gray-900/50 text-white border-gray-700 hover:bg-gray-800 text-xs"
                            >
                              +1 hora
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90 active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span>Guardando...</span>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Registro
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleReset}
                      variant="outline"
                      className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white border-none"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reiniciar
                    </Button>
                  </div>
                  {error && <div className="text-red-400 pt-2">{error}</div>}
                  {success && <div className="text-green-400 pt-2">Registro guardado correctamente.</div>}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info card */}
          <Card className="col-span-1 bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">Información</h3>

              <div className="space-y-4 text-gray-400 text-sm">
                <p>Registra el tiempo de duración de tu actividad física para hacer seguimiento de tu progreso.</p>

                <div className="pt-2 border-t border-gray-800">
                  <h4 className="text-white text-base mb-2">Consejos:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Registra el tiempo exacto de tu actividad</li>
                    <li>Usa los botones rápidos para añadir tiempo</li>
                    <li>Puedes registrar desde segundos hasta horas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function RegistroDuracion() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RegistroDuracionContent />
    </Suspense>
  )
}
