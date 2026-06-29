import React, { useState, useEffect } from 'react';
import { apiLocal } from '../../servicios/apiLocal';
import {
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  Sparkles,
  Database,
  Search,
  Brain,
  Network,
} from 'lucide-react';

interface ModalCargarProductoProps {
  estaAbierto: boolean;
  alCerrar: () => void;
  alCompletar: () => void;
}

// Fases dinámicas que cambian con su respectivo icono central
const PASOS_CARGA = [
  { texto: "Abriendo una ventana del navegador de forma segura...", icono: <Network className="text-indigo-400 animate-pulse" size={24} /> },
  { texto: "Analizando el enlace obligatorio proporcionado...", icono: <Search className="text-indigo-400 animate-pulse" size={24} /> },
  { texto: "Extrayendo los comentarios y opiniones públicas...", icono: <Database className="text-amber-400 animate-bounce" size={24} /> },
  { texto: "Estructurando y guardando la información recopilada...", icono: <Sparkles className="text-purple-400 animate-spin" style={{ animationDuration: '3s' }} size={24} /> },
  { texto: "Inyectando conocimientos nuevos en tu asistente...", icono: <Brain className="text-emerald-400 animate-pulse" size={24} /> }
];

export default function ModalCargarProducto({ estaAbierto, alCerrar, alCompletar }: ModalCargarProductoProps) {
  const [url, setUrl] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);

  // Sistema interactivo para rotar las fases de carga
  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval>;
    if (cargando) {
      setPasoActual(0);
      intervalo = setInterval(() => {
        setPasoActual((prev) => (prev + 1) % PASOS_CARGA.length);
      }, 3500);
    }
    return () => clearInterval(intervalo);
  }, [cargando]);

  if (!estaAbierto) return null;

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Por favor, ingresa el enlace requerido para continuar.');
      return;
    }

    setError('');
    setCargando(true);

    try {
      await apiLocal.cargarNuevoProducto(url);
      setUrl('');
      setExito(true);
      alCompletar();
    } catch (err: any) {
      setError(err.message || 'No pudimos procesar el enlace obligatorio. Asegúrate de que sea correcto.');
    } finally {
      setCargando(false);
    }
  };

  const manejarCerrar = () => {
    setExito(false);
    setError('');
    setUrl('');
    alCerrar();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fadeIn">

      {/* CONTENEDOR GIGANTE */}
      <div className="w-full max-w-5xl h-[600px] rounded-3xl overflow-hidden bg-[#141414] border border-neutral-800 shadow-2xl flex flex-col">

        {/* CABECERA */}
        <div className="px-8 py-5 border-b border-neutral-800 flex justify-between items-center bg-[#161616]">
          <div className="flex items-center gap-3">
            <PlusCircle size={22} className="text-indigo-400" />
            <h2 className="text-base uppercase tracking-[0.2em] text-neutral-200 font-bold">
              Asistente de Lectura Inteligente
            </h2>
          </div>
          <button
            onClick={manejarCerrar}
            disabled={cargando}
            className="p-2 rounded-xl hover:bg-neutral-800 transition text-neutral-400 hover:text-white disabled:opacity-30"
          >
            <X size={22} />
          </button>
        </div>

        {/* CUERPO EN DOBLE COLUMNA AMPLIA */}
        <div className="flex-1 flex overflow-hidden">

          {/* COLUMNA IZQUIERDA: REQUISITOS OBLIGATORIOS */}
          <div className="w-80 bg-[#161616] p-8 border-r border-neutral-800 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-neutral-400">
                <HelpCircle size={18} className="text-indigo-400" />
                <span className="text-xs uppercase tracking-wider font-bold">Requisito Necesario</span>
              </div>

              {/* NOTA 1: OBLIGATORIEDAD DEL LINK */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <Compass size={16} />
                  <span>Enlace Obligatorio</span>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Para activar el análisis, <span className="text-white font-medium">es estrictamente necesario</span> proporcionar el enlace del producto. Sin esta información, el sistema no puede iniciar el proceso de lectura.
                </p>
              </div>

              {/* NOTA 2: EXPLICACIÓN DEL NAVEGADOR EN SERVIDOR */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                  <Sparkles size={16} />
                  <span>Ventana del Navegador</span>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  El sistema abrirá una ventana del navegador de forma interna para ingresar de manera directa al enlace, garantizando un escaneo fiel y completo del contenido.
                </p>
              </div>
            </div>

            <div className="text-xs text-neutral-500 font-medium">
              Conexión segura y cifrada
            </div>
          </div>

          {/* COLUMNA DERECHA: FLUJO DINÁMICO */}
          <div className="flex-1 p-10 overflow-y-auto bg-[#121212] flex flex-col justify-center">

            {/* 1. PANTALLA DE ÉXITO */}
            {exito && (
              <div className="flex flex-col items-center justify-center space-y-5 text-center animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">¡Lectura Completada con Éxito!</h3>
                <p className="text-base text-neutral-400 max-w-lg leading-relaxed">
                  Hemos terminado de leer y procesar todas las opiniones del producto de manera exitosa. Tu Inteligencia Artificial ya aprendió de esta información y está lista para responder todas tus preguntas.
                </p>
                <button
                  onClick={manejarCerrar}
                  className="mt-4 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-lg shadow-emerald-600/20"
                >
                  ¡Excelente, empezar!
                </button>
              </div>
            )}

            {/* 2. PANTALLA DE CARGA CON LOADER GRANDE E ICONOS DINÁMICOS */}
            {cargando && (
              <div className="flex flex-col items-center justify-center space-y-8 text-center animate-fadeIn">

                {/* Loader Unificado Gigante */}
                <div className="relative flex items-center justify-center w-24 h-24">
                  {/* Círculo de Carga Exterior */}
                  <div className="absolute inset-0 border-4 border-neutral-800 border-t-indigo-500 rounded-full animate-spin"></div>
                  {/* Contenedor central para el icono cambiante */}
                  <div className="absolute bg-[#161616] w-12 h-12 rounded-2xl border border-neutral-800 flex items-center justify-center shadow-inner animate-fadeIn" key={pasoActual}>
                    {PASOS_CARGA[pasoActual].icono}
                  </div>
                </div>

                <div className="space-y-3 max-w-md">
                  {/* Texto descriptivo de la fase actual */}
                  <h3 className="text-lg font-bold text-neutral-200 min-h-[56px] flex items-center justify-center px-4 transition-all duration-300" key={`text-${pasoActual}`}>
                    {PASOS_CARGA[pasoActual].texto}
                  </h3>
                  <p className="text-xs text-neutral-500 tracking-widest uppercase font-mono animate-pulse">Sincronizando sistema...</p>
                </div>

                <p className="text-base text-neutral-400 max-w-lg leading-relaxed bg-neutral-900/60 p-5 border border-neutral-800 rounded-2xl">
                  Por favor, mantén esta ventana abierta. Nuestro sistema abrirá una ventana del navegador en segundo plano en el servidor para recopilar, ordenar y guardar los comentarios necesarios. Esto tomará solo un momento.
                </p>
              </div>
            )}

            {/* 3. PANTALLA FORMULARIO NORMAL */}
            {!exito && !cargando && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Agregar nuevo producto</h3>
                  <p className="text-base text-neutral-400">Es indispensable suministrar la dirección de internet para alimentar la base de conocimiento de tu asistente virtual.</p>
                </div>

                <form onSubmit={manejarEnvio} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold block">
                      Enlace o Link del Producto <span className="text-red-400 font-bold">* (Obligatorio)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://tienda.com/ejemplo-tu-producto"
                      className="w-full px-5 py-4 bg-neutral-950 text-neutral-200 rounded-xl border border-neutral-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 hover:border-neutral-700 outline-none transition text-base shadow-inner"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      <span className="text-indigo-400 font-semibold">Nota indispensable:</span> El link ingresado debe ser de acceso público y apuntar directamente a las opiniones o calificaciones de los clientes para habilitar la extracción de datos.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-950/20 text-red-400 text-sm rounded-xl border border-red-900/30 flex items-start gap-3 animate-fadeIn">
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-6 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={manejarCerrar}
                      className="px-6 py-3 text-sm font-semibold text-neutral-400 bg-neutral-900 hover:bg-neutral-800 hover:text-neutral-200 rounded-xl transition border border-neutral-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-7 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/20"
                    >
                      Comenzar Análisis Obligatorio
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}