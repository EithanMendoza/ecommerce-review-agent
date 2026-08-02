import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiAuth } from '../servicios/apiAuth';

interface DatosUsuario {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface AuthContextType {
  autenticado: boolean;
  // 🆕 Mientras se consulta /api/auth/me al cargar la app, no sabemos aún
  // si hay sesión activa. Úsalo para mostrar un loader antes de decidir
  // si mandas al usuario a /login o le muestras la app.
  cargandoAuth: boolean;
  usuario: DatosUsuario | null;
  login: (datos: DatosUsuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [autenticado, setAutenticado] = useState(false);
  const [usuario, setUsuario] = useState<DatosUsuario | null>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    // Como el JWT es HttpOnly, JS no puede leerlo. La única forma de saber
    // si la cookie sigue siendo válida al recargar la página es preguntarle
    // al backend (que sí la recibe automáticamente en la petición).
    apiAuth.verificarSesion()
      .then((datos) => {
        if (datos) {
          setAutenticado(true);
          setUsuario(datos);
        } else {
          setAutenticado(false);
          setUsuario(null);
        }
      })
      .finally(() => setCargandoAuth(false));
  }, []);

  // 🔄 Ya no recibe un token — recibe los datos del usuario que /login
  // devuelve en el body (la cookie se puso sola vía Set-Cookie).
  const login = (datos: DatosUsuario) => {
    setUsuario(datos);
    setAutenticado(true);
  };

 const logout = async () => {
    // 1. Esperamos a que el servidor borre la cookie de verdad
    await apiAuth.cerrarSesion(); 
    
    // 2. Limpiamos el estado global de React
    setAutenticado(false);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ autenticado, cargandoAuth, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const usarAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('usarAuth debe usarse dentro de un ProveedorAuth');
  return context;
};