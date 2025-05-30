import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Dumbbell, Clock, Route, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

export default async function Home() {
  // Verificar si el usuario está autenticado
  const { userId } = await auth();
  
  // Si está autenticado, redirigir al dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Gradient background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#0A0A0A] to-transparent opacity-50 pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-8 py-6">
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] rounded-lg flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold">Sports Fusion</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  Iniciar Sesión
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90">
                  Registrarse
                </Button>
              </SignUpButton>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-8 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Tu entrenamiento,
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F]">
                perfectamente registrado
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              La aplicación definitiva para registrar y seguir tus actividades deportivas. 
              Desde entrenamientos de fuerza hasta cardio, mantén todo organizado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignUpButton mode="modal">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90 px-8 py-6 text-lg"
                >
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
              
              <SignInButton mode="modal">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-white border-gray-700 hover:bg-gray-800 px-8 py-6 text-lg"
                >
                  Ver Demo
                </Button>
              </SignInButton>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Todo lo que necesitas para entrenar mejor
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Diseñado para atletas que quieren llevar su rendimiento al siguiente nivel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#4D9FFF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="h-8 w-8 text-[#4D9FFF]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Entrenamientos de Fuerza</h3>
                <p className="text-gray-400">
                  Registra series, repeticiones y peso. Mantén el control total de tu progreso.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#4DFF9F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-[#4DFF9F]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Actividades de Duración</h3>
                <p className="text-gray-400">
                  Yoga, meditación o cualquier actividad basada en tiempo. Simple y efectivo.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-gradient-to-b from-gray-900 to-[#050505] border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Route className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Distancia + Tiempo</h3>
                <p className="text-gray-400">
                  Running, ciclismo, natación. Registra distancia, tiempo y ritmo automáticamente.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  ¿Por qué elegir Sports Fusion?
                </span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#4D9FFF]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="h-4 w-4 text-[#4D9FFF]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Rápido y Eficiente</h3>
                    <p className="text-gray-400">
                      Registra tus entrenamientos en segundos. Interfaz diseñada para la velocidad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#4DFF9F]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="h-4 w-4 text-[#4DFF9F]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Seguro y Confiable</h3>
                    <p className="text-gray-400">
                      Tus datos están protegidos con la última tecnología de seguridad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Seguimiento de Progreso</h3>
                    <p className="text-gray-400">
                      Visualiza tu evolución y alcanza tus objetivos más rápido que nunca.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-b from-gray-900 to-[#050505] border border-gray-800 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Última sesión</span>
                    <span className="text-sm text-[#4DFF9F]">Completada</span>
                  </div>
                  <h3 className="text-xl font-semibold">Entrenamiento de Fuerza</h3>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#4D9FFF]">5</div>
                      <div className="text-xs text-gray-400">Series</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#4DFF9F]">12</div>
                      <div className="text-xs text-gray-400">Reps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">80</div>
                      <div className="text-xs text-gray-400">kg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                ¿Listo para transformar tu entrenamiento?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Únete a atletas que ya están mejorando su rendimiento con Sports Fusion
            </p>
            
            <SignUpButton mode="modal">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] text-black hover:opacity-90 px-12 py-6 text-xl"
              >
                Empezar Ahora - Es Gratis
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </SignUpButton>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-[#050505]">
          <div className="container mx-auto px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-gradient-to-r from-[#4D9FFF] to-[#4DFF9F] rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-black" />
                </div>
                <span className="font-semibold">Sports Fusion</span>
              </div>
              
              <p className="text-gray-400 text-sm">
                © 2024 Sports Fusion. Desarrollado para atletas ambiciosos.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
