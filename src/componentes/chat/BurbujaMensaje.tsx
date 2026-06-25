import { Bot, Loader2 } from 'lucide-react';
import type { Mensaje } from '../../tipos/contratos';

interface Props {
  mensaje: Mensaje;
  estadoAgente?: string | null;
}

export default function BurbujaMensaje({ mensaje, estadoAgente }: Props) {
  const esUsuario = mensaje.rol === 'usuario';

  return (
    <div className={`w-full py-4 transition-all flex ${esUsuario ? 'justify-end' : 'justify-start'
      }`}>
      <div className="max-w-4xl w-full flex gap-4 px-4 items-start">

        {/* 🤖 AVATAR DEL BOT */}
        {!esUsuario && (
          <div className="shrink-0 w-8 h-8 flex items-center justify-center text-sm font-semibold bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <Bot size={16} />
          </div>
        )}

        {/* CONTENEDOR FLEXIBLE */}
        <div className={`flex flex-col space-y-1.5 flex-1 ${esUsuario ? 'items-end' : 'items-start'}`}>

          {/* Nombre identificador superior */}
          <p className={`text-[11px] font-bold uppercase tracking-widest ${esUsuario ? 'text-indigo-400' : 'text-emerald-400'
            }`}>
            {esUsuario ? 'Tú' : 'Agente RAG'}
          </p>

          {/* 🚀 RENDERIZACIÓN DE CONTENIDO */}
          {esUsuario ? (
            /* TU PARTE: Burbuja azul compacta */
            <div className="bg-indigo-600 border border-indigo-500/80 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-none shadow-md max-w-[85%] text-left leading-relaxed whitespace-pre-wrap break-words font-medium">
              {mensaje.contenido}
            </div>
          ) : (
            /* PARTE DEL BOT: El texto brota con un efecto fluido y elegante */
            <div className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap break-words font-normal w-full pt-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-1 ease-out">
              {mensaje.contenido}
            </div>
          )}

          {/* 🧠 BLOQUE DE RAZONAMIENTO INTEGRADO DENTRO DEL BOT */}
          {!esUsuario && estadoAgente && (
            <div className="mt-4 w-full flex flex-col gap-2 p-3 bg-[#202020]/60 border border-neutral-800 rounded-xl max-w-2xl animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                <Loader2 size={13} className="animate-spin text-indigo-400" />
                <span>Procesando consulta RAG</span>
              </div>
              <p className="text-xs text-neutral-500 italic pl-5">
                {estadoAgente}...
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}