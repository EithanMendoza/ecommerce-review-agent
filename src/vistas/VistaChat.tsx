import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BurbujaMensaje from '../componentes/chat/BurbujaMensaje';
import AreaEscritura from '../componentes/chat/AreaEscritura';
import { usarAgenteRAG } from '../hooks/usarAgenteRAG';
import { usarHistorialChat } from '../hooks/usarHistorialChats';
import type { Mensaje } from '../tipos/contratos';
import { Square } from 'lucide-react';

export default function VistaChat() {
  const { sesionId } = useParams();
  const navigate = useNavigate();

  const { historial, cargandoHistorial, errorHistorial, refrescarHistorial } = usarHistorialChat(sesionId);
  const { mensajes, setMensajes, cargando, estadoAgente, enviarPregunta, detenerGeneracion } = usarAgenteRAG(sesionId);

  const finalDelChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cargandoHistorial) return;

    if (historial.length > 0) {
      const historialMapeado: Mensaje[] = historial.map((msg) => ({
        id: msg.id,
        rol: msg.rol === 'user' ? 'usuario' : 'agente',
        contenido: msg.contenido,
      }));
      setMensajes(historialMapeado);
    } else {
      // 🚀 Si es un chat nuevo, dejamos el arreglo vacío para que se dibuje el título de bienvenida grande
      setMensajes([]);
    }
  }, [historial, cargandoHistorial, setMensajes]);

  useEffect(() => {
    finalDelChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const alEnviarMensaje = (texto: string) => {
    enviarPregunta(texto, (idFinalizado) => {
      navigate(`/chat/${idFinalizado}`, { replace: true });
      if (refrescarHistorial) refrescarHistorial();
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#181818] rounded-xl border border-neutral-900/80 overflow-hidden shadow-xl relative">

      {/* 🔴 ESTE ES EL ERROR: Lo regresamos a como estaba originalmente */}
      {errorHistorial && (
        <div className="bg-red-950/40 text-red-400 p-3 text-sm text-center border-b border-red-900/50">
          {errorHistorial}
        </div>
      )}

      {/* 🟢 AQUÍ ES DONDE DEBE IR ocultar-scroll: Contenedor del scroll del chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative ocultar-scroll">
        
        {cargandoHistorial ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#141414]/90 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-neutral-800 border-t-indigo-500 rounded-full animate-spin"></div>
              <span className="text-sm text-neutral-400 font-medium">Recuperando memorias...</span>
            </div>
          </div>
        ) : mensajes.length === 0 ? (

          /* 🌟 PANTALLA DE BIENVENIDA ESTILO CHATGPT/GEMINI */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400 bg-clip-text text-transparent tracking-tight mb-3">
              ¿Cómo te puedo ayudar hoy?
            </h1>
            <p className="text-sm text-neutral-500 max-w-md font-medium">
              El agente esá listo para ayudarte.
            </p>
          </div>

        ) : (
          /* FILAS DE CONVERSACIÓN NORMAL */
          <div className="max-w-4xl mx-auto space-y-2">
            {mensajes.map((msg, index) => {
              const esElUltimo = index === mensajes.length - 1;
              return (
                <BurbujaMensaje
                  key={msg.id || `mensaje-${index}`}
                  mensaje={msg}
                  estadoAgente={esElUltimo && msg.rol === 'agente' ? estadoAgente : null}
                  onReintentar={alEnviarMensaje} 
                />
              );
            })}

            {/* LOGS DE PENSAMIENTO EN TIEMPO REAL DEL AGENTE RAG EN LÍNEA */}
            {estadoAgente && mensajes[mensajes.length - 1]?.rol === 'usuario' && (
              <div className="text-sm text-indigo-400 font-medium italic flex items-center gap-3 pl-4 py-2 opacity-90 animate-pulse bg-indigo-950/10 border border-indigo-900/20 rounded-xl max-w-max mt-4">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-800 border-t-indigo-400 animate-spin"></div>
                <span>{estadoAgente}...</span>
              </div>
            )}
            <div ref={finalDelChatRef} />
          </div>
        )}
      </div>

      {/* FOOTER DEL CHAT (Se mantiene en su posición fija abajo) */}
      <AreaEscritura 
        alEnviar={alEnviarMensaje} 
        cargando={cargando || cargandoHistorial} 
        onDetener={detenerGeneracion} 
      />
    </div>
  );
}