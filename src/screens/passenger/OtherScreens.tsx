import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Linking, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

export const SearchingScreen = ({ navigation }: any) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.3, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <View style={ss.bg}>
      <SafeAreaView style={ss.content}>
        <Text style={ss.logo}>GO</Text>
        <Animated.View style={[ss.pulse, { transform: [{ scale: pulse }] }]}>
          <Text style={{ fontSize: 32, color: Colors.primary }}>⊙</Text>
        </Animated.View>
        <Text style={ss.title}>Buscando conductor...</Text>
        <Text style={ss.sub}>Los conductores cerca pueden aceptar tu oferta</Text>
        <TouchableOpacity style={ss.simulateBtn} onPress={() => navigation.replace('ActiveTrip')}>
          <Text style={ss.simulateTxt}>Simular: conductor encontrado →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ss.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={ss.cancelTxt}>Cancelar búsqueda</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};
const ss = StyleSheet.create({
  bg: { flex: 1, backgroundColor: Colors.primary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  logo: { fontSize: 32, fontWeight: '700', color: Colors.accent, letterSpacing: -1, marginBottom: 48 },
  pulse: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  title: { fontSize: FontSize.lg, fontWeight: '500', color: Colors.white, marginBottom: 10 },
  sub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 32 },
  simulateBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.accent, marginBottom: 12 },
  simulateTxt: { color: Colors.primary, fontSize: FontSize.base, fontWeight: '600' },
  cancelBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.25)' },
  cancelTxt: { color: Colors.white, fontSize: FontSize.base },
});

export const ActiveTripScreen = ({ navigation }: any) => {
  const driverLocation = { latitude: 13.6950, longitude: -89.2200 };
  const passengerLocation = { latitude: 13.6929, longitude: -89.2182 };

  const handleCall = () => Linking.openURL('tel:+50370000000');
  const handleShare = async () => {
    try {
      await Share.share({
        message: `🚗 Estoy en un viaje con GO Transport.\n📍 Mi ubicación: https://maps.google.com/?q=${passengerLocation.latitude},${passengerLocation.longitude}\n🚘 Conductor: Carlos Rivas\n🔢 Placa: P-1234\n⏰ Llegada estimada: 4 min`,
        title: 'Compartir mi ruta - GO',
      });
    } catch {}
  };
  const handleSOS = () => {
    Alert.alert('🆘 SOS - Emergencia', '¿Estás en peligro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Llamar 911', style: 'destructive', onPress: () => Linking.openURL('tel:911') },
    ]);
  };

  return (
    <View style={at.container}>
      <View style={at.header}>
        <Text style={at.status}>Conductor en camino · 4 min</Text>
        <View style={at.driverRow}>
          <View style={at.driverAv}><Text style={at.driverAvTxt}>CR</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={at.driverName}>Carlos Rivas</Text>
            <Text style={at.driverSub}>Toyota Corolla · Plateado</Text>
          </View>
          <View style={at.plate}><Text style={at.plateTxt}>P-1234</Text></View>
        </View>
        <View style={at.eta}><Text style={at.etaTxt}>Llega en 4 min · 2.3 km</Text></View>
      </View>
      <MapView style={at.map} provider={PROVIDER_DEFAULT} initialRegion={{ latitude: 13.6940, longitude: -89.2191, latitudeDelta: 0.008, longitudeDelta: 0.008 }} showsUserLocation>
        <Marker coordinate={driverLocation} title="Conductor"><View><Text style={{ fontSize: 24 }}>🚗</Text></View></Marker>
        <Marker coordinate={passengerLocation} title="Tu ubicación" pinColor={Colors.info} />
        <Polyline coordinates={[driverLocation, passengerLocation]} strokeColor={Colors.info} strokeWidth={3} lineDashPattern={[8, 4]} />
      </MapView>
      <View style={at.actionBar}>
        <TouchableOpacity style={at.actionBtn} onPress={handleCall}><Text style={at.actionIcon}>📞</Text><Text style={at.actionTxt}>Llamar</Text></TouchableOpacity>
        <TouchableOpacity style={at.actionBtn} onPress={() => navigation.navigate('Chat', { viajeId: 'demo-trip-001', otherName: 'Carlos Rivas' })}><Text style={at.actionIcon}>💬</Text><Text style={at.actionTxt}>Chat</Text></TouchableOpacity>
        <TouchableOpacity style={at.actionBtn} onPress={handleShare}><Text style={at.actionIcon}>📍</Text><Text style={at.actionTxt}>Compartir</Text></TouchableOpacity>
        <TouchableOpacity style={[at.actionBtn, at.sosBtn]} onPress={handleSOS}><Text style={at.actionIcon}>🆘</Text><Text style={[at.actionTxt, { color: Colors.danger, fontWeight: '700' }]}>SOS</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={at.finishBtn} onPress={() => navigation.replace('RateTrip')}><Text style={at.finishTxt}>Finalizar viaje</Text></TouchableOpacity>
    </View>
  );
};
const at = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, padding: Spacing.xl },
  status: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAv: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  driverAvTxt: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  driverName: { fontSize: FontSize.md, fontWeight: '500', color: Colors.white },
  driverSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  plate: { backgroundColor: Colors.white, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  plateTxt: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary, letterSpacing: 1 },
  eta: { backgroundColor: 'rgba(245,200,66,0.15)', borderWidth: 0.5, borderColor: Colors.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 10 },
  etaTxt: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '600' },
  map: { flex: 1 },
  actionBar: { flexDirection: 'row', gap: 8, padding: Spacing.md, borderTopWidth: 0.5, borderColor: Colors.border },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.background },
  actionIcon: { fontSize: 20, marginBottom: 2 },
  actionTxt: { fontSize: 10, fontWeight: '500', color: Colors.textPrimary },
  sosBtn: { backgroundColor: Colors.dangerLight, borderColor: '#F7C1C1' },
  finishBtn: { margin: Spacing.md, marginTop: 0, backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: 15, alignItems: 'center' },
  finishTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.accent },
});

