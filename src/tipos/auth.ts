export interface CredencialesLogin {
  correo: string;
  contrasena: string;
}

export interface RespuestaToken {
  access_token: string;
  token_type: string;
}

export interface UsuarioActual {
  id: string;
  correo: string;
}