"use client"

import { Suspense } from "react"
import { ChevronRight, Save, RotateCcw, Dumbbell } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent } from "@/app/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { persistStrenghActivity } from "../actions"
import { LoadingState } from "@/app/dashboard/registrar-actividades/Components/loading-state"

function RegistroFuerzaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get activity details from URL params
  const activityId = searchParams.get('activityId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const activityName = searchParams.get('name') || 'Actividad';
  
  const [series, setSeries] = useState("");
  const [repeticiones, setRepeticiones] = useState("");
  const [peso, setPeso] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Verify required parameters
  useEffect(() => {
    if (!activityId || !sessionId) {
      router.replace('/dashboard/registrar-actividades');
    }
  }, [activityId, sessionId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    setIsLoading(true);

    if (!series || !repeticiones || !peso) {
      setError("Por favor completa todos los campos.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await persistStrenghActivity({
        id: '',
        activityId: activityId,
        series: parseInt(series),
        repetitions: parseInt(repeticiones),
        weight: parseFloat(peso)
      });

      if (result.success) {
        setSuccess(true);
        
        // Store the activity data in local storage for summary
        const existingData = localStorage.getItem('registeredActivities') || '{}';
        const parsedData = JSON.parse(existingData);
        
        parsedData[activityId] = {
          type: 'strength',
          name: activityName,
          series: parseInt(series),
          repetitions: parseInt(repeticiones),
          weight: parseFloat(peso)
        };
        
        localStorage.setItem('registeredActivities', JSON.stringify(parsedData));
        
        // Auto-navigate back to the flow after success
        setTimeout(() => {
          router.push(`/dashboard/registrar-actividades/flujo-registro`);
        }, 1500);
      } else {
        setError("Error al guardar el registro: " + result.error);
      }
    } catch (err) {
      setError("Error al guardar el registro");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSeries("");
    setRepeticiones("");
    setPeso("");
    setSuccess(false);
    setError("");
  };

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
              <Button
                onClick={() => router.push('/dashboard/registrar-actividades/flujo-registro')}
                variant="outline"
                className="text-black border-gray-700 hover:bg-gray-500"
              >
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
                <Dumbbell className="h-5 w-5 mr-2 text-gray-400" />
                <h2 className="text-xl font-semibold text-white">Nuevo Registro: {activityName}</h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Series input */}
                  <div className="space-y-2">
                    <Label htmlFor="series" className="text-gray-300">
                      Series
                    </Label>
                    <Input
                      id="series"
                      type="number"
                      placeholder="Número de series"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600"
                      value={series}
                      onChange={e => setSeries(e.target.value)}
                    />
                  </div>

                  {/* Repeticiones input */}
                  <div className="space-y-2">
                    <Label htmlFor="repeticiones" className="text-gray-300">
                      Repeticiones
                    </Label>
                    <Input
                      id="repeticiones"
                      type="number"
                      placeholder="Número de repeticiones"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600"
                      value={repeticiones}
                      onChange={e => setRepeticiones(e.target.value)}
                    />
                  </div>

                  {/* Peso input */}
                  <div className="space-y-2">
                    <Label htmlFor="peso" className="text-gray-300">
                      Peso (kg)
                    </Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.5"
                      placeholder="Peso en kilogramos"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600"
                      value={peso}
                      onChange={e => setPeso(e.target.value)}
                    />
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
                    <Button type="button" onClick={handleReset} variant="outline" className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white border-none">
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
                <p>Registra tus ejercicios de fuerza para hacer seguimiento de tu progreso.</p>

                <div className="pt-2 border-t border-gray-800">
                  <h4 className="text-white text-base mb-2">Consejos:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Registra cada ejercicio por separado</li>
                    <li>Anota el peso en kilogramos</li>
                    <li>Incluye todas las series realizadas</li>
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

export default function RegistroFuerza() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RegistroFuerzaContent />
    </Suspense>
  )
}
