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

export interface MensajeHistorial {
  id: string;
  sesion_id: string;
  rol: 'user' | 'assistant';
  contenido: string;
  fecha_creacion?: string;
}