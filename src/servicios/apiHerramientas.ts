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
  diagnostico: () => fetchHerramienta('/api/herramientas/diagnostico', { method: 'GET' }),
  reportes: () => fetchHerramienta('/api/herramientas/reportes', { method: 'GET' }),
  limpiarCache: () => fetchHerramienta('/api/herramientas/limpiar-cache', { method: 'POST' }),
  exportarCsv: () => fetchHerramienta('/api/herramientas/exportar-csv', { method: 'POST' }),
  metricasResumen: () => fetchHerramienta('/api/herramientas/metricas/resumen', { method: 'GET' }),
};