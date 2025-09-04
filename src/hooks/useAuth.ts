import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    authService.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    await authService.signUp(email, password, userData);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};