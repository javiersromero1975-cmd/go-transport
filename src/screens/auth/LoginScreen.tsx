import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('passenger');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) { Alert.alert('Completa todos los campos'); return; }
    setLoading(true);
    try { await login(phone, password, role); }
    catch { Alert.alert('Error', 'Credenciales incorrectas'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.logo}>GO</Text>
          <Text style={s.tagline}>Tu viaje, tus condiciones.</Text>
          <View style={s.roleRow}>
            {(['passenger', 'driver'] as UserRole[]).map(r => (
              <TouchableOpacity key={r} style={[s.roleBtn, role === r && s.roleBtnActive]} onPress={() => setRole(r)}>
                <Text style={[s.roleTxt, role === r && s.roleTxtActive]}>{r === 'passenger' ? 'Pasajero' : 'Conductor'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>Teléfono o email</Text>
          <TextInput style={s.input} placeholder="+503 7000-0000" placeholderTextColor={Colors.textTertiary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Text style={s.label}>Contraseña</Text>
          <TextInput style={s.input} placeholder="••••••••" placeholderTextColor={Colors.textTertiary} value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={s.btnPrimary} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.accent} /> : <Text style={s.btnPrimaryTxt}>Iniciar sesión</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate('Register')}>
            <Text style={s.btnSecondaryTxt}>Crear cuenta nueva</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1, padding: Spacing.xl, paddingTop: 60 },
  logo: { fontSize: FontSize.display, fontWeight: '700', color: Colors.accent, letterSpacing: -3, marginBottom: 6 },
  tagline: { fontSize: FontSize.lg, color: 'rgba(255,255,255,0.6)', marginBottom: 40 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: Radii.md, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  roleBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  roleTxt: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  roleTxtActive: { color: Colors.primary },
  label: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: Radii.md, padding: 14, fontSize: FontSize.base, color: Colors.white, marginBottom: 16 },
  btnPrimary: { backgroundColor: Colors.accent, borderRadius: Radii.lg, padding: 15, alignItems: 'center', marginTop: 8 },
  btnPrimaryTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.primary },
  btnSecondary: { borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.lg, padding: 14, alignItems: 'center', marginTop: 10 },
  btnSecondaryTxt: { fontSize: FontSize.base, color: Colors.white },
});