import { Activity, Clock, Zap, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiHerramientas } from '../../../servicios/apiHerramientas';

export const DiagnosticoView = ({ data }: { data: any }) => {
  const [telemetria, setTelemetria] = useState<any>(null);

  useEffect(() => {
    apiHerramientas.metricasUltima()
      .then(setTelemetria)
      .catch(() => setTelemetria(null));
  }, []);

  // 👇 Aquí metemos la función mágica para limpiar los decimales y pasar a segundos
  const formatearTiempo = (ms: any) => {
    const tiempoReal = Number(ms); 
    if (isNaN(tiempoReal)) return { valor: 0, unidad: 'ms' };
    if (tiempoReal >= 1000) {
      return { valor: Number((tiempoReal / 1000).toFixed(2)), unidad: 's' };
    }
    return { valor: Math.round(tiempoReal), unidad: 'ms' };
  };

  const mensaje = data.mensaje || '';
  const partes = mensaje
    .replace(/^\[DIAGNÓSTICO\]\s*/i, '')
    .split('.')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-[#121212] rounded-xl border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Activity className="text-indigo-400" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-200">Estado del Sistema</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Tiempo real</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-400">OPERATIVO</span>
        </div>
      </div>

      {/* MENSAJE LIMPIO */}
      <div className="space-y-2">
        {partes.map((parte: string, idx: number) => (
          <div key={idx} className="flex items-start gap-2 px-1">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
            <span className="text-sm text-neutral-300">{parte}</span>
          </div>
        ))}
      </div>

      {/* FOOTER: TELEMETRÍA */}
      <div className="border-t border-neutral-800 pt-4">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
          Última respuesta del modelo
        </p>

        {telemetria ? (
          <div className="grid grid-cols-3 gap-2">
            
            {/* 🚀 TTFT ACTUALIZADO */}
            <div className="bg-[#181818] p-3 rounded-lg border border-neutral-800 text-center">
              <Timer size={14} className="text-indigo-400 mx-auto mb-1" />
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">TTFT</span>
              <span className="text-base font-bold text-neutral-200">
                {formatearTiempo(telemetria.ttft_ms).valor}
              </span>
              <span className="text-[10px] text-neutral-500 ml-1">
                {formatearTiempo(telemetria.ttft_ms).unidad}
              </span>
            </div>

            {/* 🚀 LATENCIA ACTUALIZADA */}
            <div className="bg-[#181818] p-3 rounded-lg border border-neutral-800 text-center">
              <Clock size={14} className="text-indigo-400 mx-auto mb-1" />
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Latencia</span>
              <span className="text-base font-bold text-neutral-200">
                {formatearTiempo(telemetria.total_latency_ms).valor}
              </span>
              <span className="text-[10px] text-neutral-500 ml-1">
                {formatearTiempo(telemetria.total_latency_ms).unidad}
              </span>
            </div>

            {/* 🚀 VELOCIDAD CON SOLO 2 DECIMALES */}
            <div className="bg-[#181818] p-3 rounded-lg border border-neutral-800 text-center">
              <Zap size={14} className="text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Velocidad</span>
              <span className="text-base font-bold text-emerald-400">
                {Number(Number(telemetria.tokens_per_second).toFixed(2))}
              </span>
              <span className="text-[10px] text-neutral-500 ml-1">tok/s</span>
            </div>

          </div>
        ) : (
          <p className="text-xs text-neutral-600 italic text-center py-2">Sin métricas registradas aún.</p>
        )}
      </div>

    </div>
  );
};