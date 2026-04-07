import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access_token');
    return token ? parseJwt(token) : null;
  });

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
      setUser(token ? parseJwt(token) : null);
    };
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const login = (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setIsLoggedIn(true);
    setUser(parseJwt(access));
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('remember_me');
    setIsLoggedIn(false);
    setUser(null);
  };

  const isAdmin = user?.is_staff || user?.is_superuser || false;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
