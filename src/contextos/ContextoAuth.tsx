import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiAuth } from '../servicios/apiAuth';

interface AuthContextType {
  autenticado: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [autenticado, setAutenticado] = useState<boolean>(false);

  // Al cargar la app, revisamos si ya hay un token guardado
  useEffect(() => {
    const token = apiAuth.obtenerToken();
    if (token) setAutenticado(true);
  }, []);

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