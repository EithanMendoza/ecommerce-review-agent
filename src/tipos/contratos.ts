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
  // Agrega otros campos que devuelva tu DB, por ejemplo:
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

// 🆕 Respuesta completa de GET /sesiones/:id/mensajes (historial.py ya manda asin y titulo,
// los necesitamos en el frontend para saber sobre qué producto va el chat actual)
export interface RespuestaHistorialChat {
  sesion_id: string;
  asin: string;
  titulo?: string;
  mensajes: MensajeHistorial[];
}