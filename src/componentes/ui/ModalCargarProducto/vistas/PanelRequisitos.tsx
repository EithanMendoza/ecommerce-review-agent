import { HelpCircle, Compass } from 'lucide-react';

export const PanelRequisitos = () => (
  <div className="md:w-80 bg-[#161616] p-5 sm:p-8 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col justify-between md:overflow-y-auto shrink-0">
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2 text-neutral-400">
        <HelpCircle size={18} className="text-indigo-400" />
        <span className="text-xs uppercase tracking-wider font-bold">Requisito Necesario</span>
      </div>
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
          <Compass size={16} />
          <span>Enlace Obligatorio</span>
        </div>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Para activar el análisis, <span className="text-white font-medium">es estrictamente necesario</span> proporcionar el enlace del producto.
        </p>
      </div>
    </div>
    <div className="hidden md:block text-xs text-neutral-500 font-medium mt-4">
      Conexión segura y cifrada
    </div>
  </div>
);