import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { payWithPayPal } from '../../services/paypalService';
import { supabase } from '../../services/supabase';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

const PLANS = [
  { id: '3days', label: '3 días', price: 5, days: 3, sub: 'Ideal para probar' },
  { id: '10days', label: '10 días', price: 10, days: 10, sub: 'Más popular', popular: true },
  { id: '30days', label: '30 días', price: 25, days: 30, sub: 'Mejor precio por día' },
];

export const MembershipScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [selected, setSelected] = useState('10days');
  const [processing, setProcessing] = useState(false);
  const [currentExpiry, setCurrentExpiry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMembership(); }, []);

  const loadMembership = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('membership_expires_at, membership_status')
        .eq('id', user?.id)
        .single();
      if (data?.membership_expires_at) setCurrentExpiry(data.membership_expires_at);
    } catch {} finally {
      setLoading(false);
    }
  };

  const isActive = currentExpiry && new Date(currentExpiry) > new Date();
  const plan = PLANS.find(p => p.id === selected)!;

  const activateMembership = async (method: 'cash' | 'paypal') => {
    setProcessing(true);
    try {
      const baseDate = isActive ? new Date(currentExpiry!) : new Date();
      const expiresAt = new Date(baseDate.getTime() + plan.days * 24 * 60 * 60 * 1000);

      await supabase
        .from('usuarios')
        .update({
          membership_expires_at: expiresAt.toISOString(),
          membership_plan: plan.id,
          membership_status: method === 'cash' ? 'pending_cash' : 'active',
        })
        .eq('id', user?.id);

      updateUser({ membershipExpiresAt: expiresAt.toISOString(), membershipStatus: method === 'cash' ? 'pending_cash' : 'active' });
      setCurrentExpiry(expiresAt.toISOString());

      if (method === 'cash') {
        Alert.alert('💵 Recarga registrada', 'Tu recarga en efectivo quedó pendiente de confirmación. Coordina el pago con el administrador.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('✅ Membresía activada', `Tu membresía está activa hasta el ${expiresAt.toLocaleDateString('es-SV')}.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo procesar la recarga.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayPal = async () => {
    const success = await payWithPayPal(plan.price, `Membresía GO Driver - ${plan.label}`);
    if (success) await activateMembership('paypal');
  };

  const handleCash = () => {
    Alert.alert('💵 Pago en efectivo', `Vas a registrar una recarga de $${plan.price} (${plan.label}) como pago en efectivo. Esto quedará pendiente hasta que el administrador confirme el pago.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => activateMembership('cash') },
    ]);
  };

  if (loading) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Membresía de conductor</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <View style={[s.statusCard, isActive ? s.statusActive : s.statusInactive]}>
          <Text style={{ fontSize: 32 }}>{isActive ? '✅' : '⏳'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.statusTitle}>{isActive ? 'Membresía activa' : 'Sin membresía activa'}</Text>
            <Text style={s.statusSub}>
              {isActive
                ? `Vence el ${new Date(currentExpiry!).toLocaleDateString('es-SV')} a las ${new Date(currentExpiry!).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}`
                : 'No puedes recibir viajes hasta que actives una membresía'}
            </Text>
          </View>
        </View>

        <Text style={s.sLabel}>Elige tu plan</Text>
        {PLANS.map(p => (
          <TouchableOpacity key={p.id} style={[s.planCard, selected === p.id && s.planCardActive]} onPress={() => setSelected(p.id)}>
            {p.popular && <View style={s.popularBadge}><Text style={s.popularTxt}>Más elegido</Text></View>}
            <View style={s.planLeft}>
              <View style={[s.radio, selected === p.id && s.radioActive]}>{selected === p.id && <View style={s.radioDot} />}</View>
              <View>
                <Text style={s.planLabel}>{p.label}</Text>
                <Text style={s.planSub}>{p.sub}</Text>
              </View>
            </View>
            <Text style={s.planPrice}>${p.price}</Text>
          </TouchableOpacity>
        ))}

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>ℹ️ ¿Cómo funciona?</Text>
          <Text style={s.infoTxt}>• Pagas un monto fijo por días de acceso, no por comisión</Text>
          <Text style={s.infoTxt}>• Durante ese tiempo puedes recibir todos los viajes que quieras</Text>
          <Text style={s.infoTxt}>• Al vencer, debes recargar para seguir recibiendo viajes</Text>
          <Text style={s.infoTxt}>• Si recargas antes de vencer, los días se suman a tu membresía actual</Text>
        </View>

        <TouchableOpacity style={[s.btnPrimary, processing && s.btnDisabled]} onPress={handlePayPal} disabled={processing}>
          {processing ? <ActivityIndicator color={Colors.accent} /> : <Text style={s.btnPrimaryTxt}>💳 Pagar ${plan.price} con PayPal</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[s.btnSecondary, processing && s.btnDisabled]} onPress={handleCash} disabled={processing}>
          <Text style={s.btnSecondaryTxt}>💵 Pagar ${plan.price} en efectivo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { fontSize: 22, color: Colors.white },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.white },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.xl, borderWidth: 0.5 },
  statusActive: { backgroundColor: '#EAF3DE', borderColor: '#C0DD97' },
  statusInactive: { backgroundColor: '#FFF3E0', borderColor: '#FFD699' },
  statusTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  statusSub: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  sLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  planCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: 10, position: 'relative' },
  planCardActive: { borderColor: Colors.primary, backgroundColor: Colors.background },
  popularBadge: { position: 'absolute', top: -10, left: 14, backgroundColor: Colors.accent, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  popularTxt: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.primary },
  planLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  planSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  planPrice: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.primary },
  infoCard: { backgroundColor: Colors.background, borderRadius: Radii.lg, padding: Spacing.lg, marginVertical: Spacing.lg, borderWidth: 0.5, borderColor: Colors.border },
  infoTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary, marginBottom: 10 },
  infoTxt: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, lineHeight: 18 },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: 15, alignItems: 'center', marginBottom: 10 },
  btnPrimaryTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.accent },
  btnSecondary: { borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, padding: 14, alignItems: 'center', marginBottom: 32 },
  btnSecondaryTxt: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  btnDisabled: { opacity: 0.5 },
});