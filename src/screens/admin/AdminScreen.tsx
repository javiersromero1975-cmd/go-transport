import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

const ADMIN_PIN = '1975';

export const AdminScreen = ({ navigation }: any) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (unlocked) loadPending(); }, [unlocked]);

  const loadPending = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('id, name, lastName, phone, membership_plan, membership_expires_at, membership_status')
        .eq('membership_status', 'pending_cash');
      setPending(data ?? []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    if (pin === ADMIN_PIN) setUnlocked(true);
    else Alert.alert('PIN incorrecto');
    setPin('');
  };

  const approvePayment = async (userId: string) => {
    try {
      await supabase.from('usuarios').update({ membership_status: 'active' }).eq('id', userId);
      Alert.alert('✅ Pago confirmado', 'La membresía quedó activa.');
      loadPending();
    } catch {
      Alert.alert('Error', 'No se pudo confirmar el pago.');
    }
  };

  const rejectPayment = async (userId: string) => {
    try {
      await supabase.from('usuarios').update({ membership_status: 'inactive', membership_expires_at: null }).eq('id', userId);
      Alert.alert('❌ Pago rechazado');
      loadPending();
    } catch {
      Alert.alert('Error', 'No se pudo rechazar el pago.');
    }
  };

  if (!unlocked) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.lockWrap}>
          <Text style={{ fontSize: 48, marginBottom: 20 }}>🔒</Text>
          <Text style={s.lockTitle}>Panel de administrador</Text>
          <Text style={s.lockSub}>Ingresa el PIN para continuar</Text>
          <TextInput
            style={s.pinInput}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            placeholder="••••"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
          />
          <TouchableOpacity style={s.btnPrimary} onPress={handleUnlock}>
            <Text style={s.btnPrimaryTxt}>Desbloquear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.cancelTxt}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Pagos en efectivo pendientes</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: Spacing.lg }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: Colors.textSecondary }}>No hay pagos pendientes</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.cardName}>{item.name} {item.lastName}</Text>
              <Text style={s.cardSub}>{item.phone}</Text>
              <Text style={s.cardSub}>Plan: {item.membership_plan} · Vence: {item.membership_expires_at ? new Date(item.membership_expires_at).toLocaleDateString('es-SV') : '-'}</Text>
              <View style={s.cardBtns}>
                <TouchableOpacity style={s.rejectBtn} onPress={() => rejectPayment(item.id)}>
                  <Text style={s.rejectTxt}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.approveBtn} onPress={() => approvePayment(item.id)}>
                  <Text style={s.approveTxt}>✅ Confirmar pago</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  lockTitle: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  lockSub: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: 24 },
  pinInput: { fontSize: 32, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: Colors.primary, width: 160, marginBottom: 24, color: Colors.textPrimary, letterSpacing: 8 },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: Radii.lg, paddingHorizontal: 32, paddingVertical: 14, marginBottom: 16 },
  btnPrimaryTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.accent },
  cancelTxt: { fontSize: FontSize.base, color: Colors.textSecondary },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { fontSize: 22, color: Colors.white },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.white },
  card: { backgroundColor: Colors.background, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.border },
  cardName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 2 },
  cardBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rejectBtn: { flex: 1, paddingVertical: 12, borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.danger, alignItems: 'center' },
  rejectTxt: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: '500' },
  approveBtn: { flex: 2, paddingVertical: 12, borderRadius: Radii.md, backgroundColor: Colors.primary, alignItems: 'center' },
  approveTxt: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '600' },
});