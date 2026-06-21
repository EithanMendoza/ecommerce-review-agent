import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import MenuHerramientas from './MenuHerramientas';
import { usarReconocimientoVoz } from '../../hooks/usarReconocimientoVoz';

interface Props {
  alEnviar: (texto: string) => void;
  cargando: boolean;
}

export default function AreaEscritura({ alEnviar, cargando }: Props) {
  const [texto, setTexto] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Ref para guardar el texto que ya estaba antes de encender el micro
  const textoBaseRef = useRef(''); 
  
  const { escuchando, soportado, textoTranscrito, alternarEscucha } = usarReconocimientoVoz();

  // Efecto 1: Auto-ajustar la altura del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [texto]);

  // Efecto 2: Cuando el micrófono se enciende, guardamos el texto que el usuario ya había escrito a mano
  useEffect(() => {
    if (escuchando) {
      textoBaseRef.current = texto;
    }
  }, [escuchando]);

  // Efecto 3: Muestra en tiempo real la suma del texto base + lo que está escuchando
  useEffect(() => {
    if (escuchando) {
      const base = textoBaseRef.current.trim();
      // Si ya había texto, le ponemos un espacio antes de agregar la voz
      const nuevoTexto = base && textoTranscrito ? `${base} ${textoTranscrito}` : base || textoTranscrito;
      setTexto(nuevoTexto);
    }
  }, [textoTranscrito, escuchando]);

  const manejarEnvio = () => {
    if (!texto.trim() || cargando) return;
    
    if (escuchando) alternarEscucha();
    
    alEnviar(texto);
    setTexto('');
    textoBaseRef.current = ''; // Limpiamos la base tras enviar
  };

  const manejarTecla = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      manejarEnvio();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200 shrink-0">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        
        <MenuHerramientas />

        <div className={`flex-1 relative bg-slate-50 border rounded-xl shadow-sm transition-all flex items-end pr-2 ${
          escuchando ? 'border-red-400 ring-2 ring-red-100 bg-red-50/30' : 'border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500'
        }`}>
          <textarea
            ref={textareaRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={manejarTecla}
            placeholder={escuchando ? "Escuchando... (habla ahora)" : "Escribe tu mensaje aquí..."}
            className={`w-full max-h-32 min-h-[44px] py-3 pl-4 pr-2 bg-transparent resize-none outline-none text-slate-700 ${
              escuchando ? 'placeholder-red-400' : 'placeholder-slate-400'
            }`}
            disabled={cargando}
            rows={1}
          />
          
          {/* Botón de Micrófono (solo se muestra si el navegador lo soporta) */}
          {soportado && (
            <button
              onClick={alternarEscucha}
              disabled={cargando}
              className={`p-2 mb-1.5 rounded-lg transition-colors shrink-0 ${
                escuchando 
                  ? 'text-red-500 hover:bg-red-100 animate-pulse' 
                  : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'
              }`}
              title={escuchando ? "Detener micrófono" : "Hablar"}
            >
              {escuchando ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
        </div>

        <button
          onClick={manejarEnvio}
          disabled={!texto.trim() || cargando}
          className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 ${
            texto.trim() && !cargando
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {cargando ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
}