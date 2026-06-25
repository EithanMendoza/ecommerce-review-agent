import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BurbujaMensaje from '../componentes/chat/BurbujaMensaje';
import AreaEscritura from '../componentes/chat/AreaEscritura';
import { usarAgenteRAG } from '../hooks/usarAgenteRAG';
import { usarHistorialChat } from '../hooks/usarHistorialChats';
import type { Mensaje } from '../tipos/contratos';

export default function VistaChat() {
  const { sesionId } = useParams();
  const navigate = useNavigate();

  // 🚀 Extraemos 'refrescarHistorial' (la función encargada de recargar la lista de chats del hook)
  const { historial, cargandoHistorial, errorHistorial, refrescarHistorial } = usarHistorialChat(sesionId);
  const { mensajes, setMensajes, cargando, estadoAgente, enviarPregunta } = usarAgenteRAG(sesionId);

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
      setMensajes([{
        id: 'inicio',
        rol: 'agente',
        contenido: '¡Sistemas en línea! He indexado las reseñas en ChromaDB. ¿Qué patrón o producto quieres analizar hoy?'
      }]);
    }
  }, [historial, cargandoHistorial, setMensajes]);

  useEffect(() => {
    finalDelChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const alEnviarMensaje = (texto: string) => {
    enviarPregunta(texto, (idFinalizado) => {
      // 1. Cambiamos la URL de forma limpia al terminar el stream para fijar la sesión activa
      navigate(`/chat/${idFinalizado}`, { replace: true });

      // 2. 🚀 Forzamos de inmediato al Sidebar a pedir la lista actualizada al backend
      // Esto hará que FastAPI devuelva el título autogenerado basado en tu primera pregunta
      if (refrescarHistorial) {
        refrescarHistorial();
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden shadow-sm relative">
      {errorHistorial && (
        <div className="bg-red-50 text-red-600 p-3 text-sm text-center border-b border-red-200">
          {errorHistorial}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cargandoHistorial ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-sm text-slate-500 font-medium">Recuperando memorias...</span>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {mensajes.map((msg, index) => (
              <BurbujaMensaje key={msg.id || `mensaje-${index}`} mensaje={msg} />
            ))}

            {estadoAgente && (
              <div className="text-sm text-indigo-500 font-medium italic flex items-center gap-3 pl-4 py-2 opacity-80 animate-pulse">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                {estadoAgente}
              </div>
            )}
            <div ref={finalDelChatRef} />
          </div>
        )}
      </div>

      <AreaEscritura alEnviar={alEnviarMensaje} cargando={cargando || cargandoHistorial} />
    </div>
  );
}