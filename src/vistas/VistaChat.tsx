import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BurbujaMensaje from '../componentes/chat/BurbujaMensaje';
import AreaEscritura from '../componentes/chat/AreaEscritura';
import { usarAgenteRAG } from '../hooks/usarAgenteRAG';
import { usarHistorialChat } from '../hooks/usarHistorialChats';
import { apiHerramientas } from '../servicios/apiHerramientas';
import type { Mensaje, ProductoAnalizado } from '../tipos/contratos';
import { Square, ChevronDown, Package } from 'lucide-react';

export default function VistaChat() {
  const { sesionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { historial, cargandoHistorial, errorHistorial, refrescarHistorial, asinSesion } = usarHistorialChat(sesionId);
  const { mensajes, setMensajes, cargando, estadoAgente, enviarPregunta, detenerGeneracion } = usarAgenteRAG(sesionId);

  const finalDelChatRef = useRef<HTMLDivElement>(null);

  // 🆕 Productos ya analizados: nos permiten retomar cualquiera desde "Chat nuevo",
  // incluso si ya no tienen ningún chat activo (por ejemplo, si borraste el chat).
  const [productos, setProductos] = useState<ProductoAnalizado[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [asinSeleccionado, setAsinSeleccionado] = useState<string>('');
  const [creandoSesion, setCreandoSesion] = useState(false);
  const [errorCreandoSesion, setErrorCreandoSesion] = useState<string | null>(null);

  // 🆕 Estado del dropdown personalizado (reemplaza al <select> nativo, así podemos
  // centrar y recortar los nombres de producto de forma consistente)
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cerrarSiEsAfuera = (evento: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(evento.target as Node)) {
        setSelectorAbierto(false);
      }
    };
    document.addEventListener('mousedown', cerrarSiEsAfuera);
    return () => document.removeEventListener('mousedown', cerrarSiEsAfuera);
  }, []);

  // Evita reenviar el mensaje pendiente si el efecto se vuelve a disparar para la misma sesión
  const mensajeInicialProcesadoPara = useRef<string | null>(null);

  // 🆕 Solo cuando estamos en "Chat nuevo" (sin sesionId en la URL) cargamos los productos analizados
  // 🆕 Cambiado a apiHerramientas para que mande el Token e identifique al usuario
  useEffect(() => {
    if (sesionId) return;

    let activo = true;
    setCargandoProductos(true);

    apiHerramientas.listarProductos() // 🌟 ANTES: apiLocal.listarProductos()
      .then((res) => {
        if (!activo) return;

        // Dependiendo de cómo devuelva los datos tu endpoint, si es un array directo 
        // o un objeto {"productos": [...]}, asegúrate de asignar el array:
        const lista = Array.isArray(res) ? res : (res.productos || []);

        setProductos(lista);
        if (lista.length > 0) {
          setAsinSeleccionado(lista[0].asin); // Preseleccionamos el último analizado
        }
      })
      .catch((error) => {
        console.error('No se pudieron cargar los productos analizados previamente:', error);
      })
      .finally(() => {
        if (activo) setCargandoProductos(false);
      });

    return () => { activo = false; };
  }, [sesionId]);

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

  //  Si llegamos aquí con un mensaje pendiente (viene del selector de "Chat nuevo"),
  // lo enviamos automáticamente en cuanto el historial de esa sesión ya cargó.
  // 🆕 Si llegamos aquí con un mensaje pendiente (viene del selector de "Chat nuevo"),
  // lo enviamos automáticamente en cuanto el historial de esa sesión ya cargó.
  useEffect(() => {
    const mensajePendiente = (location.state as { mensajeInicial?: string } | null)?.mensajeInicial;

    // 🚀 CORRECCIÓN CLAVE: Agregamos la validación contra la palabra "undefined"
    if (!sesionId || sesionId === 'undefined' || !mensajePendiente || cargandoHistorial) return;
    if (mensajeInicialProcesadoPara.current === sesionId) return; // ya se envió para esta sesión

    mensajeInicialProcesadoPara.current = sesionId;

    // 🚀 CORRECCIÓN CLAVE: Limpiamos el state de navegación ANTES de enviar la pregunta.
    // Esto evita que mutaciones simultáneas de la ruta interrumpan el stream de renderizado.
    navigate(location.pathname, { replace: true, state: {} });

    enviarPregunta(mensajePendiente, () => {
      if (refrescarHistorial) refrescarHistorial();
    });

  }, [sesionId, cargandoHistorial, location.state, navigate, refrescarHistorial]);

  const alEnviarMensaje = async (texto: string) => {
    // 🛑 EL INTERCEPTOR: Si no hay sesión válida en la URL, estamos en "Chat nuevo"
    if (!sesionId || sesionId === 'undefined') {

      // 🟢 CASO A: Se seleccionó un producto analizado -> creamos la sesión en SQLite
      if (asinSeleccionado) {
        setErrorCreandoSesion(null);
        setSelectorAbierto(false);
        setCreandoSesion(true);
        try {
          // 🚀 Crea la sesión autenticada vinculada al producto y usuario
          const nuevaSesion = await apiHerramientas.crearSesion(asinSeleccionado);

          // Redirigimos al chat con el ID legítimo
          navigate(`/chat/${nuevaSesion.id}`, { state: { mensajeInicial: texto, asin: asinSeleccionado } });
        } catch (error) {
          console.error('No se pudo crear la sesión para el producto seleccionado:', error);
          setErrorCreandoSesion('No se pudo iniciar el chat para ese producto. Intenta de nuevo.');
        } finally {
          setCreandoSesion(false);
        }
        return; // 👈 CORRECCIÓN CLAVE: Corta la ejecución para no llamar a enviarPregunta
      }

      // 🛑 CASO B: No hay ningún producto seleccionado -> Simulación local decorativa
      const mensajeUsuario: Mensaje = {
        id: `temp-usr-${Date.now()}`,
        rol: 'usuario',
        contenido: texto
      };
      setMensajes(prev => [...prev, mensajeUsuario]);

      setTimeout(() => {
        const mensajeAgente: Mensaje = {
          id: `temp-agt-${Date.now()}`,
          rol: 'agente',
          contenido: "¡Hola! Para que pueda ayudarte a responder preguntas, primero selecciona uno de tus productos analizados en el menú desplegable de arriba o carga un nuevo enlace en el **Panel Principal**. 📦"
        };
        setMensajes(prev => [...prev, mensajeAgente]);
      }, 600);

      return; // 👈 CORRECCIÓN CLAVE: Detiene la función sin contactar al backend
    }

    // 🟢 FLUJO NORMAL: Si hay una sesión activa legítima, enviamos la consulta al Agente RAG.
    enviarPregunta(texto, () => {
      if (refrescarHistorial) refrescarHistorial();
    });
  };

  // 🆕 ASIN del producto sobre el que va este chat, para las Herramientas rápidas (ej. exportar CSV).
  // Prioridad: 1) el que ya confirmó el backend para esta sesión, 2) el que venía en el state de
  // navegación justo al crear la sesión (evita un parpadeo mientras carga el historial),
  // 3) el que está seleccionado en el selector de "Chat nuevo".
  const asinDesdeNavegacion = (location.state as { asin?: string } | null)?.asin;
  const asinActual = asinSesion || asinDesdeNavegacion || (!sesionId ? asinSeleccionado : undefined);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#121212] rounded-xl  overflow-hidden relative">

      {(errorHistorial || errorCreandoSesion) && (
        <div className="bg-red-950/40 text-red-400 p-3 text-sm text-center border-b border-red-900/50">
          {errorHistorial || errorCreandoSesion}
        </div>
      )}

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

            {/* 🆕 Selector de producto ya analizado, solo en "Chat nuevo" y si ya hay algo analizado.
                Lista TODOS los productos (tabla `productos`), tengan o no un chat activo. */}
            {!sesionId && productos.length > 0 && (
              <div className="flex flex-col items-center gap-2 mb-5">
                <p className="text-sm text-neutral-500 font-medium">
                  Elige sobre qué producto ya analizado quieres preguntar
                </p>

                <div ref={selectorRef} className="relative w-72">
                  <button
                    type="button"
                    disabled={creandoSesion}
                    onClick={() => setSelectorAbierto((prev) => !prev)}
                    title={productos.find((p) => p.asin === asinSeleccionado)?.nombre}
                    className="w-full flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 hover:border-indigo-500/60 text-neutral-200 text-sm rounded-2xl pl-4 pr-3 py-3 shadow-lg shadow-black/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Package size={16} className="text-indigo-400 shrink-0" />
                    <span className="flex-1 truncate text-center font-medium">
                      {productos.find((p) => p.asin === asinSeleccionado)?.nombre || 'Selecciona un producto'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-neutral-500 shrink-0 transition-transform ${selectorAbierto ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {selectorAbierto && (
                    <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl shadow-black/40 ocultar-scroll animate-in fade-in zoom-in-95 duration-150">
                      {productos.map((producto) => {
                        const seleccionado = producto.asin === asinSeleccionado;
                        return (
                          <button
                            key={producto.asin}
                            type="button"
                            title={producto.nombre}
                            onClick={() => {
                              setAsinSeleccionado(producto.asin);
                              setSelectorAbierto(false);
                            }}
                            className={`w-full text-center text-sm px-4 py-2.5 truncate transition-colors ${seleccionado
                              ? 'bg-indigo-500/10 text-indigo-300 font-medium'
                              : 'text-neutral-300 hover:bg-neutral-800/70'
                              }`}
                          >
                            {producto.nombre || producto.asin}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-sm text-neutral-500 max-w-md font-medium">
              {creandoSesion
                ? 'Preparando el chat para ese producto...'
                : !sesionId && productos.length > 0
                  ? 'Escribe tu pregunta abajo para empezar con el producto seleccionado.'
                  : 'El agente está listo para ayudarte.'}
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
        cargando={cargando || cargandoHistorial || creandoSesion || (!sesionId && cargandoProductos)}
        onDetener={detenerGeneracion}
        asinActual={asinActual}
      />
    </div>
  );
}