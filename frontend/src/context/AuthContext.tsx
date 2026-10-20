import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginResponse } from '../types';
import { api, setApiUserId, ApiError } from '../services/api';
import { useToast } from './ToastContext';

export interface DemoAccount {
  name: string;
  email: string;
  roleDescription: string;
  avatarInitials: string;
  badgeColor: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Admin',
    email: 'admin@flowtask.com',
    roleDescription: 'Dueño de "Trabajo" y "Personal"',
    avatarInitials: 'AD',
    badgeColor: 'bg-secondary text-on-secondary',
  },
  {
    name: 'Carlos Dev',
    email: 'carlos@flowtask.com',
    roleDescription: 'Dueño de "Urgente" • Colaborador en "Trabajo"',
    avatarInitials: 'CD',
    badgeColor: 'bg-primary-container text-on-primary',
  },
  {
    name: 'Ana Design',
    email: 'ana@flowtask.com',
    roleDescription: 'Colaboradora en "Urgente"',
    avatarInitials: 'AD',
    badgeColor: 'bg-tertiary text-on-tertiary',
  },
];

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  loginWithDemo: (demo: DemoAccount) => Promise<boolean>;
  register: (name: string, email: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showError, showSuccess } = useToast();

  const loadStoredUser = useCallback(async () => {
    const storedUserId = localStorage.getItem('flowtask_user_id');
    const storedUserJson = localStorage.getItem('flowtask_user_data');

    if (storedUserId && storedUserJson) {
      try {
        const parsed = JSON.parse(storedUserJson);
        setCurrentUser(parsed);
        setApiUserId(storedUserId);

        // Validar que el usuario siga existiendo en backend
        try {
          const freshUser = await api.users.getById(storedUserId);
          setCurrentUser(freshUser);
          localStorage.setItem('flowtask_user_data', JSON.stringify(freshUser));
        } catch {
          // Si el seeder reseteó la BD, cerrar sesión limpiamente
          logout();
        }
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const login = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res: LoginResponse = await api.auth.login(email.trim());
      const userObj: User = {
        id: res.id,
        name: res.name,
        email: res.email,
      };
      setCurrentUser(userObj);
      setApiUserId(userObj.id);
      localStorage.setItem('flowtask_user_data', JSON.stringify(userObj));
      showSuccess(`¡Bienvenido de vuelta, ${userObj.name}!`);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        showError('Error al iniciar sesión', err.detail);
      } else {
        showError('Error de conexión', 'No se pudo conectar con el servidor.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemo = async (demo: DemoAccount): Promise<boolean> => {
    return login(demo.email);
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const newUser = await api.auth.register({ name: name.trim(), email: email.trim() });
      setCurrentUser(newUser);
      setApiUserId(newUser.id);
      localStorage.setItem('flowtask_user_data', JSON.stringify(newUser));
      showSuccess('Cuenta creada', `Bienvenido a FlowTask, ${newUser.name}.`);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        showError('No se pudo registrar la cuenta', err.detail);
      } else {
        showError('Error de conexión', 'No se pudo conectar con el servidor.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setApiUserId(null);
    localStorage.removeItem('flowtask_user_data');
  };

  const refreshUser = async () => {
    if (currentUser?.id) {
      try {
        const fresh = await api.users.getById(currentUser.id);
        setCurrentUser(fresh);
        localStorage.setItem('flowtask_user_data', JSON.stringify(fresh));
      } catch {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        loginWithDemo,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
