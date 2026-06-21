import { useState, useRef, useEffect } from 'react';
import { Wrench, Activity, FileText, Trash2, Download, BarChart2 } from 'lucide-react';
import { usarHerramientas } from '../../hooks/usarHerramientas';
import ModalHerramientas from '../ui/ModalHerramientas';

export default function MenuHerramientas() {
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Consumimos nuestro nuevo hook
  const { 
    cargandoTool, 
    datosModal, // 2. Extraer los datos del modal
    cerrarModal, // 3. Extraer la función para cerrarlo
    diagnostico, reportes, limpiarCache, exportarCsv, metricasResumen 
  } = usarHerramientas();

  // Cerramos el menú si el usuario hace clic afuera de él
  useEffect(() => {
    const manejarClicFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', manejarClicFuera);
    return () => document.removeEventListener('mousedown', manejarClicFuera);
  }, []);

  const itemsMenu = [
    { nombre: 'Diagnóstico', icono: Activity, accion: diagnostico },
    { nombre: 'Métricas Rápidas', icono: BarChart2, accion: metricasResumen },
    { nombre: 'Listar Reportes', icono: FileText, accion: reportes },
    { nombre: 'Exportar CSV', icono: Download, accion: exportarCsv },
    { nombre: 'Limpiar Caché Chroma', icono: Trash2, accion: limpiarCache, peligro: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setAbierto(!abierto)}
        disabled={cargandoTool}
        className={`p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0 ${
          abierto ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-400 hover:bg-slate-100 hover:text-indigo-600'
        } border border-slate-200 shadow-sm`}
        title="Herramientas del Sistema"
      >
        {cargandoTool ? (
          <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
        ) : (
          <Wrench size={20} />
        )}
      </button>

      {/* Dropdown Flotante */}
      {abierto && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Admin Tools
          </div>
          <div className="py-1">
            {itemsMenu.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.accion();
                  setAbierto(false); // Cierra el menú tras hacer clic
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                  item.peligro 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <item.icono size={16} />
                {item.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Dibujar el Modal si hay datos */}
      {datosModal && (
        <ModalHerramientas 
          datos={datosModal} 
          alCerrar={cerrarModal} 
        />
      )}
      
    </div>
  );
  
}