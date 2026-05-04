import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>('passenger');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', lastName: '', phone: '', email: '', password: '', vehicleModel: '', vehiclePlate: '', vehicleColor: '' });
  const set = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.password) { Alert.alert('Completa los campos requeridos'); return; }
    setLoading(true);
    try { await register({ ...form, role }); }
    catch { Alert.alert('Error al registrarse'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
            <Text style={s.logo}>GO</Text>
          </View>
          <Text style={s.title}>Crear cuenta</Text>
          <View style={s.roleRow}>
            {(['passenger', 'driver'] as UserRole[]).map(r => (
              <TouchableOpacity key={r} style={[s.roleBtn, role === r && s.roleBtnActive]} onPress={() => setRole(r)}>
                <Text style={[s.roleTxt, role === r && s.roleTxtActive]}>{r === 'passenger' ? 'Pasajero' : 'Conductor'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.row}>
            <View style={{ flex: 1 }}><Text style={s.label}>Nombre *</Text><TextInput style={s.input} placeholder="Juan" placeholderTextColor={Colors.textTertiary} value={form.name} onChangeText={set('name')} /></View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}><Text style={s.label}>Apellido</Text><TextInput style={s.input} placeholder="Martínez" placeholderTextColor={Colors.textTertiary} value={form.lastName} onChangeText={set('lastName')} /></View>
          </View>
          <Text style={s.label}>Teléfono *</Text>
          <TextInput style={s.input} placeholder="+503 7000-0000" placeholderTextColor={Colors.textTertiary} value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} placeholder="juan@email.com" placeholderTextColor={Colors.textTertiary} value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
          <Text style={s.label}>Contraseña *</Text>
          <TextInput style={s.input} placeholder="Mínimo 8 caracteres" placeholderTextColor={Colors.textTertiary} value={form.password} onChangeText={set('password')} secureTextEntry />
          {role === 'driver' && (<>
            <Text style={s.sectionLabel}>Vehículo</Text>
            <Text style={s.label}>Placa</Text><TextInput style={s.input} placeholder="P-1234" placeholderTextColor={Colors.textTertiary} value={form.vehiclePlate} onChangeText={set('vehiclePlate')} autoCapitalize="characters" />
            <Text style={s.label}>Modelo</Text><TextInput style={s.input} placeholder="Toyota Corolla 2020" placeholderTextColor={Colors.textTertiary} value={form.vehicleModel} onChangeText={set('vehicleModel')} />
            <Text style={s.label}>Color</Text><TextInput style={s.input} placeholder="Plateado" placeholderTextColor={Colors.textTertiary} value={form.vehicleColor} onChangeText={set('vehicleColor')} />
          </>)}
          <View style={s.safety}><View style={s.safetyDot} /><Text style={s.safetyTxt}>Verificaremos tu identidad para garantizar tu seguridad</Text></View>
          <TouchableOpacity style={s.btnPrimary} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.primary} /> : <Text style={s.btnPrimaryTxt}>Crear cuenta</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.xl },
  back: { fontSize: 22, color: Colors.primary },
  logo: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.primary, letterSpacing: -1 },
  title: { fontSize: FontSize.xl, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.xl },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.xl },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center' },
  roleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleTxt: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: '500' },
  roleTxtActive: { color: Colors.accent },
  row: { flexDirection: 'row' },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  input: { borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.md, padding: 13, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: 14 },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, marginTop: 4 },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EAF3DE', borderRadius: 10, padding: 10, borderWidth: 0.5, borderColor: '#C0DD97', marginBottom: 16 },
  safetyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B6D11' },
  safetyTxt: { fontSize: 11, color: '#27500A', flex: 1 },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: 15, alignItems: 'center' },
  btnPrimaryTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.accent },
});