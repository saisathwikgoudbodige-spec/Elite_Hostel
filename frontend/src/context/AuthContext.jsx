import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const apiBaseUrl = rawApiUrl.replace(/\/api$/, '');
axios.defaults.baseURL = apiBaseUrl;
axios.defaults.withCredentials = true;

let hasSetInterceptor = false;
if (!hasSetInterceptor) {
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => Promise.reject(error));
  hasSetInterceptor = true;
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Apply Authorization Header to Axios
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load user profile on startup
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setRole(res.data.role);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const login = async (email, password, type) => {
    setLoading(true);
    try {
      const endpoint = type === 'owner' ? '/api/auth/login/owner' : '/api/auth/login/student';
      const res = await axios.post(endpoint, { email, password });
      
      if (res.data.success) {
        const { token: userToken, role: userRole, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        setRole(userRole);
        return { success: true };
      }
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      // Let axios/browser set the multipart/form-data boundary header automatically
      const res = await axios.post('/api/auth/register', formData);
      return {
        success: true,
        message: res.data.message
      };
    } catch (err) {
      console.error('Registration error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
