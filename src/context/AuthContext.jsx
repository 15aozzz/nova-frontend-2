import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(localStorage.getItem('nova_session'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('nova_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('nova_session', token);
      localStorage.setItem('nova_user', JSON.stringify(userData));
      
      setSession(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error de conexión' 
      };
    }
  };

  const register = async (nombre, correo, password) => {
    try {
      await api.post('/auth/register', { nombre, correo, password });
      return { success: true };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al registrar usuario' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('nova_session');
    localStorage.removeItem('nova_user');
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

