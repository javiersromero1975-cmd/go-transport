import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

const DocumentCard = ({ title, subtitle, icon, imageUri, onPress, uploaded }: any) => (
  <TouchableOpacity style={[dc.card, uploaded && dc.cardDone]} onPress={onPress}>
    <View style={dc.cardLeft}>
      <Text style={{ fontSize: 32 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={dc.cardTitle}>{title}</Text>
        <Text style={dc.cardSub}>{uploaded ? '✅ Subido correctamente' : subtitle}</Text>
      </View>
    </View>
    {imageUri ? (
      <Image source={{ uri: imageUri }} style={dc.thumb} />
    ) : (
      <View style={dc.uploadBtn}>
        <Text style={dc.uploadTxt}>📷</Text>
      </View>
    )}
  </TouchableOpacity>
);

const dc = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: 12 },
  cardDone: { borderColor: Colors.success, backgroundColor: Colors.successLight },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  cardSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  thumb: { width: 56, height: 56, borderRadius: Radii.md, borderWidth: 0.5, borderColor: Colors.border },
  uploadBtn: { width: 48, height: 48, borderRadius: Radii.md, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: Colors.border },
  uploadTxt: { fontSize: 22 },
});

export const VerificationScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [dui, setDui] = useState<string | null>(null);
  const [license, setLicense] = useState<string | null>(null);
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const pickImage = async (setter: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!dui || !license || !vehiclePhoto) {
      Alert.alert('Faltan documentos', 'Por favor sube todos los documentos requeridos.');
      return;
    }
    setSubmitting(true);
    try {
      await AsyncStorage.setItem(`verification_${user?.id}`, JSON.stringify({
        dui, license, vehiclePhoto, status: 'pending', submittedAt: new Date().toISOString()
      }));
      setSubmitted(true);
    } catch {
      Alert.alert('Error', 'No se pudieron enviar los documentos. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.successWrap}>
        <Text style={{ fontSize: 64, marginBottom: 20 }}>⏳</Text>
        <Text style={s.successTitle}>Documentos enviados</Text>
        <Text style={s.successSub}>Revisaremos tus documentos en un plazo de 24-48 horas. Te notificaremos cuando tu cuenta sea aprobada.</Text>
        <View style={s.statusCard}>
          <View style={s.statusRow}><Text style={s.statusLabel}>Estado</Text><Text style={[s.statusVal, { color: Colors.warning }]}>⏳ En revisión</Text></View>
          <View style={s.statusRow}><Text style={s.statusLabel}>Enviado</Text><Text style={s.statusVal}>{new Date().toLocaleDateString('es-SV')}</Text></View>
          <View style={s.statusRow}><Text style={s.statusLabel}>Estimado</Text><Text style={s.statusVal}>24-48 horas</Text></View>
        </View>
        <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.goBack()}>
          <Text style={s.btnPrimaryTxt}>Volver al perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Verificación de conductor</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <View style={s.banner}>
          <Text style={{ fontSize: 32 }}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.bannerTitle}>Verifica tu identidad</Text>
            <Text style={s.bannerSub}>Para garantizar la seguridad de los pasajeros necesitamos verificar tus documentos.</Text>
          </View>
        </View>

        <Text style={s.sLabel}>Documentos requeridos</Text>
        <DocumentCard
          title="DUI"
          subtitle="Foto frontal de tu DUI"
          icon="🪪"
          imageUri={dui}
          uploaded={!!dui}
          onPress={() => pickImage(setDui)}
        />
        <DocumentCard
          title="Licencia de conducir"
          subtitle="Foto de tu licencia vigente"
          icon="🚗"
          imageUri={license}
          uploaded={!!license}
          onPress={() => pickImage(setLicense)}
        />
        <DocumentCard
          title="Foto del vehículo"
          subtitle="Foto exterior de tu vehículo"
          icon="📸"
          imageUri={vehiclePhoto}
          uploaded={!!vehiclePhoto}
          onPress={() => pickImage(setVehiclePhoto)}
        />

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>ℹ️ ¿Qué sucede después?</Text>
          <Text style={s.infoTxt}>1. Enviamos tus documentos para revisión</Text>
          <Text style={s.infoTxt}>2. Nuestro equipo los verifica en 24-48 horas</Text>
          <Text style={s.infoTxt}>3. Recibirás una notificación con el resultado</Text>
          <Text style={s.infoTxt}>4. Una vez aprobado, podrás recibir viajes</Text>
        </View>

        <TouchableOpacity
          style={[s.btnPrimary, (!dui || !license || !vehiclePhoto || submitting) && s.btnDisabled]}
          onPress={handleSubmit}
          disabled={!dui || !license || !vehiclePhoto || submitting}
        >
          {submitting ? <ActivityIndicator color={Colors.accent} /> : <Text style={s.btnPrimaryTxt}>Enviar documentos →</Text>}
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
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: Colors.infoLight, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 0.5, borderColor: Colors.info },
  bannerTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.info, marginBottom: 4 },
  bannerSub: { fontSize: FontSize.sm, color: Colors.info, lineHeight: 18 },
  sLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  infoCard: { backgroundColor: Colors.background, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.xl, borderWidth: 0.5, borderColor: Colors.border },
  infoTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary, marginBottom: 10 },
  infoTxt: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, lineHeight: 18 },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: 15, alignItems: 'center', marginBottom: 32 },
  btnPrimaryTxt: { fontSize: FontSize.md, fontWeight: '600', color: Colors.accent },
  btnDisabled: { opacity: 0.5 },
  successWrap: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  successSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  statusCard: { width: '100%', backgroundColor: Colors.background, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.xl },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statusLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statusVal: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '500' },
});