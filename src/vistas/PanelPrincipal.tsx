import { useEffect, useState } from 'react';
import { apiHerramientas } from '../../src/servicios/apiHerramientas';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from 'lucide-react';

interface MetricasResumen {
  producto: string; // 🚨 AGREGADO: Nombre del producto actual
  promedio_estrellas: string;
  distribucion_sentimientos: string;
  reseña_destacada: string;
}

// Parsers para extraer los números del texto
const extraerPromedio = (texto: string): string => {
  const match = texto.match(/(\d+\.\d+)\s+estrellas/);
  return match ? match[1] : '—';
};

const extraerTotal = (texto: string): string => {
  const match = texto.match(/total de (\d+)/);
  return match ? match[1] : '—';
};

const extraerSentimientos = (texto: string) => {
  const pos = texto.match(/(\d+)\s+Opiniones Positivas/);
  const neg = texto.match(/(\d+)\s+Opiniones Negativas/);
  return {
    positivas: pos ? parseInt(pos[1]) : 0,
    negativas: neg ? parseInt(neg[1]) : 0,
  };
};

const extraerReseña = (texto: string) => {
  const autor = texto.match(/AUTOR:\s*(.+)/)?.[1]?.trim() ?? '—';
  const estrellas = texto.match(/ESTRELLAS:\s*(\d+)/)?.[1] ?? '—';
  const textoMatch = texto.match(/TEXTO:\s*([\s\S]+)/)?.[1]?.trim() ?? '';
  return { autor, estrellas, texto: textoMatch };
};

export default function PanelPrincipal() {
  const [datos, setDatos] = useState<MetricasResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [verCompleta, setVerCompleta] = useState(false);

  useEffect(() => {
    apiHerramientas.metricasResumen()
      .then((res: any) => setDatos(res))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-neutral-700 border-t-indigo-400 rounded-full animate-spin" />
    </div>
  );

  if (error || !datos) return (
    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
      No se pudo cargar el resumen. Verifica que hay un producto analizado.
    </div>
  );

  const promedio = extraerPromedio(datos.promedio_estrellas);
  const total = extraerTotal(datos.promedio_estrellas);
  const { positivas, negativas } = extraerSentimientos(datos.distribucion_sentimientos);
  const { autor, estrellas: estrellasReseña, texto: textoReseña } = extraerReseña(datos.reseña_destacada);
  const pctPositivo = positivas + negativas > 0 ? Math.round((positivas / (positivas + negativas)) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* TÍTULO Y PRODUCTO DINÁMICO */}
      <div className="flex flex-col gap-1.5 border-b border-neutral-800/60 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-neutral-200">Panel Principal</h1>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-medium uppercase tracking-wider">
            <TrendingUp size={11} />
            En Tiempo Real
          </div>
        </div>
        <p className="text-xs text-neutral-400 leading-normal max-w-4xl">
          Análisis activo: <span className="text-indigo-400 font-medium">{datos.producto}</span>
        </p>
      </div>

      {/* TARJETAS SUPERIORES */}
      <div className="grid grid-cols-3 gap-4">

        {/* Promedio estrellas */}
        <div className="bg-[#181818] border border-neutral-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-neutral-500">
            <Star size={15} className="text-yellow-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Calificación</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-neutral-100">{promedio}</span>
            <span className="text-neutral-500 text-sm ml-1">/ 5</span>
          </div>
          <span className="text-xs text-neutral-500">{total} opiniones en total</span>
        </div>

        {/* Positivas */}
        <div className="bg-[#181818] border border-neutral-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-neutral-500">
            <ThumbsUp size={15} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Positivas</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-emerald-400">{positivas}</span>
            <span className="text-neutral-500 text-sm ml-1">reseñas</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pctPositivo}%` }} />
          </div>
        </div>

        {/* Negativas */}
        <div className="bg-[#181818] border border-neutral-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-neutral-500">
            <ThumbsDown size={15} className="text-red-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Negativas</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-neutral-100">{negativas}</span>
            <span className="text-neutral-500 text-sm ml-1">reseñas</span>
          </div>
          <span className="text-xs text-neutral-500">
            {negativas === 0 ? 'Sin opiniones negativas' : `${100 - pctPositivo}% del total`}
          </span>
        </div>

      </div>

      {/* RESEÑA DESTACADA */}
      <div className="bg-[#181818] border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-neutral-500">
          <MessageSquare size={15} className="text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Opinión más crítica detectada</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
              {autor.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-neutral-300">{autor}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                className={i < parseInt(estrellasReseña) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-700'}
              />
            ))}
          </div>
        </div>

        <p className={`text-sm text-neutral-400 leading-relaxed ${verCompleta ? '' : 'line-clamp-4'}`}>
          {textoReseña}
        </p>

        <button
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          onClick={() => setVerCompleta(!verCompleta)}
        >
          {verCompleta ? 'Mostrar menos ↑' : 'Ver reseña completa →'}
        </button>
      </div>

    </div>
  );
}