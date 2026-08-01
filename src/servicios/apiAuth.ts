import type {
  CredencialesLogin,
  DatosRegistro,
  RespuestaToken,
  RespuestaRegistro
} from '../tipos/auth';

const URL_BASE = import.meta.env.VITE_API_URL || '';

export const apiAuth = {
  iniciarSesion: async (credenciales: CredencialesLogin): Promise<RespuestaToken> => {
    const formData = new URLSearchParams();
    formData.append('username', credenciales.email);
    formData.append('password', credenciales.password);

    const respuesta = await fetch(`${URL_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData,
    });

    if (!respuesta.ok) {
      throw new Error('Credenciales inválidas');
    }

    const datos: RespuestaToken = await respuesta.json();
    

    localStorage.removeItem('token_rag');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('user_last_name');
    localStorage.removeItem('user_email');

    localStorage.setItem('token_rag', datos.access_token);
    localStorage.setItem('user_first_name', datos.first_name ?? '');
    localStorage.setItem('user_last_name', datos.last_name ?? '');
    localStorage.setItem('user_email', datos.email ?? '');

    return datos;
  },

  registrarUsuario: async (datosRegistro: DatosRegistro): Promise<RespuestaRegistro> => {
    const respuesta = await fetch(`${URL_BASE}/api/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        first_name: datosRegistro.firstName,
        last_name: datosRegistro.lastName,
        email: datosRegistro.email,
        password: datosRegistro.password,
        captcha_token: datosRegistro.captchaToken
      }),
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al registrar el usuario. El correo podría ya estar en uso.');
    }

    return respuesta.json();
  },

  cerrarSesion: async (): Promise<void> => {
    const token = localStorage.getItem('token_rag');

    if (token) {
      try {
        await fetch(`${URL_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
      } catch (error) {
        console.error('[LOGOUT] Falló la revocación del token en el servidor', error);
      }
    }

    localStorage.removeItem('token_rag');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('user_last_name');
    localStorage.removeItem('user_email');
  },

  obtenerToken: () => {
    return localStorage.getItem('token_rag');
  }
};