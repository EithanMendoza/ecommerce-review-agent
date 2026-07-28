import type {
  CredencialesLogin,
  DatosRegistro,
  RespuestaToken,
  RespuestaRegistro
} from '../tipos/auth';

const URL_BASE = import.meta.env.VITE_API_URL || '';

export const apiAuth = {
  iniciarSesion: async (credenciales: CredencialesLogin): Promise<RespuestaToken> => {
    // FastAPI (OAuth2PasswordRequestForm) exige las llaves 'username' y 'password'
    const formData = new URLSearchParams();
    formData.append('username', credenciales.email); 
    formData.append('password', credenciales.password);

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

  registrarUsuario: async (datosRegistro: DatosRegistro): Promise<RespuestaRegistro> => {
    const respuesta = await fetch(`${URL_BASE}/api/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Unificamos el payload al inglés para hacer match con el login
      body: JSON.stringify({
        first_name: datosRegistro.firstName,
        last_name: datosRegistro.lastName,
        email: datosRegistro.email,
        password: datosRegistro.password,
        captcha_token: datosRegistro.captchaToken
      }),
    });

    if (!respuesta.ok) {
      // Intentamos extraer el mensaje de error del backend (FastAPI envía {"detail": "..."})
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al registrar el usuario. El correo podría ya estar en uso.');
    }

    return respuesta.json();
  },

  cerrarSesion: () => {
    localStorage.removeItem('token_rag');
  },

  obtenerToken: () => {
    return localStorage.getItem('token_rag');
  }
};