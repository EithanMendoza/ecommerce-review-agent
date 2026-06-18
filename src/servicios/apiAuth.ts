import type { CredencialesLogin, RespuestaToken } from '../tipos/auth';

const URL_BASE = 'http://localhost:8000';

export const apiAuth = {
  iniciarSesion: async (credenciales: CredencialesLogin): Promise<RespuestaToken> => {
    // FastAPI usualmente usa form-data para el login con OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', credenciales.correo);
    formData.append('password', credenciales.contrasena);

    const respuesta = await fetch(`${URL_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!respuesta.ok) {
      throw new Error('Credenciales inválidas');
    }

    const datos: RespuestaToken = await respuesta.json();
    // Guardamos el token de forma aislada
    localStorage.setItem('token_rag', datos.access_token);
    return datos;
  },

  cerrarSesion: () => {
    localStorage.removeItem('token_rag');
  },

  obtenerToken: () => {
    return localStorage.getItem('token_rag');
  }
};