const TAGS = ['Puntual', 'Amable', 'Conducción segura', 'Auto limpio', 'Ruta correcta'];
export const RateTripScreen = ({ navigation }: any) => {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const toggleTag = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  return (
    <SafeAreaView style={rt.safe}>
      <ScrollView contentContainerStyle={rt.scroll} keyboardShouldPersistTaps="handled">
        <View style={rt.center}>
          <View style={rt.av}><Text style={rt.avTxt}>CR</Text></View>
          <Text style={rt.title}>¿Cómo estuvo tu viaje?</Text>
          <Text style={rt.sub}>Carlos Rivas · Toyota Corolla</Text>
        </View>
        <View style={rt.starsRow}>
          {[1,2,3,4,5].map(n => <TouchableOpacity key={n} onPress={() => setRating(n)}><Text style={[rt.star, n <= rating && rt.starActive]}>★</Text></TouchableOpacity>)}
        </View>
        {rating > 0 && (
          <View style={rt.tagsWrap}>
            <Text style={rt.tagsLabel}>¿Qué estuvo bien?</Text>
            <View style={rt.tagsRow}>
              {TAGS.map(t => <TouchableOpacity key={t} style={[rt.tag, tags.includes(t) && rt.tagActive]} onPress={() => toggleTag(t)}><Text style={[rt.tagTxt, tags.includes(t) && rt.tagTxtActive]}>{t}</Text></TouchableOpacity>)}
            </View>
          </View>
        )}
        <TextInput style={rt.commentBox} placeholder="Comentario opcional..." placeholderTextColor={Colors.textTertiary} value={comment} onChangeText={setComment} multiline numberOfLines={3} textAlignVertical="top" />
        <View style={rt.fareCard}>
          <View style={rt.fareRow}><Text style={rt.fareLabel}>Distancia</Text><Text style={rt.fareVal}>2.3 km</Text></View>
          <View style={rt.fareRow}><Text style={rt.fareLabel}>Duración</Text><Text style={rt.fareVal}>12 min</Text></View>
          <View style={[rt.fareRow, rt.fareTotal]}><Text style={rt.fareTotalLabel}>Total pagado</Text><Text style={rt.fareTotalVal}>$5.00</Text></View>
        </View>
        <TouchableOpacity style={rt.btnPrimary} onPress={() => { if (!rating) { Alert.alert('Selecciona una calificación'); return; } navigation.navigate('MainTabs'); }}>
          <Text style={rt.btnPrimaryTxt}>Enviar calificación</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rt.btnSecondary} onPress={() => navigation.navigate('MainTabs')}><Text style={rt.btnSecondaryTxt}>Omitir</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const rt = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  center: { alignItems: 'center', marginBottom: 8 },
  av: { width: 68, height: 68, borderRadius: 34, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avTxt: { fontSize: 26, fontWeight: '700', color: Colors.primary },
  title: { fontSize: FontSize.xl, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4 },
  sub: { fontSize: FontSize.base, color: Colors.textSecondary },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 },
  star: { fontSize: 40, color: '#D6D9D1' },
  starActive: { color: '#BA7517' },
  tagsWrap: { marginBottom: Spacing.lg },
  tagsLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.border },
  tagActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  tagTxt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tagTxtActive: { color: Colors.accent },
  commentBox: { borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.md, padding: Spacing.md, fontSize: FontSize.base, color: Colors.textPrimary, minHeight: 80, backgroundColor: Colors.background, marginBottom: Spacing.lg },
  fareCard: { backgroundColor: Colors.background, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.xl },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  fareLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  fareVal: { fontSize: FontSize.sm, color: Colors.textPrimary },
  fareTotal: { borderTopWidth: 0.5, borderColor: Colors.border, paddingTop: 10, marginBottom: 0 },
  fareTotalLabel: { fontSize: FontSize.md, fontWeight: '500', color: Colors.textPrimary },
  fareTotalVal: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: 15, alignItems: 'center' },
  btnPrimaryTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.accent },
  btnSecondary: { borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, padding: 14, alignItems: 'center', marginTop: 10 },
  btnSecondaryTxt: { fontSize: FontSize.base, color: Colors.textPrimary },
});

