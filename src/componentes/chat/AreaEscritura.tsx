import { useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  alEnviar: (texto: string) => void;
  cargando?: boolean;
}

export default function AreaEscritura({ alEnviar, cargando = false }: Props) {
  const [texto, setTexto] = useState('');

  const manejarEnvio = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (texto.trim() && !cargando) {
      alEnviar(texto);
      setTexto(''); // Limpiamos el input después de enviar
    }
  };

  const manejarTecla = (e: React.KeyboardEvent) => {
    // Si presiona Enter sin Shift, enviamos el mensaje
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      manejarEnvio();
    }
  };

  return (
    <form onSubmit={manejarEnvio} className="p-4 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto flex gap-3 items-end">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={manejarTecla}
          placeholder="Pregúntale al agente sobre las reseñas..."
          className="flex-1 resize-none rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] max-h-32 shadow-sm"
          rows={1}
          disabled={cargando}
        />
        <button
          type="submit"
          disabled={!texto.trim() || cargando}
          className="flex-shrink-0 mb-1 bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}