import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { usarAuth } from '../contextos/ContextoAuth';
import { apiAuth } from '../servicios/apiAuth';

export default function VistaLogin() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const { login } = usarAuth();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const respuesta = await apiAuth.iniciarSesion({ correo, contrasena });
      login(respuesta.access_token);
      navigate('/');
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    // 🎨 CONTENEDOR DARK COMPLETO DE PANTALLA
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 select-none">

      {/* TARJETA DEL FORMULARIO EN MODO OSCURO */}
      <div className="max-w-md w-full bg-[#181818] rounded-2xl shadow-2xl border border-neutral-900 p-8 space-y-6">

        {/* Cabecera del Formulario */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Lock size={22} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-200">Bienvenido al Sistema</h2>
          <p className="text-sm text-neutral-500">Ingresa tus credenciales para acceder al agente RAG</p>
        </div>

        {/* Mensaje de Error Condicional Oscuro */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/40 rounded-lg text-red-400 text-sm animate-in fade-in duration-200">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="space-y-4">

          {/* Input de Correo */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-400">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Mail size={18} />
              </div>
              <input
                type="text"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 bg-[#202020] border border-neutral-800 text-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-40 placeholder-neutral-600 text-sm"
                placeholder="usuario@empresa.com"
              />
            </div>
          </div>

          {/* Input de Contraseña */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-400">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 bg-[#202020] border border-neutral-800 text-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-40 placeholder-neutral-600 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* 🚀 BOTÓN DE ENTRADA CON ACENTO AZUL DE COBALTO */}
          <button
            type="submit"
            disabled={cargando || !correo || !contrasena}
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

      </div>
    </div>
  );
}