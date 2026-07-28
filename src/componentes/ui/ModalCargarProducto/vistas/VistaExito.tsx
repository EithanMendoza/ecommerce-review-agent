import { CheckCircle2 } from 'lucide-react';

interface Props {
  onContinuar: () => void;
}

export const VistaExito = ({ onContinuar }: Props) => (
  <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-5 text-center animate-fadeIn">
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg">
      <CheckCircle2 size={28} className="text-emerald-400 sm:hidden" />
      <CheckCircle2 size={32} className="text-emerald-400 hidden sm:block" />
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-white">¡Lectura Completada con Éxito!</h3>
    <p className="text-sm sm:text-base text-neutral-400 max-w-lg leading-relaxed">
      Hemos terminado de leer y procesar todas las opiniones del producto de manera exitosa.
    </p>
    <button
      onClick={onContinuar}
      className="mt-2 sm:mt-4 w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-lg shadow-emerald-600/20"
    >
      ¡Excelente, empezar!
    </button>
  </div>
);