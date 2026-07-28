import { useState, useEffect } from 'react';
import { Network, Search, Database, Sparkles, Brain } from 'lucide-react';

const PASOS_CARGA = [
  { texto: "Subiendo datos a la nube...", icono: <Network className="text-indigo-400 animate-pulse" size={24} /> },
  { texto: "Analizando el enlace y obteniendo la ficha técnica...", icono: <Search className="text-indigo-400 animate-pulse" size={24} /> },
  { texto: "Extrayendo reseñas y clasificando...", icono: <Database className="text-amber-400 animate-bounce" size={24} /> },
  { texto: "Limpiando y estructurando la información recopilada...", icono: <Sparkles className="text-purple-400 animate-spin" style={{ animationDuration: '3s' }} size={24} /> },
  { texto: "Indexando vectores y actualizando la base de datos...", icono: <Brain className="text-emerald-400 animate-pulse" size={24} /> }
];

export const VistaCarga = () => {
  const [pasoActual, setPasoActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setPasoActual((prev) => (prev + 1) % PASOS_CARGA.length);
    }, 3500);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-center animate-fadeIn">
      <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
        <div className="absolute inset-0 border-4 border-neutral-800 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute bg-[#161616] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-neutral-800 flex items-center justify-center shadow-inner animate-fadeIn" key={pasoActual}>
          {PASOS_CARGA[pasoActual].icono}
        </div>
      </div>
      <div className="space-y-3 max-w-md">
        <h3 className="text-base sm:text-lg font-bold text-neutral-200 min-h-[56px] flex items-center justify-center px-2 sm:px-4 transition-all duration-300">
          {PASOS_CARGA[pasoActual].texto}
        </h3>
        <p className="text-xs text-neutral-500 tracking-widest uppercase font-mono animate-pulse">Sincronizando sistema...</p>
      </div>
    </div>
  );
};