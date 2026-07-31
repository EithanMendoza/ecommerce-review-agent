// src/tipos/contratos.ts

export interface MetadatosResena {
  producto: string;
  calificacion: number;
  fecha: string;
  [clave: string]: string | number; // Para cualquier otro metadato extra
}

export interface ResenaRecuperada {
  id: string;
  texto: string;
  similitud: number; // El score que nos devuelve ChromaDB
  metadatos: MetadatosResena;
}

export interface Mensaje {
  id: string;
  rol: 'usuario' | 'agente';
  contenido: string;
  fuentesRecuperadas?: ResenaRecuperada[]; // El contexto RAG que usó Ollama
}

export interface SesionChat {
  id: string;
  usuario_id: string;
  titulo?: string;
  fecha_creacion?: string;
}

// 🆕 Producto ya analizado (tabla `productos`), independiente de si tiene o no un chat activo
export interface ProductoAnalizado {
  asin: string;
  nombre: string;
}

export interface MensajeHistorial {
  id: string;
  sesion_id: string;
  rol: 'user' | 'assistant';
  contenido: string;
  fecha_creacion?: string;
}

// 🆕 Respuesta completa de GET /sesiones/:id/mensajes
export interface RespuestaHistorialChat {
  sesion_id: string;
  asin: string;
  titulo?: string;
  mensajes: MensajeHistorial[];
}

// 🚀 CONTRATOS AÑADIDOS PARA EL CONTROL DE SCRAPING Y ERRORES CONTROLADOS

export interface RespuestaCargarProducto {
  status: 'listo' | 'procesando' | 'error';
  asin: string;
  mensaje?: string; // 👈 Feedback directo desde el backend
}

export interface RespuestaEstadoScraping {
  estado: 'procesando' | 'completado' | 'error' | 'error_sin_resenas' | 'no_encontrado';
  asin: string;
  mensaje?: string; // 👈 Detalle del proceso actual (ej: "Extrayendo opiniones...")
  sesion_id?: string;
}