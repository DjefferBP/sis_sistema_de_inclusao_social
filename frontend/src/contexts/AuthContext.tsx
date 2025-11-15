// contexts/AuthContext.tsx - VERSÃO COM LOGIN AUTOMÁTICO APÓS REGISTRO
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, userService } from '../services/api';
import type { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const userData = await userService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Erro ao buscar usuário atual:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    console.log('🔑 Iniciando login...');
    
    try {
      const response = await authService.login({ email, senha });
      const token = response.access_token;

      localStorage.setItem('auth_token', token);
      
      // Busca os dados completos do usuário
      const userData = await userService.getCurrentUser();
      setUser(userData);
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    console.log('📝 Iniciando registro...');
    
    try {
      // 1. Primeiro faz o registro
      await authService.register(userData);
      
      // 2. Depois faz login automaticamente com as mesmas credenciais
      console.log('🔄 Fazendo login automático após registro...');
      await login(userData.email, userData.senha);
      
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const updateUser = (userData: Usuario) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};