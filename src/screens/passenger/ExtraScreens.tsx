import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Radii, setDarkMode, Spacing } from '../../theme';

export const SecurityScreen = ({ navigation }: any) => {
  const [pin, setPin] = useState('');
  const [contacts, setContacts] = useState([
    { id: '1', name: 'María García', phone: '+503 7111-1111', relation: 'Mamá' },
    { id: '2', name: 'Carlos López', phone: '+503 7222-2222', relation: 'Hermano' },
  ]);
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>Seguridad</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <View style={s.banner}>
          <Text style={{ fontSize: 32 }}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.bannerTitle}>Tu seguridad es prioridad</Text>
            <Text style={s.bannerSub}>GO monitorea tus viajes en tiempo real</Text>
          </View>
        </View>
        <Text style={s.sLabel}>PIN de seguridad</Text>
        <View style={s.card}>
          <Text style={s.cardDesc}>Configura un PIN de 4 dígitos para proteger tu cuenta</Text>
          <View style={s.pinRow}>
            {[0,1,2,3].map(i => (
              <View key={i} style={[s.pinBox, pin.length > i && s.pinFilled]}>
                <Text style={s.pinDot}>{pin.length > i ? '●' : ''}</Text>
              </View>
            ))}
          </View>
          <View style={s.numPad}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((n, i) => (
              <TouchableOpacity key={i} style={[s.numBtn, !n && { opacity: 0 }]} onPress={() => {
                if (n === '⌫') setPin(p => p.slice(0, -1));
                else if (n && pin.length < 4) setPin(p => p + n);
              }}>
                <Text style={s.numTxt}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {pin.length === 4 && (
            <TouchableOpacity style={s.btnPrimary} onPress={() => { Alert.alert('PIN guardado'); setPin(''); }}>
              <Text style={s.btnPrimaryTxt}>Guardar PIN</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={s.sLabel}>Contactos de emergencia</Text>
        {contacts.map(c => (
          <View key={c.id} style={s.contactCard}>
            <View style={s.contactAv}><Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary }}>{c.name[0]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.contactName}>{c.name}</Text>
              <Text style={s.contactPhone}>{c.phone} · {c.relation}</Text>
            </View>
            <TouchableOpacity onPress={() => setContacts(prev => prev.filter(x => x.id !== c.id))}>
              <Text style={{ fontSize: 16, color: Colors.danger, padding: 4 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={s.addContact} onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}>
          <Text style={s.addContactTxt}>+ Agregar contacto de emergencia</Text>
        </TouchableOpacity>
        <Text style={s.sLabel}>Botón SOS</Text>
        <View style={s.card}>
          <Text style={s.cardDesc}>En emergencias, el botón SOS llamará al 911 y notificará a tus contactos con tu ubicación.</Text>
          <TouchableOpacity style={s.sosBtn} onPress={() => Linking.openURL('tel:911')}>
            <Text style={s.sosBtnTxt}>🆘 Probar SOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const NotificationsScreen = ({ navigation }: any) => {
  const [notifs, setNotifs] = useState({ push: true, email: true, sms: false, tripUpdates: true, promotions: false, security: true });
  const [darkMode, setDarkModeState] = useState(false);
  const toggle = (key: keyof typeof notifs) => setNotifs(p => ({ ...p, [key]: !p[key] }));

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(val => {
      if (val === 'true') setDarkModeState(true);
    });
  }, []);

  const handleDarkMode = async (val: boolean) => {
    setDarkModeState(val);
    setDarkMode(val);
    await AsyncStorage.setItem('darkMode', val ? 'true' : 'false');
    Alert.alert('Modo oscuro', val ? 'Modo oscuro activado ✅' : 'Modo claro activado ☀️');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>Notificaciones y Apariencia</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={s.sLabel}>Apariencia</Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.switchLabel}>🌙 Modo oscuro</Text>
              <Text style={s.switchSub}>Cambia la apariencia de la app</Text>
            </View>
            <Switch value={darkMode} onValueChange={handleDarkMode} trackColor={{ false: Colors.border, true: Colors.success }} thumbColor={Colors.white} />
          </View>
        </View>
        <Text style={s.sLabel}>Canales</Text>
        <View style={s.card}>
          {[['push','Notificaciones Push','Alertas en tu teléfono'],['email','Email','Recibos y actualizaciones'],['sms','SMS','Mensajes de texto']].map(([key, label, sub]) => (
            <View key={key} style={s.switchRow}>
              <View style={{ flex: 1 }}><Text style={s.switchLabel}>{label}</Text><Text style={s.switchSub}>{sub}</Text></View>
              <Switch value={notifs[key as keyof typeof notifs]} onValueChange={() => toggle(key as keyof typeof notifs)} trackColor={{ false: Colors.border, true: Colors.success }} thumbColor={Colors.white} />
            </View>
          ))}
        </View>
        <Text style={s.sLabel}>Tipos</Text>
        <View style={s.card}>
          {[['tripUpdates','Actualizaciones de viaje','Estado del conductor, llegada'],['promotions','Promociones','Descuentos y ofertas'],['security','Seguridad','Alertas de cuenta']].map(([key, label, sub]) => (
            <View key={key} style={s.switchRow}>
              <View style={{ flex: 1 }}><Text style={s.switchLabel}>{label}</Text><Text style={s.switchSub}>{sub}</Text></View>
              <Switch value={notifs[key as keyof typeof notifs]} onValueChange={() => toggle(key as keyof typeof notifs)} trackColor={{ false: Colors.border, true: Colors.success }} thumbColor={Colors.white} />
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.btnPrimary} onPress={() => Alert.alert('Guardado', 'Preferencias actualizadas')}>
          <Text style={s.btnPrimaryTxt}>Guardar preferencias</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export const SupportScreen = ({ navigation }: any) => {
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const FAQ = [
    { q: '¿Cómo funciona GO?', a: 'GO conecta pasajeros con conductores. Tú propones el precio y los conductores cercanos pueden aceptar.' },
    { q: '¿Cómo pago mi viaje?', a: 'Puedes pagar en efectivo, con PayPal o usando GO Wallet.' },
    { q: '¿Qué hago si olvidé algo?', a: 'Ve a historial, selecciona el viaje y contacta al conductor.' },
    { q: '¿Cómo cancelo un viaje?', a: 'Puedes cancelar antes de que el conductor llegue.' },
    { q: '¿Es seguro GO?', a: 'Todos los conductores pasan verificación de identidad. Tienes botón SOS en cada viaje.' },
  ];
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>Soporte</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <View style={s.contactRow}>
          <TouchableOpacity style={s.contactBtn} onPress={() => Linking.openURL('tel:+50322220000')}><Text style={{ fontSize: 28, marginBottom: 6 }}>📞</Text><Text style={s.contactBtnLabel}>Llamar</Text></TouchableOpacity>
          <TouchableOpacity style={s.contactBtn} onPress={() => Linking.openURL('mailto:soporte@goapp.sv')}><Text style={{ fontSize: 28, marginBottom: 6 }}>📧</Text><Text style={s.contactBtnLabel}>Email</Text></TouchableOpacity>
          <TouchableOpacity style={s.contactBtn} onPress={() => Linking.openURL('https://wa.me/50322220000')}><Text style={{ fontSize: 28, marginBottom: 6 }}>💬</Text><Text style={s.contactBtnLabel}>WhatsApp</Text></TouchableOpacity>
        </View>
        <Text style={s.sLabel}>Enviar mensaje</Text>
        <View style={s.card}>
          <TextInput style={s.msgInput} placeholder="Describe tu problema..." placeholderTextColor={Colors.textTertiary} value={message} onChangeText={setMessage} multiline numberOfLines={4} textAlignVertical="top" />
          <TouchableOpacity style={[s.btnPrimary, !message && { opacity: 0.5 }]} disabled={!message} onPress={() => { Alert.alert('Enviado', 'Te responderemos en 24 horas.'); setMessage(''); }}>
            <Text style={s.btnPrimaryTxt}>Enviar mensaje</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.sLabel}>Preguntas frecuentes</Text>
        {FAQ.map((item, i) => (
          <TouchableOpacity key={i} style={s.faqItem} onPress={() => setExpanded(expanded === i ? null : i)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[s.switchLabel, { flex: 1 }]}>{item.q}</Text>
              <Text style={{ fontSize: 12, color: Colors.textTertiary }}>{expanded === i ? '▲' : '▼'}</Text>
            </View>
            {expanded === i && <Text style={s.faqAnswer}>{item.a}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export const AboutScreen = ({ navigation }: any) => (
  <SafeAreaView style={s.safe} edges={['top']}>
    <View style={s.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
      <Text style={s.title}>Acerca de GO</Text>
    </View>
    <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Text style={{ fontSize: 64, fontWeight: '700', color: Colors.primary, letterSpacing: -3 }}>GO</Text>
        <Text style={{ fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: 8 }}>Tu viaje, tus condiciones.</Text>
        <Text style={{ fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 6 }}>Versión 1.0.0</Text>
      </View>
      <View style={s.card}>
        <Text style={s.switchLabel}>Nuestra misión</Text>
        <Text style={[s.faqAnswer, { marginTop: 6 }]}>GO nació en El Salvador para democratizar el transporte. Creemos que cada persona merece viajar seguro, a un precio justo.</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: Spacing.lg }}>
        {[['🇸🇻','El Salvador'],['24/7','Disponible'],['🔒','Seguro']].map(([v,l]) => (
          <View key={l} style={[s.card, { flex: 1, alignItems: 'center', marginBottom: 0 }]}>
            <Text style={{ fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary }}>{v}</Text>
            <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' }}>{l}</Text>
          </View>
        ))}
      </View>
      <Text style={s.sLabel}>Legal</Text>
      <View style={s.card}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: Colors.border }} onPress={() => navigation.navigate('Terms')}>
          <Text style={s.switchLabel}>Términos y condiciones</Text>
          <Text style={{ fontSize: 20, color: Colors.textTertiary }}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }} onPress={() => navigation.navigate('Privacy')}>
          <Text style={s.switchLabel}>Política de privacidad</Text>
          <Text style={{ fontSize: 20, color: Colors.textTertiary }}>›</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.sLabel}>Contacto</Text>
      <View style={s.card}>
        {['🌐 goapp.sv','📧 hola@goapp.sv','📞 +503 2222-0000','📍 San Salvador, El Salvador'].map(t => (
          <Text key={t} style={[s.faqAnswer, { paddingVertical: 5 }]}>{t}</Text>
        ))}
      </View>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'center', marginTop: 8, marginBottom: 32 }}>© 2025 GO Transport. Todos los derechos reservados.</Text>
    </ScrollView>
  </SafeAreaView>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { fontSize: 22, color: Colors.white },
  title: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.white },
  sLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  card: { backgroundColor: Colors.white, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  cardDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.successLight, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 0.5, borderColor: Colors.successBorder },
  bannerTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.success },
  bannerSub: { fontSize: FontSize.sm, color: Colors.success, marginTop: 2 },
  pinRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: Spacing.lg },
  pinBox: { width: 48, height: 56, borderRadius: Radii.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  pinFilled: { borderColor: Colors.primary, backgroundColor: Colors.white },
  pinDot: { fontSize: 20, color: Colors.primary },
  numPad: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: Spacing.md },
  numBtn: { width: 64, height: 56, borderRadius: Radii.md, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  numTxt: { fontSize: FontSize.xl, fontWeight: '500', color: Colors.textPrimary },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: 14, alignItems: 'center' },
  btnPrimaryTxt: { fontSize: FontSize.base, fontWeight: '600', color: Colors.accent },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md, backgroundColor: Colors.white, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, marginBottom: 8 },
  contactAv: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  contactName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  contactPhone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  addContact: { borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, padding: 14, alignItems: 'center', marginBottom: Spacing.lg },
  addContactTxt: { fontSize: FontSize.base, color: Colors.info },
  sosBtn: { backgroundColor: Colors.dangerLight, borderRadius: Radii.lg, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.dangerBorder },
  sosBtnTxt: { fontSize: FontSize.base, fontWeight: '600', color: Colors.danger },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  switchLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  switchSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  contactBtn: { flex: 1, backgroundColor: Colors.background, borderRadius: Radii.lg, padding: 16, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.border },
  contactBtnLabel: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '500' },
  msgInput: { borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.md, padding: Spacing.md, fontSize: FontSize.base, color: Colors.textPrimary, minHeight: 100, backgroundColor: Colors.background, marginBottom: Spacing.md },
  faqItem: { backgroundColor: Colors.white, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: 8 },
  faqAnswer: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 10, lineHeight: 20 },
});