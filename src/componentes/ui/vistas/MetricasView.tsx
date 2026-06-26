interface MetricasViewProps {
  data: {
    prompt: string;
    ttft_ms: number;
    total_latency_ms: number;
    tokens_per_second: number;
  };
}

export function MetricasView({ data }: MetricasViewProps) {
  return (
    <div className="space-y-3">
      <div className="bg-[#181818] p-4 rounded-lg border border-neutral-800">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Prompt</span>
        <p className="text-sm text-neutral-300 mt-1 italic">"{data.prompt}"</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#202020] p-3 rounded-lg border border-neutral-800 text-center">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">TTFT</span>
          <span className="text-lg font-bold text-neutral-200">{data.ttft_ms}</span>
          <span className="text-xs text-neutral-500 block">ms</span>
        </div>
        <div className="bg-[#202020] p-3 rounded-lg border border-neutral-800 text-center">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Latencia</span>
          <span className="text-lg font-bold text-neutral-200">{data.total_latency_ms}</span>
          <span className="text-xs text-neutral-500 block">ms</span>
        </div>
        <div className="bg-[#202020] p-3 rounded-lg border border-neutral-800 text-center">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Velocidad</span>
          <span className="text-lg font-bold text-emerald-400">{data.tokens_per_second}</span>
          <span className="text-xs text-neutral-500 block">tok/s</span>
        </div>
      </div>
    </div>
  );
}