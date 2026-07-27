import { X, CheckCircle, AlertCircle } from 'lucide-react';
import type { DatosModal } from '../../hooks/usarHerramientas';

// Vistas secundarias
import { DiagnosticoView } from './vistas/DiagnosticoView';
// import { MetricasView } from './vistas/MetricasView';

interface ModalHerramientasProps {
  datos: DatosModal;
  alCerrar: () => void;
}

export default function ModalHerramientas({ datos, alCerrar }: ModalHerramientasProps) {

  // 1. ESTA FUNCIÓN DECIDE QUÉ VISTA USAR
  const renderizarCuerpo = () => {
    // 🔍 DEPURACIÓN
    console.log("Tipo recibido:", datos.tipo);
    console.log("Contenido recibido:", datos.contenido);

    // 🚀 CONTROL CRÍTICO DE ERRORES (ej. si el backend avisa que no hay reseñas para exportar a Excel)
    if (datos.contenido?.error) {
      return (
        <div className="p-4 bg-red-950/40 border border-red-900/60 text-red-400 rounded-xl flex gap-2.5 items-start">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="text-xs font-sans leading-relaxed">
            <strong className="block font-semibold mb-0.5 text-neutral-200">Operación interrumpida</strong>
            {datos.contenido.error}
          </div>
        </div>
      );
    }

    // 🚀 Reactivado: vista especializada de diagnóstico (TTFT, latencia, velocidad)
    if (datos.tipo === 'diagnostico') {
      return <DiagnosticoView data={datos.contenido} />;
    }

    /* ========================================================================
       VISTA DE MÉTRICAS AÚN DESACTIVADA TEMPORALMENTE
       ========================================================================
    if (datos.tipo === 'metricas') {
      return <MetricasView data={datos.contenido} />;
    }
    ======================================================================== */

    // Si trae un mensaje explicativo simple en texto
    if (datos.contenido && datos.contenido.mensaje) {
      return (
        <div className="bg-[#181818] p-4 rounded-lg border border-neutral-800 text-sm text-neutral-300 whitespace-pre-wrap font-mono">
          {datos.contenido.mensaje}
        </div>
      );
    }

    // Vista genérica por defecto para objetos/propiedades
    const cuerpoObjeto = datos.contenido || {};
    return (
      <div className="space-y-3">
        {Object.entries(cuerpoObjeto).map(([clave, valor], indice) => (
          <div key={indice} className="bg-[#202020] p-3 rounded-lg border border-neutral-800">
            <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
              {clave.replace(/_/g, ' ')}
            </span>
            <span className="text-sm text-neutral-200 whitespace-pre-wrap">
              {String(valor)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const esError = !!datos.contenido?.error;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#1a1a1a]">
          <div className="flex items-center gap-2">
            {esError ? (
              <AlertCircle className="text-red-400" size={18} />
            ) : (
              <CheckCircle className="text-emerald-400" size={18} />
            )}
            <h3 className="text-sm font-bold text-neutral-200">{datos.titulo}</h3>
          </div>
          <button onClick={alCerrar} className="text-neutral-500 hover:text-neutral-300 p-1.5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 bg-[#141414] max-h-[60vh] overflow-y-auto">
          {renderizarCuerpo()}
        </div>

        {/* Pie */}
        <div className="px-6 py-4 bg-[#1a1a1a] border-t border-neutral-800 flex justify-end">
          <button
            onClick={alCerrar}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}