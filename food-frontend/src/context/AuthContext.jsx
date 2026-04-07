import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

function getRoleFromToken(token) {
  if (!token) return null;
  const payload = parseJwt(token);
  if (payload.is_superuser || payload.is_staff) return 'admin';
  return payload.role || 'customer';
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access_token');
    return token ? parseJwt(token) : null;
  });
  const [role, setRole] = useState(() => getRoleFromToken(localStorage.getItem('access_token')));

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
      setUser(token ? parseJwt(token) : null);
      setRole(getRoleFromToken(token));
    };
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const login = (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    const parsed = parseJwt(access);
    setIsLoggedIn(true);
    setUser(parsed);
    setRole(getRoleFromToken(access));
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('remember_me');
    setIsLoggedIn(false);
    setUser(null);
    setRole(null);
  };

  const isAdmin = role === 'admin';
  const isDelivery = role === 'delivery';
  const isCustomer = role === 'customer';

  // Returns where to redirect after login
  const getRedirectPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'delivery') return '/delivery';
    return '/';
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn, user, role,
      isAdmin, isDelivery, isCustomer,
      login, logout, getRedirectPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
