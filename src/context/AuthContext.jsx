import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/api';

const TOKEN_STORAGE_KEY = 'satlink_access_token';
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const readStoredToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState('');

  const logout = useCallback(() => {
    apiClient.clearAuthToken();
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthError('Your session has expired. Please sign in again.');
      logout();
    };

    window.addEventListener('satlink:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('satlink:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = readStoredToken();

      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const currentUser = await apiClient.get('/auth/me');
        if (!cancelled) setUser(currentUser);
      } catch (error) {
        if (!cancelled) {
          apiClient.clearAuthToken();
          setUser(null);
          setAuthError(
            error?.status === 401
              ? 'Your session has expired. Please sign in again.'
              : error?.message || 'Unable to restore your session.'
          );
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (username, password) => {
    setAuthError('');

    const form = new URLSearchParams();
    form.set('username', username);
    form.set('password', password);

    const response = await apiClient.post('/auth/login', form);
    apiClient.setAuthToken(response.access_token);

    try {
      const currentUser = await apiClient.get('/auth/me');
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      apiClient.clearAuthToken();
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        authError,
        login,
        logout,
        clearAuthError: () => setAuthError(''),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
