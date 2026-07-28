import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  error: string;
  onCancelar: () => void;
  onSubmit: (url: string) => void;
}

export const VistaFormulario = ({ error, onCancelar, onSubmit }: Props) => {
  const [url, setUrl] = useState('');

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Agregar nuevo producto</h3>
        <p className="text-sm sm:text-base text-neutral-400">Es indispensable suministrar la dirección de internet para alimentar la base de conocimiento de tu asistente virtual.</p>
      </div>
      <form onSubmit={manejarEnvio} className="space-y-5 sm:space-y-6">
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold block">
            Enlace o Link del Producto <span className="text-red-400 font-bold">* (Obligatorio)</span>
          </label>
          <input
            type="url"
            placeholder="https://tienda.com/ejemplo-tu-producto"
            className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-neutral-950 text-neutral-200 rounded-xl border border-neutral-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition text-sm sm:text-base shadow-inner"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="p-4 bg-red-950/20 text-red-400 text-sm rounded-xl border border-red-900/30 flex items-start gap-3 animate-fadeIn">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-neutral-900">
          <button
            type="button"
            onClick={onCancelar}
            className="px-6 py-3 text-sm font-semibold text-neutral-400 bg-neutral-900 hover:bg-neutral-800 rounded-xl transition border border-neutral-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-7 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition"
          >
            Comenzar Análisis Obligatorio
          </button>
        </div>
      </form>
    </div>
  );
};