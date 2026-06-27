import React, { useState } from 'react';
import { apiLocal } from '../../servicios/apiLocal';

interface ModalCargarProductoProps {
  estaAbierto: boolean;
  alCerrar: () => void;
  alCompletar: () => void;
}

export default function ModalCargarProducto({ estaAbierto, alCerrar, alCompletar }: ModalCargarProductoProps) {
  const [url, setUrl] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  if (!estaAbierto) return null;

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Por favor ingresa una URL válida.');
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
      setError(err.message || 'Error desconocido al analizar el producto.');
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="bg-[#1e1e1e] border border-neutral-800 w-full max-w-md rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6 relative">

        {/* PANTALLA DE ÉXITO */}
        {exito ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-200">¡Producto analizado!</h3>
            <p className="text-sm text-neutral-400 px-4">
              Las reseñas fueron extraídas e insertadas correctamente. El agente ya está listo para responder preguntas.
            </p>
            <button
              onClick={manejarCerrar}
              className="mt-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all"
            >
              Entendido
            </button>
          </div>

        ) : cargando ? (
          /* PANTALLA DE CARGA */
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-12 h-12 border-4 border-neutral-800 border-t-indigo-500 rounded-full animate-spin"></div>
            <h3 className="text-lg font-semibold text-neutral-200 animate-pulse">Analizando producto...</h3>
            <p className="text-sm text-neutral-400 text-center px-4">
              Esto puede tomar un par de minutos. Estamos extrayendo, limpiando e insertando las reseñas. Por favor, no cierres esta ventana.
            </p>
          </div>

        ) : (
          /* PANTALLA DE INPUT NORMAL */
          <>
            <h2 className="text-xl font-bold text-neutral-200 mb-2">Analizar nuevo producto</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Pega la URL del producto que deseas analizar. <br />
              <span className="font-semibold text-indigo-400">Importante:</span> Asegúrate de que el enlace dirija a la sección de reseñas para que la extracción funcione correctamente.
            </p>

            <form onSubmit={manejarEnvio}>
              <div className="mb-4">
                <input
                  type="url"
                  placeholder="https://ejemplo.com/producto/resenias"
                  className="w-full px-4 py-3 bg-[#121212] text-neutral-200 rounded-lg border border-neutral-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-neutral-500 outline-none transition-all placeholder:text-neutral-600 shadow-inner shadow-black/50"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-950/30 text-red-400 text-sm rounded-lg border border-red-900/50 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={manejarCerrar}
                  className="px-5 py-2.5 text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded-lg transition-colors border border-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] rounded-lg transition-all"
                >
                  Comenzar Análisis
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}