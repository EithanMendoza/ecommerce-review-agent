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
  // 🚀 ACTUALIZADO: Rutas corregidas hacia /api/metricas/
  diagnostico: () => fetchHerramienta('/api/metricas/diagnostico', { method: 'GET' }),
  
  // 🚀 Mantenemos los comentados en el backend, apuntando a las rutas correctas para el futuro
  reportes: () => fetchHerramienta('/api/metricas/reportes', { method: 'GET' }),
  limpiarCache: () => fetchHerramienta('/api/metricas/limpiar-cache', { method: 'POST' }),
  
  // 🚀 NUEVO: Requieren el ASIN como parámetro en la URL
  exportarCsv: (asin: string) => fetchHerramienta(`/api/metricas/exportar-csv/${asin}`, { method: 'POST' }),
  metricasResumen: (asin: string) => fetchHerramienta(`/api/metricas/resumen/${asin}`, { method: 'GET' }),
  
  // 🚀 ACTUALIZADO: Ruta corregida
  metricasUltima: () => fetchHerramienta('/api/metricas/ultima', { method: 'GET' }),

  /**
   * Obtiene el nombre del producto que está actualmente analizado.
   * Útil para pintar cabeceras o estados rápidos en los paneles.
   */
  obtenerProductoActual: () => fetchHerramienta('/api/dashboard/producto-actual', { method: 'GET' }),

  /**
   * Elimina de golpe todo el historial de conversaciones de un perfil específico.
   * @param usuarioId El identificador único del usuario en sesión (ej: 'yahirpuc')
   */
  purgarHistorialPerfil: (usuarioId: string) =>
    fetchHerramienta(`/api/usuarios/${usuarioId}/historial/purgar`, { method: 'DELETE' }),
};