import { useState, useRef, useEffect } from 'react';
import { Wrench, Activity, FileText, Download, BarChart2, Plus } from 'lucide-react';
import { usarHerramientas } from '../../hooks/usarHerramientas';
import ModalHerramientas from '../ui/ModalHerramientas';

export default function MenuHerramientas() {
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    cargandoTool,
    datosModal,
    cerrarModal,
    reportes, limpiarCache, exportarCsv
  } = usarHerramientas();

  useEffect(() => {
    const manejarClicFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', manejarClicFuera);
    return () => document.removeEventListener('mousedown', manejarClicFuera);
  }, []);

  const itemsMenu: { nombre: string; icono: React.ElementType; accion: () => void; peligro?: boolean }[] = [
    { nombre: 'Listar Reportes', icono: FileText, accion: reportes },
    { nombre: 'Exportar CSV', icono: Download, accion: exportarCsv },
  ];

  return (
    <div className="relative select-none" ref={menuRef}>
      {/* 🛠️ BOTÓN DISPARADOR TOTALMENTE REDONDEADO Y OSCURO */}
      <button
        onClick={() => setAbierto(!abierto)}
        disabled={cargandoTool}
        className={`p-3 rounded-full transition-all flex items-center justify-center shrink-0 border ${abierto
          ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30'
          : 'bg-[#202020] text-neutral-400 border-neutral-800 hover:bg-[#2a2a2a] hover:text-neutral-200'
          } shadow-md`}
        title="Herramientas del Sistema"
      >
        {cargandoTool ? (
          <div className="w-5 h-5 border-2 border-neutral-700 border-t-indigo-400 rounded-full animate-spin" />
        ) : (
          <Plus size={18} />
        )}
      </button>

      {/* 📌 DROPDOWN FLOTANTE ESTILO DARK MODE */}
      {abierto && (
        <div className="absolute bottom-full left-0 mb-3 w-60 bg-[#1e1e1e] rounded-xl shadow-xl border border-neutral-800/80 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-4 py-2.5 bg-[#161616] border-b border-neutral-800 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Herramientas rápidas
          </div>
          <div className="py-1 bg-[#1e1e1e]">
            {itemsMenu.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.accion();
                  setAbierto(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${item.peligro
                  ? 'text-red-400 hover:bg-red-950/20'
                  : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-indigo-400'
                  }`}
              >
                <item.icono size={16} className={item.peligro ? 'text-red-400' : 'text-neutral-400 group-hover:text-indigo-400'} />
                <span>{item.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 📊 DIBUJAR EL MODAL SOLO SI ES ESTRICTAMENTE REQUERIDO */}
      {datosModal && (
        <ModalHerramientas
          datos={datosModal}
          alCerrar={cerrarModal}
        />
      )}

    </div>
  );
}