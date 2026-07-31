import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 select-none">
      <div className="max-w-md w-full bg-[#181818] rounded-2xl shadow-2xl border border-neutral-900 p-8 space-y-6 text-center">
        
        {/* Icono Decorativo */}
        <div className="flex justify-center mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <AlertTriangle size={32} />
          </div>
        </div>

        {/* Textos */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-neutral-200 tracking-tight">404</h1>
          <h2 className="text-xl font-semibold text-neutral-300">Página no encontrada</h2>
          <p className="text-sm text-neutral-500 leading-relaxed px-2">
            Lo sentimos, la ruta que intentas visitar no existe, ha sido movida o no tienes acceso. Verifica que la URL sea correcta.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="pt-4 space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-[#202020] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-neutral-200 text-sm font-semibold py-2.5 rounded-lg transition-all outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <ArrowLeft size={18} />
            <span>Volver atrás</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-indigo-950/40"
          >
            <Home size={18} />
            <span>Ir al Panel Principal</span>
          </button>
        </div>

      </div>
    </div>
  );
}