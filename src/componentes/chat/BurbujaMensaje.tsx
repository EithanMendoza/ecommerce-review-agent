import { User, Bot } from 'lucide-react';
import type { Mensaje } from '../../tipos/contratos';

interface Props {
  mensaje: Mensaje;
}

export default function BurbujaMensaje({ mensaje }: Props) {
  const esUsuario = mensaje.rol === 'usuario';

  return (
    <div className={`flex gap-4 p-4 rounded-xl ${esUsuario ? 'bg-white border border-slate-100 shadow-sm' : 'bg-transparent'}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${esUsuario ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
        {esUsuario ? <User size={18} /> : <Bot size={18} />}
      </div>
      
      {/* Contenido del mensaje */}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-slate-700">
          {esUsuario ? 'Tú' : 'Agente RAG'}
        </p>
        <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
          {mensaje.contenido}
        </div>
      </div>
    </div>
  );
}