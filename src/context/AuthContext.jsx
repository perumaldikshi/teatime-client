import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('user_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = (jwtToken, userData) => {
    localStorage.setItem('user_token', jwtToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
    setError(null);
  };

  useEffect(() => {
    if (!token) return;

    // --- 1. Token Expiration Auto-Logout ---
    let tokenTimeout;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      if (decoded && decoded.exp) {
        const expirationTimeMs = decoded.exp * 1000;
        const timeRemaining = expirationTimeMs - Date.now();
        if (timeRemaining > 0) {
          tokenTimeout = setTimeout(() => {
            console.warn('Session expired. Logging out.');
            logout();
          }, timeRemaining);
        } else {
          logout();
          return;
        }
      }
    } catch (e) {
      console.error('Error decoding JWT token:', e);
    }

    // --- 2. Inactivity Auto-Logout (15 minutes) ---
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    let inactivityTimeout;

    const resetInactivityTimer = () => {
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        console.warn('User inactive for 15 minutes. Logging out.');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    resetInactivityTimer();

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      if (tokenTimeout) clearTimeout(tokenTimeout);
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, loading, error, login, logout, setLoading, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
