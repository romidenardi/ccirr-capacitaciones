import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CLAVE_TOKEN } from '../api/axios.js';
import { getYo, login as loginApi } from '../api/auth.api.js';

const AuthContext = createContext(null);

// Guarda quién está logueado y lo comparte con toda la app.
// Al abrir o recargar la página, si hay un token guardado, le pregunta al backend si sigue siendo válido.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(() => Boolean(localStorage.getItem(CLAVE_TOKEN)));

  useEffect(() => {
    if (!localStorage.getItem(CLAVE_TOKEN)) return;
    getYo()
      .then(setUsuario)
      .catch(() => localStorage.removeItem(CLAVE_TOKEN))
      .finally(() => setVerificando(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, usuario } = await loginApi(email, password);
    localStorage.setItem(CLAVE_TOKEN, token);
    setUsuario(usuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CLAVE_TOKEN);
    setUsuario(null);
  }, []);

  return <AuthContext.Provider value={{ usuario, verificando, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
