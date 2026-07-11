import { supabase } from './supabase';

export interface Trip {
  id?: string;
  passenger_id: string;
  passenger_name: string;
  passenger_lat: number;
  passenger_lng: number;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  fare: number;
  vehicle_type: string;
  status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_lat?: number;
  driver_lng?: number;
  payment_method?: string;
}

export const createTrip = async (trip: Omit<Trip, 'id' | 'status'>) => {
  console.log('Creating trip:', JSON.stringify(trip));
  const { data, error } = await supabase
    .from('viajes')
    .insert([{ ...trip, status: 'pending' }])
    .select()
    .single();
  if (error) {
    console.log('Trip error:', JSON.stringify(error));
    throw error;
  }
  console.log('Trip created:', data?.id);
  return data;
};

export const getPendingTrips = async () => {
  const { data, error } = await supabase
    .from('viajes')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const acceptTrip = async (tripId: string, driverData: { driver_id: string; driver_name: string; driver_phone: string; driver_lat: number; driver_lng: number }) => {
  
  const { data, error } = await supabase
    .from('viajes')
    .update({ ...driverData, status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', tripId)
    .eq('status', 'pending')
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateDriverLocation = async (tripId: string, lat: number, lng: number) => {
  await supabase
    .from('viajes')
    .update({ driver_lat: lat, driver_lng: lng })
    .eq('id', tripId);
};

export const startTrip = async (tripId: string) => {
  await supabase
    .from('viajes')
    .update({ status: 'in_progress' })
    .eq('id', tripId);
};

export const completeTrip = async (tripId: string) => {
  await supabase
    .from('viajes')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', tripId);
};

export const cancelTrip = async (tripId: string) => {
  await supabase
    .from('viajes')
    .update({ status: 'cancelled' })
    .eq('id', tripId);
};

export const subscribeToTrip = (tripId: string, onUpdate: (trip: any) => void) => {
  const channel = supabase
    .channel(`trip-${tripId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'viajes',
      filter: `id=eq.${tripId}`,
    }, (payload) => onUpdate(payload.new))
    .subscribe();
  return channel;
};

export const subscribeToNewTrips = (onNewTrip: (trip: any) => void) => {
  const channel = supabase
    .channel(`new-trips-${Date.now()}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'viajes',
    }, (payload) => {
      if (payload.new.status === 'pending') onNewTrip(payload.new);
    })
    .subscribe();
  return channel;
};