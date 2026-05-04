import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

interface Place {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
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
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: `${text}, El Salvador`,
          format: 'json',
          limit: 8,
          countrycodes: 'sv',
        },
        headers: { 'Accept-Language': 'es' },
      });
      setResults(response.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectPlace = (place: Place) => {
    if (route.params?.onSelect) {
      route.params.onSelect({
        address: place.display_name.split(',').slice(0, 2).join(','),
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
      });
    }
    navigation.goBack();
  };

  const RECIENTES = [
    { id: 'r1', name: 'Metrocentro', sub: 'San Salvador' },
    { id: 'r2', name: 'Aeropuerto Internacional', sub: 'San Luis Talpa' },
    { id: 'r3', name: 'Plaza Mundo', sub: 'Soyapango' },
    { id: 'r4', name: 'Galerías Escalón', sub: 'San Salvador' },
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
            placeholder="Buscar destino..."
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
                route.params.onSelect({ address: r.name, latitude: 13.6929, longitude: -89.2182 });
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
          keyExtractor={item => item.place_id}
          contentContainerStyle={{ padding: Spacing.lg }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={s.resultItem} onPress={() => selectPlace(item)}>
              <View style={s.resultIcon}><Text style={{ fontSize: 18 }}>📍</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.resultName} numberOfLines={1}>
                  {item.display_name.split(',')[0]}
                </Text>
                <Text style={s.resultSub} numberOfLines={1}>
                  {item.display_name.split(',').slice(1, 3).join(',')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: Colors.border }} />}
        />
      )}

      {query.length >= 3 && !loading && results.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🔍</Text>
          <Text style={s.emptyTxt}>No encontramos "{query}"</Text>
          <Text style={s.emptySub}>Intenta con otro nombre o dirección</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 0.5, borderColor: Colors.border, gap: 10 },
  backBtn: { padding: 4 },
  backTxt: { fontSize: 22, color: Colors.primary },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: Radii.lg, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 0.5, borderColor: Colors.border },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  clearBtn: { fontSize: 14, color: Colors.textTertiary, padding: 2 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.lg },
  loadingTxt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  section: { padding: Spacing.lg },
  sectionLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: Colors.border },
  recentIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  recentName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  recentSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  resultIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  resultName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  resultSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 14 },
  emptyTxt: { fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary },
});