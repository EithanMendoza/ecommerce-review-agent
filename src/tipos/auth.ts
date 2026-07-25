export interface CredencialesLogin {
  correo: string;
  contrasena: string;
}

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
}

export interface RespuestaToken {
  access_token: string;
  token_type: string;
}

export interface RespuestaRegistro {
  mensaje: string;
  id: string; // O number, según lo que devuelva tu SQLite
}

export interface UsuarioActual {
  id: string;
  correo: string;
}