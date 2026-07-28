import { useState, useEffect } from 'react';
import { Network, Search, Database, Sparkles, Brain } from 'lucide-react';

// 🚀 Solo conservamos los iconos para la animación visual cíclica
const ICONOS_CARGA = [
  <Network className="text-indigo-400 animate-pulse" size={24} />,
  <Search className="text-indigo-400 animate-pulse" size={24} />,
  <Database className="text-amber-400 animate-bounce" size={24} />,
  <Sparkles className="text-purple-400 animate-spin" style={{ animationDuration: '3s' }} size={24} />,
  <Brain className="text-emerald-400 animate-pulse" size={24} />
];

// 🚀 Definimos la propiedad para recibir el estado real desde el Hook
interface PropsVistaCarga {
  mensajeEstado: string;
}

export const VistaCarga = ({ mensajeEstado }: PropsVistaCarga) => {
  const [indiceIcono, setIndiceIcono] = useState(0);

  // Rotamos únicamente el ícono central cada 2.5 segundos para dar sensación de actividad
  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceIcono((prev) => (prev + 1) % ICONOS_CARGA.length);
    }, 2500);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-center animate-fadeIn">
      <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
        <div className="absolute inset-0 border-4 border-neutral-800 border-t-indigo-500 rounded-full animate-spin"></div>

        {/* Contenedor del ícono rotativo */}
        <div
          className="absolute bg-[#161616] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-neutral-800 flex items-center justify-center shadow-inner animate-fadeIn"
          key={indiceIcono}
        >
          {ICONOS_CARGA[indiceIcono]}
        </div>
      </div>

      <div className="space-y-3 max-w-md">
        {/* 🚀 Renderizamos el texto dinámico y real que envía FastAPI */}
        <h3 className="text-base sm:text-lg font-bold text-neutral-200 min-h-[56px] flex items-center justify-center px-2 sm:px-4 transition-all duration-300">
          {mensajeEstado || "Procesando solicitud..."}
        </h3>
        <p className="text-xs text-neutral-500 tracking-widest uppercase font-mono animate-pulse">
          Operación en segundo plano
        </p>
      </div>
    </div>
  );
};