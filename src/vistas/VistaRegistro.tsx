import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { apiAuth } from '../servicios/apiAuth';

export default function VistaRegistro() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const turnstileRef = useRef<TurnstileInstance>(null);
  const navigate = useNavigate();

  // Leemos la Site Key desde el archivo .env de Vite
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    // Doble validación por seguridad
    if (!captchaToken) {
      setError('Por favor, completa la verificación de seguridad.');
      return;
    }

    setError(null);
    setMensajeExito(null);
    setCargando(true);

    try {
      await apiAuth.registrarUsuario({
        firstName,
        lastName,
        email,
        password,
        captchaToken // Se envía el token generado al backend
      });

      setMensajeExito('Usuario creado exitosamente. Ya puedes iniciar sesión.');
      setPassword('');

      setTimeout(() => navigate('/login'), 2000);

    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta.');
      // Si falla el registro, reiniciamos el CAPTCHA
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 select-none">
      <div className="max-w-md w-full bg-[#181818] rounded-2xl shadow-2xl border border-neutral-900 p-8 space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <UserPlus size={22} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-200">Crear Cuenta</h2>
          <p className="text-sm text-neutral-500">Registra tus datos para acceder al sistema</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/40 rounded-lg text-red-400 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        {mensajeExito && (
          <div className="flex items-start gap-2 p-3 bg-green-950/30 border border-green-900/40 rounded-lg text-green-400 text-sm">
            <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{mensajeExito}</p>
          </div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-4">

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-400">Nombre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 bg-[#202020] border border-neutral-800 text-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-400">Apellido</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 bg-[#202020] border border-neutral-800 text-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-400">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 bg-[#202020] border border-neutral-800 text-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2 bg-[#202020] border border-neutral-800 text-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* WIDGET DE CLOUDFLARE TURNSTILE */}
          <div className="flex justify-center py-2">
            {siteKey ? (
              <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setError('Error al cargar la verificación de seguridad.')}
                onExpire={() => setCaptchaToken(null)}
                options={{
                  theme: 'dark',
                  size: 'normal'
                }}
              />
            ) : (
              <div className="text-red-400 text-xs text-center">Falta la clave VITE_TURNSTILE_SITE_KEY en el .env</div>
            )}
          </div>

          <button
            type="submit"
            // El botón se bloquea hasta que el captcha se resuelva correctamente
            disabled={cargando || !firstName || !lastName || !email || !password || !captchaToken}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all disabled:opacity-40 mt-6 shadow-md shadow-indigo-950/40"
          >
            {cargando ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={18} />
                <span>Registrarse</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>

      </div>
    </div>
  );
}