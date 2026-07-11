import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCABVASK1gEU1Fa0VUGHoGiOQclgVU0buk';

interface Place {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const SearchDestinationScreen = ({ navigation, route }: any) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (text: string) => {
    setQuery(text);
    if (text.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&components=country:sv&language=es&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      console.log('PLACES API:', JSON.stringify(data));
      setResults(data.predictions ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectPlace = async (place: Place) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      const location = data.result?.geometry?.location;
      if (route.params?.onSelect && location) {
        route.params.onSelect({
          address: place.structured_formatting.main_text,
          latitude: location.lat,
          longitude: location.lng,
        });
      }
    } catch {}
    navigation.goBack();
  };

  const RECIENTES = [
    { id: 'r1', name: 'Metrocentro', sub: 'San Salvador', lat: 13.6929, lng: -89.2182 },
    { id: 'r2', name: 'Aeropuerto Internacional', sub: 'San Luis Talpa', lat: 13.4409, lng: -89.0556 },
    { id: 'r3', name: 'Plaza Mundo', sub: 'Soyapango', lat: 13.7058, lng: -89.1517 },
    { id: 'r4', name: 'Galerías Escalón', sub: 'San Salvador', lat: 13.7011, lng: -89.2289 },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.inputWrap}>
          <Text style={s.inputIcon}>🔍</Text>
          <TextInput
            style={s.input}
            placeholder={route.params?.placeholder ?? 'Buscar destino...'}
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={search}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && (
        <View style={s.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={s.loadingTxt}>Buscando...</Text>
        </View>
      )}

      {query.length === 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Destinos recientes</Text>
          {RECIENTES.map(r => (
            <TouchableOpacity key={r.id} style={s.recentItem} onPress={() => {
              if (route.params?.onSelect) {
                route.params.onSelect({ address: r.name, latitude: r.lat, longitude: r.lng });
              }
              navigation.goBack();
            }}>
              <View style={s.recentIcon}><Text style={{ fontSize: 16 }}>🕐</Text></View>
              <View>
                <Text style={s.recentName}>{r.name}</Text>
                <Text style={s.recentSub}>{r.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={i => i.place_id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={s.resultItem} onPress={() => selectPlace(item)}>
              <Text style={s.resultIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.resultMain}>{item.structured_formatting.main_text}</Text>
                <Text style={s.resultSub}>{item.structured_formatting.secondary_text}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 0.5, borderColor: Colors.border, gap: 10 },
  backBtn: { padding: 4 },
  backTxt: { fontSize: 22, color: Colors.primary },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: Radii.lg, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 0.5, borderColor: Colors.border, gap: 8 },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  clearBtn: { fontSize: 16, color: Colors.textTertiary, padding: 4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 8 },
  loadingTxt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  section: { padding: Spacing.lg },
  sectionLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 0.5, borderColor: Colors.border },
  recentIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  recentName: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  recentSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 0.5, borderColor: Colors.border, gap: 12 },
  resultIcon: { fontSize: 18 },
  resultMain: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  resultSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});