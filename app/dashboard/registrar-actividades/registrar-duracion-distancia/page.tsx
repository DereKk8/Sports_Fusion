"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { ChevronRight, Save, RotateCcw, Clock, MapPin, Route } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent } from "@/app/components/ui/card"
import { persistDistanceActivity } from "../actions"
import { LoadingState } from "../Components/loading-state"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"

export default function RegistroDistanciaTiempo() {
  // Estado para los campos de tiempo
  const [horas, setHoras] = useState<number | string>("")
  const [minutos, setMinutos] = useState<number | string>("")
  const [segundos, setSegundos] = useState<number | string>("")

  // Estado para el campo de distancia
  const [distancia, setDistancia] = useState<number | string>("")

  // Estado para el ritmo calculado
  const [ritmo, setRitmo] = useState<string>("-- min/km")

  // Estado para el proceso de carga
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get activity details from URL params
  const activityId = searchParams.get('activityId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const activityName = searchParams.get('name') || 'Actividad';
  
  // Verify required parameters
  useEffect(() => {
    if (!activityId || !sessionId) {
      router.replace('/dashboard/registrar-actividades');
    }
  }, [activityId, sessionId, router]);

  // Función para manejar cambios en los campos de entrada de tiempo
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

  // Función para manejar cambios en el campo de distancia
  const handleDistanciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || (Number.parseFloat(value) >= 0 && !isNaN(Number.parseFloat(value)))) {
      setDistancia(value)
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

  // Función para añadir distancia
  const addDistancia = (kmToAdd: number) => {
    const currentDistancia = distancia === "" ? 0 : Number.parseFloat(distancia.toString())
    const newDistancia = currentDistancia + kmToAdd
    setDistancia(Number.parseFloat(newDistancia.toFixed(2))) // Redondear a 2 decimales
  }

  // Funciones para los botones de incremento rápido de tiempo
  const add5Minutes = () => addTime(0, 5)
  const add10Minutes = () => addTime(0, 10)
  const add30Minutes = () => addTime(0, 30)
  const add1Hour = () => addTime(1)

  // Funciones para los botones de incremento rápido de distancia
  const add1Km = () => addDistancia(1)
  const add2Km = () => addDistancia(2)
  const add5Km = () => addDistancia(5)
  const add10Km = () => addDistancia(10)

  // Función para reiniciar el formulario
  const handleReset = () => {
    setHoras("")
    setMinutos("")
    setSegundos("")
    setDistancia("")
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    setError("")
    
    // Convertir todos los valores a números
    const horasNum = horas === "" ? 0 : Number.parseInt(horas.toString())
    const minutosNum = minutos === "" ? 0 : Number.parseInt(minutos.toString())
    const segundosNum = segundos === "" ? 0 : Number.parseInt(segundos.toString())
    const distanciaNum = distancia === "" ? 0 : Number.parseFloat(distancia.toString())
    
    // Calcular el tiempo total en segundos
    const tiempoTotalSegundos = horasNum * 3600 + minutosNum * 60 + segundosNum
    
    // Validar que se hayan ingresado datos
    if (tiempoTotalSegundos === 0) {
      setError("Por favor ingresa un tiempo válido")
      return
    }
    
    if (distanciaNum <= 0) {
      setError("Por favor ingresa una distancia válida")
      return
    }
    
    try {
      setIsLoading(true)
      
      // Enviar los datos
      await persistDistanceActivity({
        id: '', // Se generará automáticamente
        activityId: activityId,
        distance: distanciaNum,
        time: tiempoTotalSegundos,
        ritmo: tiempoTotalSegundos / distanciaNum // Calculamos el ritmo en segundos por kilómetro
      })
      
      // Mostrar mensaje de éxito
      setSuccess(true)
      
      // Store the activity data in local storage for summary
      const existingData = localStorage.getItem('registeredActivities') || '{}';
      const parsedData = JSON.parse(existingData);
      
      parsedData[activityId] = {
        type: 'distance',
        name: activityName,
        distance: distanciaNum,
        time: tiempoTotalSegundos,
        ritmo: calcularRitmo()
      };
      
      localStorage.setItem('registeredActivities', JSON.stringify(parsedData));
      
      // Auto-navigate back to the flow after success
      setTimeout(() => {
        router.push(`/dashboard/registrar-actividades/flujo-registro`);
      }, 1500);
    } catch (error) {
      console.error("Error al guardar la actividad:", error)
      setError("Ocurrió un error al guardar la actividad. Por favor intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para calcular y formatear el ritmo (min/km)
  const calcularRitmo = useCallback(() => {
    // Convertir todos los valores a números
    const horasNum = horas === "" ? 0 : Number.parseInt(horas.toString())
    const minutosNum = minutos === "" ? 0 : Number.parseInt(minutos.toString())
    const segundosNum = segundos === "" ? 0 : Number.parseInt(segundos.toString())
    const distanciaNum = distancia === "" ? 0 : Number.parseFloat(distancia.toString())

    // Calcular el tiempo total en segundos
    const tiempoTotalSegundos = horasNum * 3600 + minutosNum * 60 + segundosNum

    // Si no hay tiempo o distancia, o si la distancia es 0, mostrar placeholder
    if (tiempoTotalSegundos === 0 || distanciaNum === 0) {
      return "-- min/km"
    }

    // Calcular ritmo en segundos por kilómetro
    const ritmoSegundos = tiempoTotalSegundos / distanciaNum

    // Convertir a minutos y segundos
    const ritmoMinutos = Math.floor(ritmoSegundos / 60)
    const ritmoSegundosRestantes = Math.floor(ritmoSegundos % 60)

    // Formatear el resultado
    return `${ritmoMinutos}:${ritmoSegundosRestantes.toString().padStart(2, "0")} min/km`
  }, [horas, minutos, segundos, distancia])

  // Efecto para actualizar el ritmo cuando cambian los valores
  useEffect(() => {
    setRitmo(calcularRitmo())
  }, [horas, minutos, segundos, distancia, calcularRitmo])

  // Determinar la clase de color para el ritmo basado en si hay valores
  const ritmoColorClass = ritmo === "-- min/km" ? "text-gray-500" : "text-white"

  return (
    <div className="fixed inset-0 min-h-screen bg-[#050505] text-white overflow-auto">
      {isLoading && <LoadingState />}
      {/* Gradient background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0A0A0A] to-transparent opacity-50 pointer-events-none z-0"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" className="text-black border-gray-700 hover:bg-gray-800" onClick={() => router.push('/dashboard/registrar-actividades/flujo-registro')}>
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
                <Route className="h-5 w-5 mr-2 text-gray-400" />
                <h2 className="text-xl font-semibold text-white">Nuevo Registro: {activityName}</h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
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

                  {/* Distancia input - destacado */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-[#4DFF9F]" />
                      <Label htmlFor="distancia" className="text-white text-lg font-medium">
                        DISTANCIA
                      </Label>
                    </div>

                    {/* Campo de distancia destacado */}
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#4DFF9F]/30 to-[#4D9FFF]/30 rounded-lg blur-sm"></div>
                      <div className="relative bg-gray-800/80 rounded-lg p-6 border border-[#4DFF9F]/50">
                        <div className="flex flex-col items-center">
                          {/* Selector de distancia grande */}
                          <div className="flex items-center justify-center gap-2 w-full">
                            <div className="flex-1 max-w-[200px]">
                              <Input
                                id="distancia"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={distancia}
                                onChange={handleDistanciaChange}
                                className="bg-gray-900/80 border-gray-700 text-white text-center text-3xl h-16 placeholder:text-gray-600 focus:border-[#4DFF9F] focus:ring-[#4DFF9F]"
                              />
                            </div>
                            <span className="text-2xl font-medium text-gray-400">km</span>
                          </div>

                          {/* Botones rápidos */}
                          <div className="flex flex-wrap gap-2 mt-4 justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={add1Km}
                              className="bg-gray-900/50 text-white border-gray-700 hover:bg-gray-800 text-xs"
                            >
                              +1 km
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={add2Km}
                              className="bg-gray-900/50 text-white border-gray-700 hover:bg-gray-800 text-xs"
                            >
                              +2 km
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={add5Km}
                              className="bg-gray-900/50 text-white border-gray-700 hover:bg-gray-800 text-xs"
                            >
                              +5 km
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={add10Km}
                              className="bg-gray-900/50 text-white border-gray-700 hover:bg-gray-800 text-xs"
                            >
                              +10 km
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
                        <LoadingState />
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
                <p>Registra el tiempo y la distancia de tu actividad física para hacer seguimiento de tu progreso.</p>

                <div className="pt-2 border-t border-gray-800">
                  <h4 className="text-white text-base mb-2">Consejos:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Registra el tiempo exacto de tu actividad</li>
                    <li>Mide la distancia recorrida en kilómetros</li>
                    <li>Usa los botones rápidos para añadir valores</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-gray-800">
                  <h4 className="text-white text-base mb-2">Ritmo:</h4>
                  <div className="p-3 bg-gray-800/30 rounded text-center">
                    <p className="text-xs text-gray-500 mb-1">Ritmo calculado</p>
                    <div className="flex items-center justify-center">
                      <p className={`text-xl font-medium ${ritmoColorClass} transition-colors duration-300`}>{ritmo}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
