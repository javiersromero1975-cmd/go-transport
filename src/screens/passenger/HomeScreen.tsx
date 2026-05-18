import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { cancelTrip, createTrip, subscribeToTrip } from '../../services/tripService';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

const VEHICLES = ['Auto', 'Moto', 'Camioneta'];

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [fare, setFare] = useState(5);
  const [vehicle, setVehicle] = useState('Auto');
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [location, setLocation] = useState({ latitude: 13.6929, longitude: -89.2182, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  const [searching, setSearching] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const initials = `${user?.name?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  useEffect(() => { getLocation(); }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    }
  };

  const handleSelectDestination = () => {
    navigation.navigate('SearchDestination', {
      onSelect: (place: { address: string; latitude: number; longitude: number }) => {
        setDestination(place.address);
        setDestCoords({ latitude: place.latitude, longitude: place.longitude });
      }
    });
  };

  const handleSearch = async () => {
    if (!destination) return;
    setSearching(true);
    try {
      const trip = await createTrip({
        passenger_id: user?.id ?? 'demo',
        passenger_name: `${user?.name} ${user?.lastName}`,
        passenger_lat: location.latitude,
        passenger_lng: location.longitude,
        destination_address: destination,
        destination_lat: destCoords?.latitude ?? 13.6929,
        destination_lng: destCoords?.longitude ?? -89.2182,
        fare,
        vehicle_type: vehicle,
        payment_method: 'cash',
      });

      setCurrentTripId(trip.id);

      const channel = subscribeToTrip(trip.id, (updatedTrip) => {
        if (updatedTrip.status === 'accepted') {
          supabase.removeChannel(channel);
          setSearching(false);
          navigation.navigate('ActiveTrip', {
            tripId: trip.id,
            driverName: updatedTrip.driver_name,
            driverPhone: updatedTrip.driver_phone,
            driverLat: updatedTrip.driver_lat,
            driverLng: updatedTrip.driver_lng,
          });
        }
      });

      navigation.navigate('Searching', {
        tripId: trip.id,
        onCancel: async () => {
          await cancelTrip(trip.id);
          setSearching(false);
          setCurrentTripId(null);
        }
      });
    } catch (err) {
      Alert.alert('Error', 'No se pudo crear el viaje. Intenta de nuevo.');
      setSearching(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View><Text style={s.logo}>GO</Text><Text style={s.hsub}>San Salvador, SV</Text></View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={s.av}>
          <Text style={s.avTxt}>{initials}</Text>
        </TouchableOpacity>
      </View>
      <MapView style={s.map} provider={PROVIDER_DEFAULT} region={location} showsUserLocation showsMyLocationButton>
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="Tu ubicación" />
        {destCoords && <Marker coordinate={destCoords} title={destination} pinColor={Colors.danger} />}
      </MapView>
      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={s.sheetLabel}>¿A dónde vas?</Text>
        <View style={s.inputRow}>
          <View style={[s.dot, { backgroundColor: Colors.info }]} />
          <Text style={s.inputTxt}>Mi ubicación actual</Text>
        </View>
        <TouchableOpacity style={s.inputRow} onPress={handleSelectDestination}>
          <View style={[s.dot, { backgroundColor: Colors.danger }]} />
          <Text style={[s.inputTxt, !destination && { color: Colors.textTertiary }]}>
            {destination || 'Buscar destino...'}
          </Text>
          {destination ? <Text style={{ fontSize: 16, color: Colors.textTertiary }}>✕</Text> : <Text style={{ fontSize: 14 }}>🔍</Text>}
        </TouchableOpacity>
        <View style={s.chips}>
          {VEHICLES.map(v => (
            <TouchableOpacity key={v} style={[s.chip, vehicle === v && s.chipActive]} onPress={() => setVehicle(v)}>
              <Text style={[s.chipTxt, vehicle === v && s.chipTxtActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.fareRow}>
          <Text style={s.fareLabel}>Tu oferta</Text>
          <View style={s.fareBx}>
            <TouchableOpacity style={s.fareBtn} onPress={() => setFare(f => Math.max(2, parseFloat((f - 0.5).toFixed(2))))}><Text style={s.fareBtnTxt}>−</Text></TouchableOpacity>
            <Text style={s.fareVal}>${fare.toFixed(2)}</Text>
            <TouchableOpacity style={s.fareBtn} onPress={() => setFare(f => parseFloat((f + 0.5).toFixed(2)))}><Text style={s.fareBtnTxt}>+</Text></TouchableOpacity>
          </View>
        </View>
        <View style={s.safety}><View style={s.safetyDot} /><Text style={s.safetyTxt}>Viaje protegido · SOS disponible · Ruta en tiempo real</Text></View>
        <TouchableOpacity
          style={[s.btnPrimary, (!destination || searching) && s.btnDisabled]}
          onPress={handleSearch}
          disabled={!destination || searching}
        >
          {searching ? <ActivityIndicator color={Colors.accent} /> : <Text style={s.btnPrimaryTxt}>Buscar conductor →</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.accent, letterSpacing: -1 },
  hsub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  av: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avTxt: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  map: { flex: 1 },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, padding: Spacing.xl, paddingBottom: 32, borderTopWidth: 0.5, borderColor: Colors.border },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  sheetLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.background, borderRadius: Radii.md, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: Colors.border },
  dot: { width: 10, height: 10, borderRadius: 5 },
  inputTxt: { fontSize: FontSize.base, color: Colors.textPrimary, flex: 1 },
  chips: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  chip: { flex: 1, paddingVertical: 8, borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center' },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  chipTxt: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  chipTxtActive: { color: Colors.accent },
  fareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  fareLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  fareBx: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.md, paddingHorizontal: 10, paddingVertical: 6 },
  fareVal: { fontSize: FontSize.lg, fontWeight: '500', color: Colors.textPrimary, minWidth: 60, textAlign: 'center' },
  fareBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  fareBtnTxt: { fontSize: 18, fontWeight: '700', color: Colors.primary, lineHeight: 22 },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EAF3DE', borderRadius: 10, padding: 10, borderWidth: 0.5, borderColor: '#C0DD97', marginBottom: 12 },
  safetyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B6D11' },
  safetyTxt: { fontSize: 11, color: '#27500A', flex: 1 },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: 15, alignItems: 'center' },
  btnPrimaryTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.accent },
  btnDisabled: { opacity: 0.5 },
});