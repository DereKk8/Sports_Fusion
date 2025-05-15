"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Check, Save, X } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { LoadingState } from "../Components/loading-state"
import { deleteSession } from "../actions"

type SelectedActivity = {
  id: string      // Database-generated activity ID from 'actividades' table
  sportId: string // Original sport ID from selection
  name: string
  category: {
    id: string
    title: string
  }
}

export default function RegistrationFlow() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string>("")
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([])
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [error, setError] = useState("")

  // Group activities by category
  const strengthActivities = selectedActivities.filter(activity => activity.category.id === "strength")
  const durationActivities = selectedActivities.filter(activity => activity.category.id === "duration")
  const distanceActivities = selectedActivities.filter(activity => activity.category.id === "distance")

  // All activities in sequence for registration
  const allActivitiesInOrder = useMemo(() => 
    [...strengthActivities, ...durationActivities, ...distanceActivities], 
    [strengthActivities, durationActivities, distanceActivities]
  )

  // Check if an activity has been completed
  const isActivityCompleted = (activityId: string) => {
    if (typeof window === "undefined") return false
    
    const registeredActivities = localStorage.getItem('registeredActivities') || '{}'
    const parsedActivities = JSON.parse(registeredActivities)
    
    return parsedActivities[activityId] !== undefined
  }

  // Finish the registration process
  const finishRegistration = useCallback(() => {
    try {
      // Clear all stored data
      sessionStorage.removeItem("currentSessionId")
      sessionStorage.removeItem("selectedActivities")
      localStorage.removeItem("registeredActivities")
      
      // Navigate to summary or dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Error finishing registration:", err)
    }
  }, [router])

  // Check if there are any completed activities and update index
  useEffect(() => {
    if (allActivitiesInOrder.length === 0 || isLoading) return
    
    // Check if the current activity is already completed
    if (isActivityCompleted(allActivitiesInOrder[currentActivityIndex].id)) {
      // Move to the next uncompleted activity
      for (let i = currentActivityIndex + 1; i < allActivitiesInOrder.length; i++) {
        if (!isActivityCompleted(allActivitiesInOrder[i].id)) {
          setCurrentActivityIndex(i)
          return
        }
      }
      
      // If we got here, all activities are completed
      if (allActivitiesInOrder.every(activity => isActivityCompleted(activity.id))) {
        finishRegistration()
      }
    }
  }, [currentActivityIndex, allActivitiesInOrder, isLoading, finishRegistration])

  useEffect(() => {
    // Get session data from session storage
    try {
      if (typeof window !== "undefined") {
        const storedSessionId = sessionStorage.getItem("currentSessionId")
        const storedActivities = sessionStorage.getItem("selectedActivities")
        
        if (!storedSessionId || !storedActivities) {
          router.replace("/dashboard/registrar-actividades")
          return
        }
        
        setSessionId(storedSessionId)
        setSelectedActivities(JSON.parse(storedActivities))
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error loading session data:", err)
      setError("Error al cargar los datos de la sesión. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }, [router])

  // Navigate to the appropriate registration page based on the current activity
  const navigateToActivityRegistration = () => {
    const currentActivity = allActivitiesInOrder[currentActivityIndex]
    
    if (!currentActivity) {
      // All activities registered, go to summary
      finishRegistration()
      return
    }

    // Mark navigation type based on activity category
    switch (currentActivity.category.id) {
      case "strength":
        router.push(`/dashboard/registrar-actividades/registrar-fuerza?activityId=${currentActivity.id}&sessionId=${sessionId}&name=${encodeURIComponent(currentActivity.name)}`)
        break
      case "duration":
        router.push(`/dashboard/registrar-actividades/registrar-duracion?activityId=${currentActivity.id}&sessionId=${sessionId}&name=${encodeURIComponent(currentActivity.name)}`)
        break
      case "distance":
        router.push(`/dashboard/registrar-actividades/registrar-duracion-distancia?activityId=${currentActivity.id}&sessionId=${sessionId}&name=${encodeURIComponent(currentActivity.name)}`)
        break
      default:
        setError("Tipo de actividad no reconocido")
    }
  }

  // Cancel registration flow
  const cancelRegistration = async () => {
    try {
      setIsLoading(true)
      // Call the API to delete the session and all its data
      const result = await deleteSession(sessionId)
      
      if (!result.success) {
        setError("Error al cancelar el registro: " + result.error)
        setIsLoading(false)
        return
      }
      
      // Clear session storage and redirect
      sessionStorage.removeItem("currentSessionId")
      sessionStorage.removeItem("selectedActivities")
      router.push("/dashboard/registrar-actividades")
    } catch (err) {
      console.error("Error canceling registration:", err)
      setError("Error al cancelar el registro")
      setIsLoading(false)
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <LoadingState />
      </div>
    )
  }

  // Get current activity
  const currentActivity = allActivitiesInOrder[currentActivityIndex]

  return (
    <div className="fixed inset-0 min-h-screen bg-[#050505] text-white overflow-auto">
      {/* Gradient background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0A0A0A] to-transparent opacity-50 pointer-events-none z-0"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                className="text-white border-gray-700 hover:bg-gray-800"
                onClick={() => router.back()}
              >
                Volver
              </Button>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Registro de Actividades
              </span>
            </h1>
            <div className="flex items-center text-gray-400 mt-2">
              <span>Inicio</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span>Selección de Deportes</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-white">{currentActivity?.name || "Resumen"}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Registration flow card */}
          <Card className="col-span-1 md:col-span-2 bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {currentActivity 
                    ? `Registrar actividad: ${currentActivity.name}`
                    : "Registro completado"}
                </h2>
              </div>

              {currentActivity ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="text-5xl mb-4">
                    {getCategoryEmoji(currentActivity.category.id)}
                  </div>
                  <h3 className="text-2xl font-medium mb-2">{currentActivity.name}</h3>
                  <p className="text-gray-400 mb-8">
                    Categoría: {currentActivity.category.title}
                  </p>
                  
                  {isActivityCompleted(currentActivity.id) ? (
                    <div className="flex flex-col items-center">
                      <div className="mb-4 text-green-500">
                        <Check size={48} />
                      </div>
                      <p className="text-green-400 mb-6">Actividad ya registrada</p>
                      <Button
                        onClick={() => {
                          // Move to the next activity
                          if (currentActivityIndex < allActivitiesInOrder.length - 1) {
                            setCurrentActivityIndex(prev => prev + 1)
                          } else {
                            finishRegistration()
                          }
                        }}
                        className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90 active:scale-[0.98] px-8 py-6 text-lg"
                      >
                        Continuar con la siguiente actividad
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={navigateToActivityRegistration}
                        className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90 active:scale-[0.98] px-8 py-6 text-lg"
                      >
                        Registrar {currentActivity.name}
                      </Button>
                      
                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={() => {
                            // Skip this activity and move to the next one
                            if (currentActivityIndex < allActivitiesInOrder.length - 1) {
                              setCurrentActivityIndex(prev => prev + 1)
                            } else {
                              finishRegistration()
                            }
                          }}
                        >
                          Omitir esta actividad
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="text-5xl mb-4 text-green-500">
                    <Check size={64} />
                  </div>
                  <h3 className="text-2xl font-medium mb-2">¡Registro completado!</h3>
                  <p className="text-gray-400 mb-8">
                    Todos los deportes seleccionados han sido registrados.
                  </p>
                  
                  <Button
                    onClick={finishRegistration}
                    className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90 active:scale-[0.98] px-8 py-6 text-lg"
                  >
                    <Save className="mr-2" /> Finalizar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress card */}
          <Card className="col-span-1 bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">Progreso de Registro</h3>

              <div className="space-y-4">
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] h-full rounded-full"
                    style={{ 
                      width: `${allActivitiesInOrder.length > 0 
                        ? (currentActivityIndex / allActivitiesInOrder.length) * 100 
                        : 100}%` 
                    }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-400">
                  Actividad {currentActivityIndex + 1} de {allActivitiesInOrder.length}
                </p>

                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-medium text-white">Actividades:</h4>
                  <ul className="space-y-2">
                    {allActivitiesInOrder.map((activity, index) => {
                      const completed = isActivityCompleted(activity.id)
                      
                      return (
                        <li 
                          key={activity.id} 
                          className={`flex items-center text-sm ${
                            index === currentActivityIndex 
                              ? "text-white font-medium" 
                              : completed
                                ? "text-green-500"
                                : "text-gray-500"
                          }`}
                        >
                          {completed ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : index === currentActivityIndex ? (
                            <div className="h-2 w-2 rounded-full bg-white mr-3 ml-1"></div>
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-gray-600 mr-3 ml-1"></div>
                          )}
                          {activity.name}
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-gray-800">
                  <Button
                    variant="outline"
                    className="w-full bg-white text-red-400 border-gray-800 hover:bg-gray-100 hover:text-red-300"
                    onClick={cancelRegistration}
                  >
                    <X className="h-4 w-4 mr-2" /> Cancelar registro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper function to get emoji for category
function getCategoryEmoji(categoryId: string): string {
  switch (categoryId) {
    case "strength":
      return "🏋️‍♀️"
    case "duration":
      return "🧘"
    case "distance":
      return "🏃"
    default:
      return "🏅"
  }
} 