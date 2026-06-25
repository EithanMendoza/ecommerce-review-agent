import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Check, X, Plus } from 'lucide-react';
import MenuHerramientas from './MenuHerramientas';
import OndasVoz from './OndasVoz';
import { usarReconocimientoVoz } from '../../hooks/usarReconocimientoVoz';

interface Props {
  alEnviar: (texto: string) => void;
  cargando: boolean;
}

export default function AreaEscritura({ alEnviar, cargando }: Props) {
  const [texto, setTexto] = useState('');
  const [bloqueoClick, setBloqueoClick] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textoBaseRef = useRef('');

  const { escuchando, soportado, textoTranscrito, alternarEscucha } = usarReconocimientoVoz();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [texto]);

  useEffect(() => {
    if (escuchando) {
      textoBaseRef.current = texto;
    }
  }, [escuchando]);

  const manejarAlternarMicrofonoSeguro = () => {
    if (bloqueoClick) return;

    setBloqueoClick(true);
    alternarEscucha();

    setTimeout(() => {
      setBloqueoClick(false);
    }, 600);
  };

  const manejarAceptarDictado = () => {
    if (escuchando) manejarAlternarMicrofonoSeguro();

    if (textoTranscrito.trim()) {
      setTexto((previo) => previo.trim() ? `${previo.trim()} ${textoTranscrito.trim()}` : textoTranscrito.trim());
    }
  };

  const manejarCancelarDictado = () => {
    if (escuchando) manejarAlternarMicrofonoSeguro();
  };

  const manejarEnvioFinal = () => {
    if (!texto.trim() || cargando) return;
    alEnviar(texto);
    setTexto('');
  };

  const manejarTecla = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      manejarEnvioFinal();
    }
  };

  return (
    // 🎨 CONTENEDOR EXTERIOR DARK MODE
    <div className="p-4 bg-[#121212] border-t border-neutral-900/80 shrink-0 select-none">
      <div className="max-w-4xl mx-auto flex items-center gap-3">

        {!escuchando && <MenuHerramientas />}

        {/* CONTENEDOR DE DICTADO ESTILO WINDOWS CON ONDAS EXPANDIDAS */}
        {escuchando ? (
          <div className="flex-1 flex items-center h-[46px] px-4 bg-[#202020] border border-neutral-800 rounded-full shadow-lg transition-all">
            <Plus size={18} className="text-neutral-500 mr-2 shrink-0 cursor-not-allowed" />

            <OndasVoz />

            <div className="flex items-center gap-3 shrink-0 ml-2 pl-2 border-l border-neutral-700">
              <button
                type="button"
                disabled={bloqueoClick}
                onClick={manejarCancelarDictado}
                className="p-1 text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-30"
                title="Cancelar dictado"
              >
                <X size={18} className="stroke-[2.5px]" />
              </button>
              <button
                type="button"
                disabled={bloqueoClick}
                onClick={manejarAceptarDictado}
                className="p-1 text-neutral-100 hover:text-emerald-400 transition-colors disabled:opacity-30"
                title="Confirmar dictado y ver texto"
              >
                <Check size={18} className="stroke-[2.5px]" />
              </button>
            </div>
          </div>
        ) : (
          /* 📝 INPUT TRADICIONAL DE MENSAJES EN VERSIÓN DARK */
          <div className="flex-1 relative bg-[#202020] border border-neutral-800 rounded-xl shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/80 transition-all flex items-end pr-2">
            <textarea
              ref={textareaRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={manejarTecla}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full max-h-32 min-h-[44px] py-3 pl-4 pr-2 bg-transparent resize-none outline-none text-neutral-200 text-sm placeholder-neutral-600"
              disabled={cargando}
              rows={1}
            />

            {soportado && (
              <button
                type="button"
                disabled={bloqueoClick}
                onClick={manejarAlternarMicrofonoSeguro}
                className="p-2 mb-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-indigo-400 rounded-lg transition-colors shrink-0 disabled:opacity-40"
                title="Escribir con voz"
              >
                <Mic size={18} />
              </button>
            )}
          </div>
        )}

        {/* 🚀 BOTÓN DE ENVÍO ADAPTADO */}
        <button
          type="button"
          onClick={manejarEnvioFinal}
          disabled={!texto.trim() || cargando || escuchando}
          className={`p-3 rounded-full transition-all flex items-center justify-center shrink-0 border ${texto.trim() && !cargando && !escuchando
              ? 'bg-[#202020] hover:bg-[#2a2a2a] text-emerald-400 border-neutral-700 hover:border-emerald-500/50 shadow-md hover:shadow-emerald-950/30'
              : 'bg-[#181818] text-neutral-600 border-neutral-800 cursor-not-allowed'
            }`}
        >
          {cargando ? (
            <div className="w-5 h-5 border-2 border-neutral-600 border-t-emerald-400 rounded-full animate-spin" />
          ) : (
            <Send size={18} className={texto.trim() && !cargando && !escuchando ? "text-emerald-400" : "text-neutral-600"} />
          )}
        </button>
      </div>
    </div>
  );
}