const DEMO_TRIPS = [
  { id: '1', route: 'Col. Escalón → Metrocentro', driver: 'Carlos Rivas', rating: 5, km: '2.3', amount: '$5.00', date: 'Hoy, 9:30', status: 'completed' },
  { id: '2', route: 'Zona Rosa → Aeropuerto', driver: 'Ana García', rating: 4, km: '18.0', amount: '$12.00', date: 'Ayer, 14:15', status: 'completed' },
  { id: '3', route: 'USAM → Plaza Mundo', driver: 'Roberto Díaz', rating: 5, km: '5.1', amount: '$4.50', date: '02 Abr', status: 'completed' },
  { id: '4', route: 'Soyapango → Centro', driver: 'Cancelado', rating: 0, km: '0', amount: '$0.00', date: '01 Abr', status: 'cancelled' },
  { id: '5', route: 'Lomas → Galerías', driver: 'Mario López', rating: 4, km: '7.8', amount: '$7.00', date: '30 Mar', status: 'completed' },
];
export const HistoryScreen = () => {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? DEMO_TRIPS : DEMO_TRIPS.filter(t => t.status === filter);
  return (
    <SafeAreaView style={hs.safe} edges={['top']}>
      <View style={hs.header}><Text style={hs.logo}>GO</Text><Text style={hs.hsub}>Mis viajes</Text></View>
      <View style={hs.filters}>
        {[['all','Todos'],['completed','Completados'],['cancelled','Cancelados']].map(([v,l]) => (
          <TouchableOpacity key={v} style={[hs.fChip, filter === v && hs.fChipActive]} onPress={() => setFilter(v)}>
            <Text style={[hs.fChipTxt, filter === v && hs.fChipTxtActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList data={filtered} keyExtractor={i => i.id} contentContainerStyle={{ padding: Spacing.lg }}
        ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: Colors.border }} />}
        renderItem={({ item }) => (
          <View style={hs.item}>
            <View style={[hs.icon, item.status === 'cancelled' && hs.iconCancelled]}><Text style={{ fontSize: 18 }}>{item.status === 'cancelled' ? '✕' : '🚗'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={hs.route} numberOfLines={1}>{item.route}</Text>
              <Text style={hs.itemSub}>{item.driver}{item.rating ? ` · ⭐ ${item.rating}` : ''} · {item.km} km</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={hs.amount}>{item.amount}</Text>
              <Text style={hs.date}>{item.date}</Text>
              <View style={[hs.badge, item.status === 'cancelled' && hs.badgeDanger]}>
                <Text style={[hs.badgeTxt, item.status === 'cancelled' && hs.badgeDangerTxt]}>{item.status === 'completed' ? 'Completado' : 'Cancelado'}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};
const hs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  logo: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.accent, letterSpacing: -1 },
  hsub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  filters: { flexDirection: 'row', gap: 8, padding: Spacing.lg, borderBottomWidth: 0.5, borderColor: Colors.border },
  fChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radii.full, borderWidth: 0.5, borderColor: Colors.border },
  fChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  fChipTxt: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  fChipTxtActive: { color: Colors.accent },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  iconCancelled: { backgroundColor: Colors.dangerLight },
  route: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  itemSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  amount: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  date: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  badge: { backgroundColor: '#EAF3DE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  badgeTxt: { fontSize: 11, fontWeight: '500', color: '#27500A' },
  badgeDanger: { backgroundColor: Colors.dangerLight },
  badgeDangerTxt: { color: Colors.danger },
});

const METHODS = [
  { id: '1', label: 'Efectivo', sub: 'Pago directo al conductor', icon: '💵' },
  { id: '2', label: 'Visa ••••4521', sub: 'Vence 12/27', icon: '💳' },
  { id: '3', label: 'GO Wallet', sub: 'Saldo: $23.50', icon: '👜' },
  { id: '4', label: 'Mercado Pago', sub: 'Cuenta vinculada', icon: '🔵' },
];
export const PaymentScreen = () => {
  const [selected, setSelected] = useState('1');
  return (
    <SafeAreaView style={ps.safe} edges={['top']}>
      <View style={ps.header}><Text style={ps.logo}>GO</Text><Text style={ps.hsub}>Métodos de pago</Text></View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={ps.sLabel}>Métodos disponibles</Text>
        {METHODS.map(m => (
          <TouchableOpacity key={m.id} style={[ps.method, selected === m.id && ps.methodActive]} onPress={() => setSelected(m.id)}>
            <View style={[ps.radio, selected === m.id && ps.radioActive]}>{selected === m.id && <View style={ps.radioDot} />}</View>
            <View style={ps.mIcon}><Text style={{ fontSize: 20 }}>{m.icon}</Text></View>
            <View style={{ flex: 1 }}><Text style={ps.mLabel}>{m.label}</Text><Text style={ps.mSub}>{m.sub}</Text></View>
            {selected === m.id && <View style={ps.activeBadge}><Text style={ps.activeTxt}>Activo</Text></View>}
          </TouchableOpacity>
        ))}
        <Text style={ps.sLabel}>Resumen del mes</Text>
        <View style={ps.summaryCard}>
          <View style={ps.sRow}><Text style={ps.sRowLabel}>Total gastado</Text><Text style={ps.sRowVal}>$28.50</Text></View>
          <View style={ps.sRow}><Text style={ps.sRowLabel}>Viajes realizados</Text><Text style={ps.sRowVal}>5</Text></View>
          <View style={ps.progressBg}><View style={[ps.progressFill, { width: '57%' }]} /></View>
          <Text style={ps.progressTxt}>57% del límite mensual ($50)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const ps = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  logo: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.accent, letterSpacing: -1 },
  hsub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  sLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, marginTop: 8 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, marginBottom: 8 },
  methodActive: { borderColor: Colors.primary, backgroundColor: Colors.background },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  mIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  mLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  mSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  activeBadge: { backgroundColor: '#EAF3DE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activeTxt: { fontSize: 11, fontWeight: '500', color: '#27500A' },
  summaryCard: { backgroundColor: Colors.background, borderRadius: Radii.lg, padding: Spacing.lg },
  sRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sRowLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sRowVal: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '500' },
  progressBg: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  progressTxt: { fontSize: FontSize.xs, color: Colors.textSecondary },
});

const MENU = [['Métodos de pago','Efectivo · Tarjeta · Wallet'],['Historial de viajes','Ver todos mis viajes'],['Seguridad','Contactos de emergencia · PIN'],['Notificaciones','Push · Email · SMS'],['Soporte','Chat en vivo · Ayuda'],['Acerca de GO','Versión 1.0.0']];

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, switchRole } = useAuth();
  const initials = `${user?.name?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const isDriver = user?.role === 'driver';

  const handleSwitchRole = () => {
    Alert.alert(
      isDriver ? 'Cambiar a Pasajero' : 'Cambiar a Conductor',
      isDriver ? '¿Quieres cambiar al modo pasajero?' : '¿Quieres cambiar al modo conductor?',
      [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cambiar', onPress: switchRole }]
    );
  };

  return (
    <SafeAreaView style={prs.safe} edges={['top']}>
      <View style={prs.header}>
        <Text style={prs.logo}>GO</Text>
        <TouchableOpacity onPress={() => Alert.alert('Cerrar sesión', '¿Seguro?', [{ text: 'Cancelar' }, { text: 'Salir', onPress: logout }])}>
          <Text style={prs.logoutHdr}>Salir</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}>
        <View style={prs.center}>
          <View style={prs.av}><Text style={prs.avTxt}>{initials}</Text></View>
          <Text style={prs.name}>{user?.name} {user?.lastName}</Text>
          <Text style={prs.contact}>{user?.phone}</Text>
          <Text style={prs.rating}>⭐ {(user?.rating ?? 5).toFixed(1)} · {user?.totalTrips ?? 0} viajes</Text>
        </View>
        <TouchableOpacity style={prs.switchCard} onPress={handleSwitchRole}>
          <View style={prs.switchLeft}>
            <Text style={prs.switchIcon}>{isDriver ? '🚗' : '🧍'}</Text>
            <View>
              <Text style={prs.switchLabel}>Modo actual: {isDriver ? 'Conductor' : 'Pasajero'}</Text>
              <Text style={prs.switchSub}>Toca para cambiar a {isDriver ? 'Pasajero' : 'Conductor'}</Text>
            </View>
          </View>
          <View style={prs.switchBadge}><Text style={prs.switchBadgeTxt}>{isDriver ? '→ Pasajero' : '→ Conductor'}</Text></View>
        </TouchableOpacity>
        <View style={prs.statsRow}>
          {[[String(user?.totalTrips ?? 0),'Viajes'],[(user?.rating ?? 5).toFixed(1),'Calificación'],['$28.50','Este mes']].map(([v,l]) => (
            <View key={l} style={prs.statCard}><Text style={prs.statVal}>{v}</Text><Text style={prs.statLabel}>{l}</Text></View>
          ))}
        </View>
        <View style={prs.menuCard}>
          {MENU.map(([label, sub], i) => (
            <TouchableOpacity key={label} style={[prs.menuRow, i < MENU.length - 1 && prs.menuBorder]} onPress={() => {
              if (label === 'Historial de viajes') navigation.navigate('History');
              if (label === 'Métodos de pago') navigation.navigate('Payment');
              if (label === 'Seguridad') navigation.navigate('Security');
              if (label === 'Notificaciones') navigation.navigate('Notifications');
              if (label === 'Soporte') navigation.navigate('Support');
              if (label === 'Acerca de GO') navigation.navigate('About');
            }}>
              <View style={{ flex: 1 }}><Text style={prs.menuLabel}>{label}</Text><Text style={prs.menuSub}>{sub}</Text></View>
              <Text style={prs.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={prs.logoutBtn} onPress={() => Alert.alert('Cerrar sesión', '¿Seguro?', [{ text: 'Cancelar' }, { text: 'Salir', onPress: logout }])}>
          <Text style={prs.logoutTxt}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const prs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.accent, letterSpacing: -1 },
  logoutHdr: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.5)' },
  center: { alignItems: 'center', marginBottom: Spacing.xl },
  av: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avTxt: { fontSize: 30, fontWeight: '700', color: Colors.primary },
  name: { fontSize: FontSize.xl, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4 },
  contact: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6 },
  rating: { fontSize: FontSize.base, color: Colors.textPrimary },
  switchCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.xl },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchIcon: { fontSize: 28 },
  switchLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.white },
  switchSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  switchBadge: { backgroundColor: Colors.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  switchBadgeTxt: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.xl },
  statCard: { flex: 1, backgroundColor: Colors.background, borderRadius: Radii.md, padding: 12, alignItems: 'center' },
  statVal: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  menuCard: { backgroundColor: Colors.white, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  menuBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  menuLabel: { fontSize: FontSize.base, color: Colors.textPrimary },
  menuSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 20, color: Colors.textTertiary },
  logoutBtn: { borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, padding: 14, alignItems: 'center' },
  logoutTxt: { fontSize: FontSize.base, color: Colors.textPrimary },
});