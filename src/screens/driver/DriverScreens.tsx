import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getRoute } from '../../services/directionsService';
import { sendLocalNotification } from '../../services/notificationService';
import { supabase } from '../../services/supabase';
import { acceptTrip, cancelTrip, completeTrip, getPendingTrips, startTrip, subscribeToNewTrips, updateDriverLocation } from '../../services/tripService';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

const RequestCard = ({ req, onAccept, onDecline }: any) => {
  const timerAnim = useRef(new Animated.Value(1)).current;
  const [showCounter, setShowCounter] = useState(false);
  const [counterOffer, setCounterOffer] = useState(req.fare?.toFixed(2) ?? '5.00');

  useEffect(() => {
    Animated.timing(timerAnim, { toValue: 0, duration: 20000, useNativeDriver: false }).start(() => onDecline());
  }, []);

  const initials = (req.passenger_name ?? 'PA').split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const handleCounter = () => {
    const amount = parseFloat(counterOffer);
    if (isNaN(amount) || amount <= 0) { Alert.alert('Ingresa un precio válido'); return; }
    setShowCounter(false);
    Alert.alert('✅ Contraoferta enviada', `Le ofreciste $${amount.toFixed(2)}`, [{ text: 'OK', onPress: onAccept }]);
  };

  return (
    <View style={s.card}>
      <View style={s.timerBg}>
        <Animated.View style={[s.timerFill, { width: timerAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} />
      </View>
      <View style={s.cardTop}>
        <View style={s.passRow}>
          <View style={s.passAv}><Text style={s.passAvTxt}>{initials}</Text></View>
          <View><Text style={s.passName}>{req.passenger_name ?? 'Pasajero'}</Text><Text style={s.passRating}>📍 {req.destination_address ?? 'Destino'}</Text></View>
        </View>
        <View style={s.fareBadge}><Text style={s.fareBadgeTxt}>${req.fare?.toFixed(2) ?? '5.00'}</Text></View>
      </View>
      <View style={s.routeMini}>
        <View style={s.routeRow}><View style={[s.routeDot, { backgroundColor: Colors.info }]} /><Text style={s.routeTxt}>Ubicación del pasajero</Text></View>
        <View style={s.routeRow}><View style={[s.routeDot, { backgroundColor: Colors.danger }]} /><Text style={s.routeTxt}>{req.destination_address ?? 'Destino'}</Text></View>
      </View>
      <Text style={s.cardMeta}>Tarifa: ${req.fare?.toFixed(2)} · {req.vehicle_type ?? 'Auto'}</Text>
      <View style={s.cardBtns}>
        <TouchableOpacity style={s.declineBtn} onPress={onDecline}><Text style={s.declineTxt}>Rechazar</Text></TouchableOpacity>
        <TouchableOpacity style={s.counterBtn} onPress={() => setShowCounter(true)}><Text style={s.counterTxt}>💬 Contraoferta</Text></TouchableOpacity>
        <TouchableOpacity style={s.acceptBtn} onPress={onAccept}><Text style={s.acceptTxt}>Aceptar</Text></TouchableOpacity>
      </View>
      <Modal visible={showCounter} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Hacer contraoferta</Text>
            <Text style={s.modalSub}>El pasajero ofreció <Text style={{ fontWeight: '700', color: Colors.primary }}>${req.fare?.toFixed(2)}</Text></Text>
            <Text style={s.modalSub2}>¿Cuánto quieres cobrar?</Text>
            <View style={s.counterInputWrap}>
              <Text style={s.dollarSign}>$</Text>
              <TextInput style={s.counterInput} value={counterOffer} onChangeText={setCounterOffer} keyboardType="decimal-pad" autoFocus />
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setShowCounter(false)}><Text style={s.modalCancelTxt}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={s.modalAccept} onPress={handleCounter}><Text style={s.modalAcceptTxt}>Enviar oferta</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const DriverHomeScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [earnings, setEarnings] = useState({ today: 0, trips: 0, acceptance: 0 });

  useEffect(() => { loadEarnings(); }, []);

  const loadEarnings = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from('viajes')
        .select('fare, status')
        .eq('driver_id', user?.id)
        .gte('created_at', today.toISOString());
      if (data) {
        const completed = data.filter(t => t.status === 'completed');
        const total = completed.reduce((sum, t) => sum + (t.fare ?? 0), 0);
        const acceptance = data.length > 0 ? Math.round((completed.length / data.length) * 100) : 0;
        setEarnings({ today: total, trips: completed.length, acceptance });
      }
    } catch {}
  };
  const initials = `${user?.name?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  const toggleOnline = async () => {
    const next = !isOnline;
    if (next) {
      console.log('DEBUG USER ID:', user?.id);
      const { data } = await supabase
        .from('usuarios')
        .select('membership_expires_at, pending_cash')
        .eq('id', user?.id)
        .single();
      const expired = !data?.membership_expires_at || new Date(data.membership_expires_at) <= new Date() || data?.pending_cash === 'true';
      console.log('DEBUG MEMBERSHIP:', JSON.stringify(data), expired);
      if (expired) {
        Alert.alert(
          '⏳ Membresía vencida',
          'Necesitas recargar tu membresía para recibir viajes.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Recargar ahora', onPress: () => navigation.navigate('Membership') },
          ]
        );
        return;
      }
    }
    setIsOnline(next);
    updateUser({ isOnline: next });
    if (next) {
      const pending = await getPendingTrips();
      setRequests(pending);
      channelRef.current = subscribeToNewTrips((newTrip) => {
        setRequests(prev => [newTrip, ...prev]);
        sendLocalNotification('🚗 Nueva solicitud', `${newTrip.passenger_name} → ${newTrip.destination_address} · $${newTrip.fare?.toFixed(2)}`);
      });
    } else {
      setRequests([]);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    }
  };

  const handleAccept = async (tripId: string) => {
    try {
      let driverLat = 13.6950;
      let driverLng = -89.2200;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          driverLat = loc.coords.latitude;
          driverLng = loc.coords.longitude;
        }
      } catch {}
      const trip = await acceptTrip(tripId, {
        driver_id: user?.id ?? 'demo-driver',
        driver_name: `${user?.name} ${user?.lastName}`,
        driver_phone: user?.phone ?? '+50370000000',
        driver_lat: driverLat,
        driver_lng: driverLng,
      });
      setRequests([]);
      navigation.navigate('DriverActiveTrip', { trip });
    } catch (err: any) {
      console.log('ACCEPT ERROR:', err?.message, JSON.stringify(err));
      Alert.alert('Error', 'No se pudo aceptar el viaje.');
      setRequests(prev => prev.filter(r => r.id !== tripId));
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View><Text style={s.logo}>GO <Text style={s.logoSub}>conductor</Text></Text><Text style={s.hsub}>{user?.name} · ⭐ {(user?.rating ?? 5).toFixed(2)}</Text></View>
        <View style={s.driverAv}><Text style={s.driverAvTxt}>{initials}</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <TouchableOpacity style={s.toggleCard} onPress={toggleOnline}>
          <View><Text style={s.toggleLabel}>{isOnline ? 'En línea' : 'Desconectado'}</Text><Text style={s.toggleSub}>{isOnline ? 'Recibiendo solicitudes reales' : 'No recibirás solicitudes'}</Text></View>
          <View style={[s.toggle, isOnline ? s.toggleOn : s.toggleOff]}><View style={[s.knob, isOnline ? s.knobRight : s.knobLeft]} /></View>
        </TouchableOpacity>
        <View style={s.earningsRow}>
          {[[`$${earnings.today.toFixed(2)}`, 'Hoy'], [`${earnings.trips}`, 'Viajes'], [`${earnings.acceptance}%`, 'Aceptación']].map(([v,l]) => (
            <View key={l} style={s.earnCard}><Text style={s.earnVal}>{v}</Text><Text style={s.earnLabel}>{l}</Text></View>
          ))}
        </View>
        {isOnline && requests.length > 0 && <Text style={s.sLabel}>Solicitudes en tiempo real</Text>}
        {requests.map(r => (
          <RequestCard key={r.id} req={r}
            onAccept={() => handleAccept(r.id)}
            onDecline={async () => { await cancelTrip(r.id); setRequests(p => p.filter(x => x.id !== r.id)); }}
          />
        ))}
        {(!isOnline || requests.length === 0) && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>⏱</Text>
            <Text style={s.emptyTxt}>{isOnline ? 'Esperando solicitudes reales...' : 'Activa tu estado para recibir viajes'}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export const DriverActiveTripScreen = ({ navigation, route }: any) => {
  const [phase, setPhase] = useState<'pickup'|'trip'>('pickup');
  const [rating, setRating] = useState(0);
  const [showRate, setShowRate] = useState(false);
  const trip = route?.params?.trip;
  const locationIntervalRef = useRef<any>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    if (trip?.passenger_lat && trip?.destination_lat) {
      getRoute(
        { latitude: trip.passenger_lat, longitude: trip.passenger_lng },
        { latitude: trip.destination_lat, longitude: trip.destination_lng }
      ).then(setRouteCoords);
    }
  }, [trip]);

  useEffect(() => {
    startLocationUpdates();
    return () => { if (locationIntervalRef.current) clearInterval(locationIntervalRef.current); };
  }, []);

  const startLocationUpdates = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted' && trip?.id) {
        locationIntervalRef.current = setInterval(async () => {
          const loc = await Location.getCurrentPositionAsync({});
          await updateDriverLocation(trip.id, loc.coords.latitude, loc.coords.longitude);
        }, 5000);
      }
    } catch {}
  };

  const handleCall = () => Linking.openURL(`tel:${trip?.passenger_phone ?? '+50370001111'}`);
  const handleNavigate = () => {
    const dest = phase === 'pickup'
      ? { latitude: trip?.passenger_lat ?? 13.6929, longitude: trip?.passenger_lng ?? -89.2182 }
      : { latitude: trip?.destination_lat ?? 13.6910, longitude: trip?.destination_lng ?? -89.2250 };
    Linking.openURL(`https://maps.google.com/?daddr=${dest.latitude},${dest.longitude}`);
  };
  const handleStartTrip = async () => {
    if (trip?.id) await startTrip(trip.id);
    setPhase('trip');
  };
  const handleComplete = async () => {
    if (trip?.id) await completeTrip(trip.id);
    setShowRate(true);
  };

  if (showRate) return (
    <SafeAreaView style={s.safe}>
      <View style={s.rateWrap}>
        <View style={s.passAv}><Text style={s.passAvTxt}>{(trip?.passenger_name ?? 'PA')[0]}</Text></View>
        <Text style={s.rateTitle}>Califica al pasajero</Text>
        <Text style={s.rateSub}>{trip?.passenger_name ?? 'Pasajero'} · Viaje ${trip?.fare?.toFixed(2) ?? '5.00'}</Text>
        <View style={s.starsRow}>
          {[1,2,3,4,5].map(n => <TouchableOpacity key={n} onPress={() => setRating(n)}><Text style={[s.star, n <= rating && s.starActive]}>★</Text></TouchableOpacity>)}
        </View>
        <View style={s.earCard}>
          <View style={s.earRow}><Text style={s.earLabel}>Tarifa</Text><Text style={s.earVal}>${trip?.fare?.toFixed(2) ?? '5.00'}</Text></View>
          <View style={s.earRow}><Text style={s.earLabel}>Comisión GO (10%)</Text><Text style={[s.earVal, { color: Colors.danger }]}>−${((trip?.fare ?? 5) * 0.1).toFixed(2)}</Text></View>
          <View style={[s.earRow, s.earTotal]}><Text style={s.earTotalLabel}>Tus ganancias</Text><Text style={s.earTotalVal}>${((trip?.fare ?? 5) * 0.9).toFixed(2)}</Text></View>
        </View>
        <TouchableOpacity style={s.btnPrimary} onPress={() => { if (!rating) { Alert.alert('Selecciona una calificación'); return; } navigation.replace('DriverTabs'); }}>
          <Text style={s.btnPrimaryTxt}>Completar y continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={s.tripHeader}>
        <Text style={s.tripStatus}>{phase === 'pickup' ? 'En camino al pasajero' : 'Viaje en curso'}</Text>
        <View style={s.tripPassRow}>
          <View style={s.passAv}><Text style={s.passAvTxt}>{(trip?.passenger_name ?? 'PA')[0]}</Text></View>
          <View style={{ flex: 1 }}><Text style={s.tripPassName}>{trip?.passenger_name ?? 'Pasajero'}</Text><Text style={s.tripPassSub}>{phase === 'pickup' ? 'Esperando recogida' : 'En viaje'}</Text></View>
          <View style={s.farePill}><Text style={s.farePillTxt}>${trip?.fare?.toFixed(2) ?? '5.00'}</Text></View>
        </View>
      </View>
     <MapView
        style={s.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: ((trip?.passenger_lat ?? 13.6929) + (trip?.destination_lat ?? 13.6910)) / 2,
          longitude: ((trip?.passenger_lng ?? -89.2182) + (trip?.destination_lng ?? -89.2250)) / 2,
          latitudeDelta: Math.abs((trip?.passenger_lat ?? 13.6929) - (trip?.destination_lat ?? 13.6910)) + 0.02,
          longitudeDelta: Math.abs((trip?.passenger_lng ?? -89.2182) - (trip?.destination_lng ?? -89.2250)) + 0.02,
        }}
        showsUserLocation
      >
        <Marker coordinate={{ latitude: trip?.passenger_lat ?? 13.6929, longitude: trip?.passenger_lng ?? -89.2182 }} title={`📍 ${trip?.passenger_name ?? 'Pasajero'}`} description="Punto de recogida" pinColor={Colors.info} />
        <Marker coordinate={{ latitude: trip?.destination_lat ?? 13.6910, longitude: trip?.destination_lng ?? -89.2250 }} title={`🏁 ${trip?.destination_address ?? 'Destino'}`} description="Destino del viaje" pinColor={Colors.danger} />
        
          <Polyline
          coordinates={routeCoords.length > 0 ? routeCoords : [
            { latitude: trip?.passenger_lat ?? 13.6929, longitude: trip?.passenger_lng ?? -89.2182 },
            { latitude: trip?.destination_lat ?? 13.6910, longitude: trip?.destination_lng ?? -89.2250 },
          ]}
          strokeColor={Colors.primary}
          strokeWidth={4}
        />
      </MapView>
      <TouchableOpacity style={s.navBtnFloat} onPress={handleNavigate}>
        <Text style={s.navBtnTxt}>🧭 Abrir en Google Maps</Text>
      </TouchableOpacity>
      <View style={s.bottomBar}>
        <Text style={s.pickupHint}>{phase === 'pickup' ? `📍 Recoge a: ${trip?.passenger_name ?? 'Pasajero'}` : `🏁 Destino: ${trip?.destination_address ?? 'Destino'}`}</Text>
        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} onPress={handleCall}><Text style={{ fontSize: 20 }}>📞</Text></TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Chat', { viajeId: trip?.id ?? 'demo-trip-001', otherName: trip?.passenger_name ?? 'Pasajero' })}><Text style={{ fontSize: 20 }}>💬</Text></TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={handleNavigate}><Text style={{ fontSize: 20 }}>🧭</Text></TouchableOpacity>
          {phase === 'pickup'
            ? <TouchableOpacity style={s.primaryBtn} onPress={handleStartTrip}><Text style={s.primaryBtnTxt}>Iniciar viaje</Text></TouchableOpacity>
            : <TouchableOpacity style={[s.primaryBtn, { backgroundColor: Colors.success }]} onPress={handleComplete}><Text style={s.primaryBtnTxt}>Finalizar</Text></TouchableOpacity>
          }
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.accent, letterSpacing: -1 },
  logoSub: { fontSize: FontSize.xs, fontWeight: '400', color: 'rgba(245,200,66,0.6)', letterSpacing: 0 },
  hsub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  driverAv: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(245,200,66,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(245,200,66,0.3)' },
  driverAvTxt: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.accent },
  toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md },
  toggleLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  toggleSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  toggle: { width: 46, height: 26, borderRadius: 13, position: 'relative' },
  toggleOn: { backgroundColor: Colors.success },
  toggleOff: { backgroundColor: Colors.border },
  knob: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white, top: 3 },
  knobRight: { right: 3 },
  knobLeft: { left: 3 },
  earningsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  earnCard: { flex: 1, backgroundColor: Colors.background, borderRadius: Radii.md, padding: 12, alignItems: 'center' },
  earnVal: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary },
  earnLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  sLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  card: { backgroundColor: Colors.white, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: 10 },
  timerBg: { height: 4, backgroundColor: Colors.border, borderRadius: 2, marginBottom: 12, overflow: 'hidden' },
  timerFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  passAv: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  passAvTxt: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  passName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  passRating: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  fareBadge: { backgroundColor: Colors.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  fareBadgeTxt: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  routeMini: { borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: Colors.border, paddingVertical: 8, marginBottom: 8 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeTxt: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  cardMeta: { fontSize: FontSize.xs, color: Colors.textTertiary, marginBottom: 12 },
  cardBtns: { flexDirection: 'row', gap: 6 },
  declineBtn: { flex: 1, paddingVertical: 12, borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.background, alignItems: 'center' },
  declineTxt: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  counterBtn: { flex: 1.5, paddingVertical: 12, borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.info, backgroundColor: Colors.infoLight, alignItems: 'center' },
  counterTxt: { fontSize: 11, color: Colors.info, fontWeight: '600' },
  acceptBtn: { flex: 1, paddingVertical: 12, borderRadius: Radii.md, backgroundColor: Colors.primary, alignItems: 'center' },
  acceptTxt: { fontSize: 11, fontWeight: '600', color: Colors.accent },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 14 },
  emptyTxt: { fontSize: FontSize.base, color: Colors.textSecondary },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, paddingBottom: 40 },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  modalSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  modalSub2: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  counterInputWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dollarSign: { fontSize: 32, fontWeight: '700', color: Colors.primary },
  counterInput: { fontSize: 48, fontWeight: '700', color: Colors.primary, minWidth: 120, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: Colors.primary },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, paddingVertical: 14, borderRadius: Radii.lg, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center' },
  modalCancelTxt: { fontSize: FontSize.base, color: Colors.textSecondary },
  modalAccept: { flex: 2, paddingVertical: 14, borderRadius: Radii.lg, backgroundColor: Colors.primary, alignItems: 'center' },
  modalAcceptTxt: { fontSize: FontSize.base, fontWeight: '600', color: Colors.accent },
  tripHeader: { backgroundColor: Colors.primary, padding: Spacing.xl },
  tripStatus: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  tripPassRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tripPassName: { fontSize: FontSize.md, fontWeight: '500', color: Colors.white },
  tripPassSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  farePill: { backgroundColor: Colors.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  farePillTxt: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
 map: { flex: 1 },
  navBtnFloat: { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radii.lg },
  mapTxt: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
  navBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radii.lg },
  navBtnTxt: { fontSize: FontSize.base, fontWeight: '600', color: Colors.accent },
  bottomBar: { padding: Spacing.md, paddingBottom: 28, backgroundColor: Colors.white, borderTopWidth: 0.5, borderColor: Colors.border },
  pickupHint: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 48, height: 48, borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { flex: 1, paddingVertical: 12, borderRadius: Radii.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnTxt: { fontSize: FontSize.base, fontWeight: '600', color: Colors.accent },
  rateWrap: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  rateTitle: { fontSize: FontSize.xl, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4, marginTop: 12 },
  rateSub: { fontSize: FontSize.base, color: Colors.textSecondary },
  starsRow: { flexDirection: 'row', gap: 8, marginVertical: 16 },
  star: { fontSize: 40, color: '#D6D9D1' },
  starActive: { color: '#BA7517' },
  earCard: { width: '100%', backgroundColor: Colors.background, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.xl },
  earRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  earLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  earVal: { fontSize: FontSize.sm, color: Colors.textPrimary },
  earTotal: { borderTopWidth: 0.5, borderColor: Colors.border, paddingTop: 10, marginBottom: 0 },
  earTotalLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  earTotalVal: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.success },
  btnPrimary: { width: '100%', backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: 15, alignItems: 'center' },
  btnPrimaryTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.accent },
});