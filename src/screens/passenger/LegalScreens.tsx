import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing } from '../../theme';

export const TermsScreen = ({ navigation }: any) => (
  <SafeAreaView style={s.safe} edges={['top']}>
    <View style={s.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
      <Text style={s.title}>Términos y Condiciones</Text>
    </View>
    <ScrollView contentContainerStyle={s.scroll}>
      <Text style={s.lastUpdate}>Última actualización: 1 de mayo de 2025</Text>
      <Text style={s.sectionTitle}>1. Aceptación de los términos</Text>
      <Text style={s.body}>Al usar la aplicación GO, aceptas estos términos y condiciones. Si no estás de acuerdo, no uses la app.</Text>
      <Text style={s.sectionTitle}>2. Descripción del servicio</Text>
      <Text style={s.body}>GO es una plataforma de transporte que conecta pasajeros con conductores independientes en El Salvador. GO no es una empresa de transporte, sino una plataforma tecnológica.</Text>
      <Text style={s.sectionTitle}>3. Registro de usuarios</Text>
      <Text style={s.body}>Para usar GO debes registrarte con información verídica. Eres responsable de mantener la confidencialidad de tu cuenta. Debes ser mayor de 18 años para registrarte como conductor.</Text>
      <Text style={s.sectionTitle}>4. Tarifas y pagos</Text>
      <Text style={s.body}>Las tarifas son acordadas entre pasajero y conductor. GO no fija precios, pero puede sugerir rangos de referencia. El pasajero puede hacer una oferta y el conductor puede aceptarla, rechazarla o hacer una contraoferta.</Text>
      <Text style={s.sectionTitle}>5. Cancelaciones</Text>
      <Text style={s.body}>Tanto pasajeros como conductores pueden cancelar viajes. Cancelaciones frecuentes pueden afectar la calificación del usuario.</Text>
      <Text style={s.sectionTitle}>6. Comportamiento del usuario</Text>
      <Text style={s.body}>Los usuarios deben comportarse con respeto. GO puede suspender o eliminar cuentas por comportamiento inapropiado, fraude, o violación de estos términos.</Text>
      <Text style={s.sectionTitle}>7. Responsabilidad</Text>
      <Text style={s.body}>GO no se hace responsable por accidentes, pérdidas o daños ocurridos durante los viajes. Los conductores son responsables de mantener su vehículo en condiciones seguras.</Text>
      <Text style={s.sectionTitle}>8. Contacto</Text>
      <Text style={s.body}>Para consultas sobre estos términos: legal@goapp.sv</Text>
      <View style={s.footer}><Text style={s.footerTxt}>© 2025 GO Transport El Salvador</Text></View>
    </ScrollView>
  </SafeAreaView>
);

export const PrivacyScreen = ({ navigation }: any) => (
  <SafeAreaView style={s.safe} edges={['top']}>
    <View style={s.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
      <Text style={s.title}>Política de Privacidad</Text>
    </View>
    <ScrollView contentContainerStyle={s.scroll}>
      <Text style={s.lastUpdate}>Última actualización: 1 de mayo de 2025</Text>
      <Text style={s.sectionTitle}>1. Información que recopilamos</Text>
      <Text style={s.body}>Recopilamos: nombre, teléfono, correo electrónico, ubicación GPS durante los viajes, historial de viajes, información del vehículo (conductores) y calificaciones.</Text>
      <Text style={s.sectionTitle}>2. Cómo usamos tu información</Text>
      <Text style={s.body}>Usamos tu información para conectarte con conductores o pasajeros, procesar pagos, mejorar nuestro servicio, enviarte notificaciones importantes y garantizar la seguridad en la plataforma.</Text>
      <Text style={s.sectionTitle}>3. Compartir información</Text>
      <Text style={s.body}>Compartimos información limitada entre pasajeros y conductores para facilitar los viajes. No vendemos tu información personal a terceros.</Text>
      <Text style={s.sectionTitle}>4. Ubicación</Text>
      <Text style={s.body}>Usamos tu ubicación GPS para mostrarte conductores cercanos y rastrear viajes en curso. Solo accedemos a tu ubicación cuando la app está en uso.</Text>
      <Text style={s.sectionTitle}>5. Seguridad</Text>
      <Text style={s.body}>Protegemos tu información con medidas de seguridad estándar de la industria. Te recomendamos usar contraseñas seguras y no compartir tu cuenta.</Text>
      <Text style={s.sectionTitle}>6. Tus derechos</Text>
      <Text style={s.body}>Tienes derecho a acceder, corregir, eliminar tu información y exportar tus datos. Contáctanos para ejercer estos derechos.</Text>
      <Text style={s.sectionTitle}>7. Contacto</Text>
      <Text style={s.body}>📧 privacidad@goapp.sv{'\n'}📍 San Salvador, El Salvador</Text>
      <View style={s.footer}><Text style={s.footerTxt}>© 2025 GO Transport El Salvador</Text></View>
    </ScrollView>
  </SafeAreaView>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { fontSize: 22, color: Colors.white },
  title: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.white, flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  lastUpdate: { fontSize: FontSize.sm, color: Colors.textTertiary, marginBottom: Spacing.xl, fontStyle: 'italic' },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, marginTop: Spacing.lg },
  body: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
  footer: { alignItems: 'center', marginTop: 40, paddingTop: Spacing.xl, borderTopWidth: 0.5, borderColor: Colors.border },
  footerTxt: { fontSize: FontSize.xs, color: Colors.textTertiary },
});