import { useEffect, useState } from 'react';
import { apiHerramientas } from '../servicios/apiHerramientas';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Package, ChevronDown } from 'lucide-react';
import type { ProductoAnalizado } from '../tipos/contratos';

interface MetricasResumen {
  producto: string;
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
  const [cargandoMetricas, setCargandoMetricas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verCompleta, setVerCompleta] = useState(false);

  // 🆕 Estados para gestionar el selector de productos
  const [productos, setProductos] = useState<ProductoAnalizado[]>([]);
  const [asinSeleccionado, setAsinSeleccionado] = useState<string>('');

  // 1. Cargar la lista inicial de productos del usuario
  useEffect(() => {
    const cargarProductosEInicial = async () => {
      try {
        setCargando(true);
        setError(null);

        // Obtenemos todos los productos asociados al perfil actual
        const resProductos = await apiHerramientas.listarProductos();
        const lista: ProductoAnalizado[] = Array.isArray(resProductos)
          ? resProductos
          : (resProductos.productos || []);

        setProductos(lista);

        if (lista.length === 0) {
          setError("Aún no hay productos analizados. Carga un enlace para empezar.");
          setCargando(false);
          return;
        }

        // Si tenemos un ASIN por defecto en BD usamos ese, si no tomamos el primero
        const resUltimo = await apiHerramientas.obtenerUltimoAsin().catch(() => null);
        const asinInicial = resUltimo?.asin || lista[0].asin;

        setAsinSeleccionado(asinInicial);

        // Cargamos las métricas del producto seleccionado
        const metricas = await apiHerramientas.metricasResumen(asinInicial);
        setDatos(metricas);

      } catch (err: any) {
        console.error("Error al cargar el panel principal:", err);
        setError("Aún no hay productos analizados o no se pudo cargar la información.");
      } finally {
        setCargando(false);
      }
    };

    cargarProductosEInicial();
  }, []);

  // 2. Función para cambiar de producto desde el Selector
  const cambiarProducto = async (nuevoAsin: string) => {
    if (!nuevoAsin || nuevoAsin === asinSeleccionado) return;

    // 1. Iniciamos el estado de carga y borramos datos previos temporalmente
    setAsinSeleccionado(nuevoAsin);
    setCargandoMetricas(true);
    setVerCompleta(false);
    
    // Opcional: setDatos(null) para obligar a que se vea el cambio visualmente
    
    try {
      // 2. Solicitamos las nuevas métricas al backend pasando el ASIN
      const nuevasMetricas = await apiHerramientas.metricasResumen(nuevoAsin);
      
      // 3. Verificamos qué está llegando en consola
      console.log("Nuevas métricas recibidas para", nuevoAsin, ":", nuevasMetricas);
      
      // 4. Actualizamos el estado con los nuevos datos
      setDatos(nuevasMetricas);
    } catch (err) {
      console.error("Error al cambiar las métricas del producto:", err);
      // Aquí podrías mostrar un toast o mensaje de error al usuario
    } finally {
      // 5. Quitamos el estado de carga
      setCargandoMetricas(false);
    }
  };

  if (cargando) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-neutral-800 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-sm text-neutral-400 font-medium">Calculando métricas del sistema...</span>
      </div>
    </div>
  );

  if (error || !datos) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-neutral-500 text-sm bg-[#181818] border border-neutral-800 rounded-xl p-8 max-w-md mx-auto text-center space-y-3">
        <Package className="mx-auto text-neutral-600" size={32} />
        <p>{error || 'No se pudo cargar el resumen. Verifica que hay un producto analizado.'}</p>
      </div>
    </div>
  );

  const promedio = extraerPromedio(datos.promedio_estrellas);
  const total = extraerTotal(datos.promedio_estrellas);
  const { positivas, negativas } = extraerSentimientos(datos.distribucion_sentimientos);
  const { autor, estrellas: estrellasReseña, texto: textoReseña } = extraerReseña(datos.reseña_destacada);
  const pctPositivo = positivas + negativas > 0 ? Math.round((positivas / (positivas + negativas)) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* CABECERA CON TÍTULO Y SELECTOR DE PRODUCTOS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/60 pb-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-200">Panel Principal</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-medium uppercase tracking-wider">
              <TrendingUp size={11} />
              En Tiempo Real
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-normal">
            Análisis activo: <span className="text-indigo-400 font-medium">{datos.producto}</span>
          </p>
        </div>

        {/* 🆕 SELECTOR DESPLEGABLE DE PRODUCTO */}
        {productos.length > 0 && (
          <div className="relative min-w-[280px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-1">
              <Package size={12} className="text-indigo-400" /> Seleccionar Producto
            </label>
            <div className="relative">
              <select
                value={asinSeleccionado}
                onChange={(e) => cambiarProducto(e.target.value)}
                disabled={cargandoMetricas}
                className="w-full bg-[#181818] border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none focus:border-indigo-500 hover:border-neutral-700 transition cursor-pointer disabled:opacity-50"
              >
                {productos.map((prod) => (
                  <option key={prod.asin} value={prod.asin} className="bg-[#181818] text-neutral-200">
                    {prod.nombre ? `${prod.nombre.substring(0, 35)}...` : prod.asin}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* CONTENIDO DE MÉTRICAS (Muestra animación si se cambia de producto) */}
      <div className={`space-y-6 transition-opacity duration-300 ${cargandoMetricas ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>

        {/* TARJETAS SUPERIORES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Promedio estrellas */}
          <div className="bg-[#181818] border border-neutral-800 rounded-xl p-5 flex flex-col gap-3 transition-all hover:border-neutral-700">
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
          <div className="bg-[#181818] border border-neutral-800 rounded-xl p-5 flex flex-col gap-3 transition-all hover:border-neutral-700">
            <div className="flex items-center gap-2 text-neutral-500">
              <ThumbsUp size={15} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Positivas</span>
            </div>
            <div>
              <span className="text-4xl font-bold text-emerald-400">{positivas}</span>
              <span className="text-neutral-500 text-sm ml-1">reseñas</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pctPositivo}%` }} />
            </div>
          </div>

          {/* Negativas */}
          <div className="bg-[#181818] border border-neutral-800 rounded-xl p-5 flex flex-col gap-3 transition-all hover:border-neutral-700">
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
        <div className="bg-[#181818] border border-neutral-800 rounded-xl p-5 space-y-4 transition-all hover:border-neutral-700">
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

          {textoReseña.length > 200 && (
            <button
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              onClick={() => setVerCompleta(!verCompleta)}
            >
              {verCompleta ? 'Mostrar menos ↑' : 'Ver reseña completa →'}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}