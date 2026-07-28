export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  captchaToken: string; // 🚀 NUEVO: Token de validación de Turnstile
}

export interface RespuestaToken {
  access_token: string;
  token_type: string;
}

export interface RespuestaRegistro {
  mensaje: string;
  id: string; // O number, según lo que devuelva tu SQLite/PostgreSQL
}

export interface UsuarioActual {
  id: string;
  email: string;
}