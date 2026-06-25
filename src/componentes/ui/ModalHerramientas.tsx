import { useEffect } from 'react';
import { X, CheckCircle, Download } from 'lucide-react';
import type { DatosModal } from '../../hooks/usarHerramientas';

interface Props {
  datos: DatosModal;
  alCerrar: () => void;
}

export default function ModalHerramientas({ datos, alCerrar }: Props) {

  // 🚀 INTERCEPTOR DE DESCARGAS AUTOMÁTICAS
  useEffect(() => {
    const esCsv = datos.titulo.toLowerCase().includes('csv');
    const esReporte = datos.titulo.toLowerCase().includes('reporte');

    // Si los datos contienen texto crudo para guardar en un archivo
    if ((esCsv || esReporte) && datos.contenido.mensaje) {
      try {
        console.log('💾 [Modal] Detectado archivo descargable. Generando Blob...');

        // Creamos el blob con el contenido plano del backend
        const contenidoPlano = datos.contenido.mensaje;
        const tipoMime = esCsv ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
        const extension = esCsv ? '.csv' : '.txt';

        const blob = new Blob([contenidoPlano], { type: tipoMime });
        const url = window.URL.createObjectURL(blob);

        // Creamos un link fantasma en el DOM para forzar la descarga en el navegador
        const link = document.createElement('a');
        link.href = url;

        // Sanitizamos el nombre del archivo basado en tu título
        const nombreArchivo = `${datos.titulo.toLowerCase().replace(/ /g, '_')}_${Date.now()}${extension}`;
        link.setAttribute('download', nombreArchivo);

        document.body.appendChild(link);
        link.click(); // 🚀 Dispara la descarga nativa en Chrome/Edge

        // Limpieza de memoria
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Como ya se descargó, cerramos el modal en caliente para no estorbar el flujo
        alCerrar();
      } catch (error) {
        console.error('Fallo al descargar archivo desde el modal:', error);
      }
    }
  }, [datos, alCerrar]);

  const renderizarContenido = () => {
    if (datos.contenido.mensaje) {
      return (
        <div className="bg-[#181818] p-4 rounded-lg border border-neutral-800 text-sm text-neutral-300 whitespace-pre-wrap font-mono">
          {datos.contenido.mensaje}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {Object.entries(datos.contenido).map(([clave, valor], indice) => (
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-emerald-400" size={18} />
            <h3 className="text-md font-bold text-neutral-200">{datos.titulo}</h3>
          </div>
          <button
            onClick={alCerrar}
            className="text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 p-1.5 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 max-h-[50vh] overflow-y-auto bg-[#141414]">
          {renderizarContenido()}
        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-4 bg-[#1a1a1a] border-t border-neutral-800 flex justify-end gap-2">
          {datos.titulo.toLowerCase().includes('csv') && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mr-auto">
              <Download size={14} className="animate-bounce" />
              <span>Descargado en el navegador</span>
            </div>
          )}
          <button
            onClick={alCerrar}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-950/40"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}