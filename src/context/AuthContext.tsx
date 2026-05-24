import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export type UserRole = 'passenger' | 'driver';

export interface User {
  id: string;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  role: UserRole;
  rating: number;
  totalTrips: number;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  isOnline?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string, role: UserRole) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadStoredUser(); }, []);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('go_user');
      if (stored) setUser(JSON.parse(stored));
    } finally { setIsLoading(false); }
  };

  const login = async (phone: string, password: string, role: UserRole) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('phone', phone)
        .eq('role', role)
        .single();

      if (error || !data) {
        const demoUser: User = role === 'passenger' ? {
          id: '1', name: 'Juan', lastName: 'Martínez',
          phone, email: 'juan@email.com', role: 'passenger',
          rating: 4.8, totalTrips: 34,
        } : {
          id: '2', name: 'Carlos', lastName: 'Rivas',
          phone, email: 'carlos@email.com', role: 'driver',
          rating: 4.92, totalTrips: 128,
          vehicleModel: 'Toyota Corolla', vehiclePlate: 'P-1234',
          vehicleColor: 'Plateado', isOnline: false,
        };
        await AsyncStorage.setItem('go_user', JSON.stringify(demoUser));
        setUser(demoUser);
        return;
      }

      const loggedUser: User = {
        id: data.id,
        name: data.name,
        lastName: data.last_name,
        phone: data.phone,
        email: data.email,
        role: data.role,
        rating: data.rating ?? 5,
        totalTrips: data.total_trips ?? 0,
        vehicleModel: data.vehicle_model,
        vehiclePlate: data.vehicle_plate,
        isOnline: data.is_online,
      };
      await AsyncStorage.setItem('go_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (err: any) {
      throw new Error(err?.message || 'Error al iniciar sesión');
    }
  };

  const register = async (data: any) => {
    try {
      const { data: inserted, error } = await supabase
        .from('usuarios')
        .insert([{
          name: data.name,
          last_name: data.lastName,
          phone: data.phone,
          email: data.email,
          role: data.role,
          rating: 5,
          total_trips: 0,
          vehicle_model: data.vehicleModel,
          vehicle_plate: data.vehiclePlate,
          is_online: false,
        }])
        .select()
        .single();

      if (error) {
        console.log('Supabase error:', JSON.stringify(error));
        throw new Error(error.message);
      }

      const newUser: User = {
        id: inserted.id,
        name: inserted.name,
        lastName: inserted.last_name,
        phone: inserted.phone,
        email: inserted.email,
        role: inserted.role,
        rating: 5,
        totalTrips: 0,
        vehicleModel: inserted.vehicle_model,
        vehiclePlate: inserted.vehicle_plate,
      };
      await AsyncStorage.setItem('go_user', JSON.stringify(newUser));
      setUser(newUser);
    } catch (err: any) {
      console.log('Register error:', err?.message);
      throw new Error(err?.message || 'Error al registrarse');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('go_user');
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      AsyncStorage.setItem('go_user', JSON.stringify(updated));
      return updated;
    });
  };

  const switchRole = () => {
    setUser(prev => {
      if (!prev) return null;
      const newRole: UserRole = prev.role === 'passenger' ? 'driver' : 'passenger';
      const updated = { ...prev, role: newRole };
      AsyncStorage.setItem('go_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};