import { useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { useProcesarProducto } from '../../../hooks/useProcesarProducto';
import { PanelRequisitos } from './vistas/PanelRequisitos';
import { VistaExito } from './vistas/VistaExito';
import { VistaCarga } from './vistas/VistaCarga';
import { VistaFormulario } from './vistas/VistaFormulario';

interface Props {
  estaAbierto: boolean;
  alCerrar: () => void;
  alCompletar: (sesionId: string) => void;
}

export default function ModalCargarProducto({ estaAbierto, alCerrar, alCompletar }: Props) {
  const { estado, error, sesionId, procesarEnlace, resetear } = useProcesarProducto();

  useEffect(() => {
    if (!estaAbierto) resetear();
  }, [estaAbierto, resetear]);

  if (!estaAbierto) return null;

  const manejarCierreNormal = () => {
    resetear();
    alCerrar();
  };

  const manejarFinalizacion = () => {
    if (sesionId) alCompletar(sesionId);
    manejarCierreNormal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-6 animate-fadeIn">
      <div className="w-full h-full sm:h-[600px] sm:max-w-5xl rounded-none sm:rounded-3xl overflow-hidden bg-[#141414] border-0 sm:border sm:border-neutral-800 shadow-2xl flex flex-col">
        
        {/* CABECERA */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-neutral-800 flex justify-between items-center bg-[#161616] shrink-0">
          <div className="flex items-center gap-3">
            <PlusCircle size={22} className="text-indigo-400 shrink-0" />
            <h2 className="text-sm sm:text-base uppercase tracking-[0.15em] sm:tracking-[0.2em] text-neutral-200 font-bold">
              Asistente de Lectura Inteligente
            </h2>
          </div>
          <button
            onClick={manejarCierreNormal}
            disabled={estado === 'procesando'}
            className="p-2 rounded-xl hover:bg-neutral-800 transition text-neutral-400 hover:text-white disabled:opacity-30 shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {/* CUERPO */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          <PanelRequisitos />

          {/* Renderizado Dinámico */}
          <div className="flex-1 p-6 sm:p-10 md:overflow-y-auto bg-[#121212] flex flex-col justify-center">
            {estado === 'exito' && <VistaExito onContinuar={manejarFinalizacion} />}
            {estado === 'procesando' && <VistaCarga />}
            {estado === 'formulario' && (
              <VistaFormulario 
                error={error} 
                onSubmit={procesarEnlace} 
                onCancelar={manejarCierreNormal} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}