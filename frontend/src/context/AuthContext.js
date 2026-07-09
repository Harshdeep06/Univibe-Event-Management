'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import API from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  
  useEffect(() => {
    const token = localStorage.getItem('univibe_token');
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching current user info:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      setError(null);
      setLoading(true);
      const res = await API.post('/auth/login', { email, password, role });
      
      if (res.data.success) {
        localStorage.setItem('univibe_token', res.data.token);
        setUser(res.data.user);
        
        
        const profileRes = await API.get('/auth/me');
        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }

        
        if (role === 'super_admin') {
          router.push('/admin');
        } else if (role === 'club_admin') {
          router.push('/club');
        } else {
          router.push('/student');
        }
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to login. Check credentials.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async (name, email, password, rollNumber, department, yearOfStudy) => {
    try {
      setError(null);
      setLoading(true);
      const res = await API.post('/auth/register', {
        name,
        email,
        password,
        rollNumber,
        department,
        yearOfStudy: Number(yearOfStudy),
      });

      if (res.data.success) {
        localStorage.setItem('univibe_token', res.data.token);
        setUser(res.data.user);

        const profileRes = await API.get('/auth/me');
        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }

        router.push('/student');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('univibe_token');
    setUser(null);
    setProfile(null);
    setError(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        login,
        registerStudent,
        logout,
        fetchMe,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
