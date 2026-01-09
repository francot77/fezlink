import NavBar from '@/components/navbar';
import DemoCarousel from '@/features/biopage-demo/DemoCarousel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo de Biopage - FezLink',
  description: 'Explora las posibilidades de tu próxima Biopage. Diseños modernos, rápidos y personalizables.',
};

export default function BiopageDemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      <NavBar />

      <div className="relative pt-24 pb-12 md:pt-32 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Nueva Experiencia Visual
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-cyan-200 bg-clip-text text-transparent">
            Tu Identidad Digital,<br /> 
            <span className="text-white">Elevada al Siguiente Nivel</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Explora nuestra galería de diseños interactivos. 
            Biopages optimizadas para velocidad, SEO y conversión.
          </p>
        </div>

        {/* Demo Carousel Section */}
        <section className="relative w-full mb-24">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 blur-3xl -z-10 rounded-full transform scale-75" />
          <DemoCarousel />
          
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Utiliza las flechas para navegar entre los diferentes estilos</p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Velocidad Extrema</h3>
            <p className="text-gray-400">
              Generación de HTML estático y optimización de imágenes para una carga instantánea en cualquier dispositivo.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Diseño Responsive</h3>
            <p className="text-gray-400">
              Adaptación perfecta a móviles, tablets y escritorio. Tu perfil luce increíble en todas partes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Personalización Total</h3>
            <p className="text-gray-400">
              Colores, gradientes, imágenes de fondo y estilos de botones. Tu marca, tus reglas.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 border-t border-white/10">
          <h2 className="text-3xl font-bold mb-6 text-white">¿Listo para crear la tuya?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/dashboard" 
              className="px-8 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:scale-105"
            >
              Comenzar Ahora
            </a>
            <a 
              href="/pricing" 
              className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/10"
            >
              Ver Planes
            </a>
          </div>
        </section>

        <footer className="text-center text-gray-600 text-sm py-8 border-t border-white/5">
          © {new Date().getFullYear()} FezLink. Todos los derechos reservados.
        </footer>
      </div>
    </main>
  );
}
