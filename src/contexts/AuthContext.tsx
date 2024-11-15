import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDB, getAuthToken, setAuthToken, createUser, getUser, updateUser } from '@/lib/db';
import type { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const database = await initDB();
      const auth = await getAuthToken();
      
      if (auth) {
        const user = await getUser(auth.userId);
        if (user) {
          setUser(user);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string) => {
    const token = crypto.randomUUID();
    const newUser = await createUser({
      username,
      settings: {
        visibility: 'public',
        notifications: true,
        locationSharing: false,
      },
    });

    await setAuthToken(token, newUser.id);
    setUser(newUser);
  };

  const logout = async () => {
    const database = await initDB();
    await database.clear('auth');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    const updatedUser = await updateUser(user.id, updates);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
