import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { usarAuth } from '../contextos/ContextoAuth';
import { apiAuth } from '../servicios/apiAuth';
import type { ErrorSesionAPI } from '../servicios/apiAuth';

// Mapea el código estructurado que manda el backend a un mensaje amigable.
// Si no viene código (ej. 401 de credenciales), cae al mensaje genérico.
function mensajeDeError(err: unknown): string {
  const error = err as Partial<ErrorSesionAPI>;

  if (error?.codigo === 'sesion_activa') {
    return 'Ya tienes una sesión activa en otro dispositivo o pestaña. Cierra sesión allí primero.';
  }
  if (error?.codigo === 'ip_bloqueada') {
    return 'Esta red ya tiene una cuenta con sesión activa. No se permite más de una cuenta por conexión.';
  }
  return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
}

export default function VistaLogin() {
  // 🔄 CAMBIO: Variables unificadas al inglés
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const { login } = usarAuth();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      // 🔄 CAMBIO: Enviamos el payload estandarizado
      const respuesta = await apiAuth.iniciarSesion({ email, password });
      
      // CORRECCIÓN: Pasamos el objeto completo, no solo el token
      login(respuesta); 
      
      navigate('/');
    } catch (err) {
      // 🔄 CAMBIO: mensaje específico según el código de error del backend
      // (sesión activa / IP bloqueada / credenciales inválidas)
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 select-none">
      <div className="max-w-md w-full bg-[#181818] rounded-2xl shadow-2xl border border-neutral-900 p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Lock size={22} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-200">Bienvenido al Sistema</h2>
          <p className="text-sm text-neutral-500">Ingresa tus credenciales para acceder al agente RAG</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/40 rounded-lg text-red-400 text-sm animate-in fade-in duration-200">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-400">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email} // 🔄 CAMBIO: Usamos el nuevo estado
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 bg-[#202020] border border-neutral-800 text-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-40 placeholder-neutral-600 text-sm"
                placeholder="usuario@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-400">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password} // 🔄 CAMBIO: Usamos el nuevo estado
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 bg-[#202020] border border-neutral-800 text-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-40 placeholder-neutral-600 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando || !email || !password} // 🔄 CAMBIO
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-6 shadow-md shadow-indigo-950/40"
          >
            {cargando ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-neutral-400">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate('/registro')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}