import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiAuth } from '../servicios/apiAuth';

interface AuthContextType {
  autenticado: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ProveedorAuth({ children }: { children: ReactNode }) {
  // Inicialización perezosa y síncrona
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    // React ejecuta esto una sola vez al cargar la página ANTES de renderizar las rutas
    const token = apiAuth.obtenerToken();
    return token !== null; // Devuelve true si hay token, false si no lo hay
  });

  const login = (token: string) => {
    setAutenticado(true);
  };

  const logout = () => {
    apiAuth.cerrarSesion();
    setAutenticado(false);
  };

  return (
    <AuthContext.Provider value={{ autenticado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const usarAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('usarAuth debe usarse dentro de un ProveedorAuth');
  return context;
};