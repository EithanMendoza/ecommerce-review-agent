import { apiAuth } from './apiAuth';

const URL_BASE = 'http://localhost:8000';

// Función auxiliar para no repetir la inyección del token
const fetchHerramienta = async (endpoint: string, opciones: RequestInit = {}) => {
  const token = apiAuth.obtenerToken();
  const respuesta = await fetch(`${URL_BASE}${endpoint}`, {
    ...opciones,
    headers: {
      ...opciones.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      apiAuth.cerrarSesion();
      window.location.href = '/login';
      throw new Error('Sesión expirada.');
    }
    throw new Error(`Error en la herramienta: ${endpoint}`);
  }

  // Si es un archivo CSV, devolvemos el Blob para descargarlo
  const contentType = respuesta.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return respuesta.blob();
  }

  // Si no, asumimos que es JSON
  return respuesta.json();
};

export const apiHerramientas = {
  // 🚀 Diagnósticos y estados de auditoría
  diagnostico: () => fetchHerramienta('/api/metricas/diagnostico', { method: 'GET' }),
  obtenerUltimoAsin: () => fetchHerramienta('/api/metricas/ultimo-asin', { method: 'GET' }),
  metricasUltima: () => fetchHerramienta('/api/metricas/ultima', { method: 'GET' }),
  reportes: () => fetchHerramienta('/api/metricas/reportes', { method: 'GET' }),

  // 🧹 LIMPIEZA DE PERFIL: Ejecuta el vaciado en SQLite y ChromaDB de forma segura
  limpiarCache: () => fetchHerramienta('/api/metricas/limpiar-cache', { method: 'POST' }),

  // 📊 Métricas y exportaciones específicas por ASIN
  exportarCsv: (asin: string) => fetchHerramienta(`/api/metricas/exportar-csv/${asin}`, { method: 'POST' }),
  metricasResumen: (asin: string) => fetchHerramienta(`/api/metricas/resumen/${asin}`, { method: 'GET' }),

  // 🛍️ Información de contexto sobre el Producto actual
  obtenerProductoActual: () => fetchHerramienta('/api/dashboard/producto-actual', { method: 'GET' }),

  // 📦 PRODUCTOS Y SESIONES AUTENTICADAS (Agregados para resolver "Chat nuevo")
  listarProductos: () => fetchHerramienta('/api/productos', { method: 'GET' }),

  // 🟢 CORRECCIÓN CLAVE: Ahora llamamos al endpoint de sesiones dedicado que SÍ genera el UUID
  crearSesion: (asin: string) =>
    fetchHerramienta('/api/sesiones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin })
    }).then(res => ({ id: res.id || res.sesion_id })),

  iniciarScraping: (urlOAsin: string) =>
    fetchHerramienta('/api/scraper/iniciar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url_o_asin: urlOAsin, marketplace: 'com.mx' })
    }),

  /**
   * Elimina de golpe todo el historial de conversaciones de un perfil específico.
   * @param usuarioId El identificador único del usuario en sesión
   */
  purgarHistorialPerfil: (usuarioId: string) =>
    fetchHerramienta(`/api/usuarios/${usuarioId}/historial/purgar`, { method: 'DELETE' }),
};