import { createContext, useContext, useState, useEffect } from 'react';
import api, { login as apiLogin, getMe } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar: si hay token guardado, verificarlo
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    // getMe usa el interceptor de api.js que lee el token de localStorage
    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Token inválido o expirado — limpiar silenciosamente
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  // Interceptor de respuesta: si cualquier llamada devuelve 401, cerrar sesión
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Solo cerrar sesión si teníamos usuario activo
          setUser((prev) => {
            if (prev) localStorage.removeItem('token');
            return null;
          });
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
