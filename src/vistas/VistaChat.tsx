import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import BurbujaMensaje from '../componentes/chat/BurbujaMensaje';
import AreaEscritura from '../componentes/chat/AreaEscritura';
import { usarAgenteRAG } from '../hooks/usarAgenteRAG';
import { usarHistorialChat } from '../hooks/usarHistorialChats';
import type { Mensaje } from '../tipos/contratos';

export default function VistaChat() {
  // 1. Obtenemos el ID de la sesión desde la URL de React Router
  const { sesionId } = useParams();
  
  // 2. Traemos las herramientas de nuestros dos hooks aislados
  const { historial, cargandoHistorial, errorHistorial } = usarHistorialChat(sesionId);
  const { mensajes, setMensajes, cargando, estadoAgente, enviarPregunta } = usarAgenteRAG(sesionId);
  
  const finalDelChatRef = useRef<HTMLDivElement>(null);

  // 3. Efecto Puente: Inyectar el historial cuando termine de cargar
  useEffect(() => {
    if (cargandoHistorial) return;

    if (historial.length > 0) {
      // Mapeamos los datos de la DB (user/assistant) al contrato de la UI (usuario/agente)
      const historialMapeado: Mensaje[] = historial.map((msg) => ({
        id: msg.id,
        rol: msg.rol === 'user' ? 'usuario' : 'agente',
        contenido: msg.contenido,
      }));
      setMensajes(historialMapeado);
    } else {
      // Si es un chat nuevo o no hay historial, ponemos el mensaje de bienvenida
      setMensajes([{
        id: 'inicio',
        rol: 'agente',
        contenido: '¡Sistemas en línea! He indexado las reseñas en ChromaDB. ¿Qué patrón o producto quieres analizar hoy?'
      }]);
    }
  }, [historial, cargandoHistorial, setMensajes]);

  // 4. Auto-scroll suave cada vez que se agrega un mensaje nuevo
  useEffect(() => {
    finalDelChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden shadow-sm relative">
      
      {/* Banner superior si falla la conexión a la base de datos */}
      {errorHistorial && (
        <div className="bg-red-50 text-red-600 p-3 text-sm text-center border-b border-red-200">
          {errorHistorial}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Pantalla de carga superpuesta mientras baja el historial */}
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
              // Si msg.id es undefined o vacío, usa "mensaje-0", "mensaje-1", etc.
              <BurbujaMensaje key={msg.id || `mensaje-${index}`} mensaje={msg} />
            ))}
            
            {/* Animación de Estado Dinámico del Agente */}
            {estadoAgente && (
              <div className="text-sm text-indigo-500 font-medium italic flex items-center gap-3 pl-4 py-2 opacity-80 animate-pulse">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                {estadoAgente}
              </div>
            )}
            {/* Ancla para el auto-scroll */}
            <div ref={finalDelChatRef} />
          </div>
        )}
      </div>

      {/* Bloqueamos el input si el agente está escribiendo o si el historial está cargando */}
      <AreaEscritura alEnviar={enviarPregunta} cargando={cargando || cargandoHistorial} />
    </div>
  );
}