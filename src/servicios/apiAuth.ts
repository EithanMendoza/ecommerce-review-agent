import type {
  CredencialesLogin,
  DatosRegistro,
  RespuestaRegistro
} from '../tipos/auth';

const URL_BASE = import.meta.env.VITE_API_URL || '';



// La respuesta de /login ya no trae el JWT (viaja en la cookie HttpOnly),
// solo trae los datos del usuario para pintar la UI.
export interface RespuestaSesion {
  id?: string;
  token_type?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

// NUEVO: error estructurado para distinguir credenciales inválidas de los
// bloqueos por sesión única / IP compartida. El backend manda estos códigos
// en el `detail` cuando aplica (ver modulos/api/routes/auth.py).
export interface ErrorSesionAPI {
  status: number;
  codigo?: 'sesion_activa' | 'ip_bloqueada';
  mensaje: string;
}

async function construirErrorSesion(respuesta: Response, mensajePorDefecto: string): Promise<ErrorSesionAPI> {
  const cuerpo = await respuesta.json().catch(() => ({}));
  const detalle = cuerpo?.detail;

  if (detalle && typeof detalle === 'object') {
    return {
      status: respuesta.status,
      codigo: detalle.codigo,
      mensaje: detalle.mensaje || mensajePorDefecto,
    };
  }

  return {
    status: respuesta.status,
    mensaje: typeof detalle === 'string' ? detalle : mensajePorDefecto,
  };
}

export const apiAuth = {
  iniciarSesion: async (credenciales: CredencialesLogin): Promise<RespuestaSesion> => {
    const respuesta = await fetch(`${URL_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      // 🍪 Imprescindible: sin esto el navegador no guarda ni reenvía la cookie HttpOnly.
      credentials: 'include',
      body: JSON.stringify({
        email: credenciales.email,
        password: credenciales.password
      }),
    });

    if (!respuesta.ok) {
      // 🔄 CAMBIO: antes se lanzaba un Error genérico para cualquier fallo.
      // Ahora propagamos status + código para que VistaLogin.tsx pueda
      // mostrar un mensaje específico (sesión activa / IP bloqueada / credenciales).
      throw await construirErrorSesion(respuesta, 'Credenciales inválidas');
    }

    const datos: RespuestaSesion = await respuesta.json();

    // Ya NO guardamos ningún token en localStorage: el JWT vive solo en la
    // cookie HttpOnly y JS no puede (ni debe) leerlo. Si necesitas mostrar
    // el nombre del usuario en la UI, eso se maneja en memoria (contexto de
    // React), no en localStorage.
    return datos;
  },

  registrarUsuario: async (datosRegistro: DatosRegistro): Promise<RespuestaRegistro> => {
    const respuesta = await fetch(`${URL_BASE}/api/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      credentials: 'include',
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
    try {
      await fetch(`${URL_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // ✅ Solo necesario en POST
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include',
        body: JSON.stringify({}) // ✅ Falso body para pasar el firewall
      });
    } catch (error) {
      console.error('[LOGOUT] Falló la revocación del token en el servidor', error);
    }
  },

  // Llama a un endpoint protegido cualquiera (ej. /api/auth/me si lo creas)
  // para saber si la cookie sigue siendo válida. Como el JWT es HttpOnly,
  // este es el único modo de comprobar sesión activa al recargar la página.
  verificarSesion: async (): Promise<RespuestaSesion | null> => {
    const respuesta = await fetch(`${URL_BASE}/api/auth/me`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      credentials: 'include',
    });

    if (!respuesta.ok) {
      return null;
    }

    return respuesta.json();
  }
};