import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { usarAuth } from '../contextos/ContextoAuth';
import { apiAuth } from '../servicios/apiAuth';

export default function VistaLogin() {
  // Estados para capturar los inputs (Componente Controlado)
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  
  // Estados para la experiencia de usuario (UX)
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Hooks de enrutamiento y estado global
  const navigate = useNavigate();
  const { login } = usarAuth();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      // 1. Intentamos hacer login contra FastAPI
      const respuesta = await apiAuth.iniciarSesion({ correo, contrasena });
      
      // 2. Si es exitoso, actualizamos el contexto global
      login(respuesta.access_token);
      
      // 3. Redirigimos al panel principal (Dashboard)
      navigate('/');
    } catch (err) {
      // Si FastAPI nos patea (401), mostramos el error
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-6">
        
        {/* Cabecera del Formulario */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-2">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Bienvenido al Sistema</h2>
          <p className="text-sm text-slate-500">Ingresa tus credenciales para acceder al agente RAG</p>
        </div>

        {/* Mensaje de Error Condicional */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="space-y-4">
          
          {/* Input de Correo */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="text" // Dependiendo de tu backend, podría ser tipo 'email'
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="usuario@empresa.com"
              />
            </div>
          </div>

          {/* Input de Contraseña */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={cargando || !correo || !contrasena}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-sm"
          >
            {cargando ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}