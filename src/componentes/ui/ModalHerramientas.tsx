import { X, CheckCircle } from 'lucide-react';
import type { DatosModal } from '../../hooks/usarHerramientas';

interface Props {
  datos: DatosModal;
  alCerrar: () => void;
}

export default function ModalHerramientas({ datos, alCerrar }: Props) {
  // Función para renderizar el contenido dependiendo si es texto o un objeto (JSON)
  const renderizarContenido = () => {
    // Si tiene la propiedad 'mensaje', la mostramos como texto simple
    if (datos.contenido.mensaje) {
      return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
          {datos.contenido.mensaje}
        </div>
      );
    }

    // Si es un objeto (como las métricas), lo desglosamos en tarjetas
    return (
      <div className="space-y-3">
        {Object.entries(datos.contenido).map(([clave, valor], indice) => (
          <div key={indice} className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
            <span className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
              {clave.replace(/_/g, ' ')}
            </span>
            <span className="text-sm text-slate-700 whitespace-pre-wrap">
              {String(valor)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-emerald-500" size={20} />
            <h3 className="text-lg font-bold text-slate-800">{datos.titulo}</h3>
          </div>
          <button 
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderizarContenido()}
        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={alCerrar}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}