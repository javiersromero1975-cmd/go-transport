import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

export const ChatScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const viajeId = route?.params?.viajeId ?? 'demo-trip-001';
  const otherName = route?.params?.otherName ?? 'Conductor';

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel(`chat-${viajeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `viaje_id=eq.${viajeId}` },
        (payload) => setMessages(prev => [...prev, payload.new]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [viajeId]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .eq('viaje_id', viajeId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    await supabase.from('mensajes').insert([{
      viaje_id: viajeId,
      sender_id: user?.id ?? 'demo',
      sender_role: user?.role ?? 'passenger',
      mensaje: msg,
      leido: false,
    }]);
  };

  const isMe = (msg: any) => msg.sender_id === (user?.id ?? 'demo');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <View style={s.headerAv}><Text style={s.headerAvTxt}>{otherName[0]}</Text></View>
          <View>
            <Text style={s.headerName}>{otherName}</Text>
            <Text style={s.headerSub}>En viaje · En línea</Text>
          </View>
        </View>
        <TouchableOpacity style={s.callBtn}>
          <Text style={{ fontSize: 20 }}>📞</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 16 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              ListEmptyComponent={
                <View style={s.empty}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
                  <Text style={s.emptyTitle}>Inicia la conversación</Text>
                  <Text style={s.emptySub}>Los mensajes son privados entre tú y {otherName}</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={[s.msgWrap, isMe(item) ? s.msgWrapMe : s.msgWrapOther]}>
                  <View style={[s.bubble, isMe(item) ? s.bubbleMe : s.bubbleOther]}>
                    <Text style={[s.bubbleTxt, isMe(item) ? s.bubbleTxtMe : s.bubbleTxtOther]}>{item.mensaje}</Text>
                    <Text style={[s.bubbleTime, isMe(item) ? { color: 'rgba(0,0,0,0.4)' } : { color: 'rgba(255,255,255,0.6)' }]}>
                      {new Date(item.created_at).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              )}
            />
            <View style={s.inputBar}>
              <TextInput
                style={s.input}
                placeholder="Escribe un mensaje..."
                placeholderTextColor={Colors.textTertiary}
                value={text}
                onChangeText={setText}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity style={[s.sendBtn, !text.trim() && s.sendBtnDisabled]} onPress={sendMessage} disabled={!text.trim()}>
                <Text style={s.sendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { padding: 4 },
  backTxt: { fontSize: 22, color: Colors.white },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAv: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  headerAvTxt: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  headerName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.white },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  callBtn: { padding: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '500', color: Colors.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
  msgWrap: { marginBottom: 8 },
  msgWrapMe: { alignItems: 'flex-end' },
  msgWrapOther: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, paddingBottom: 4 },
  bubbleMe: { backgroundColor: Colors.accent, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.primary, borderBottomLeftRadius: 4 },
  bubbleTxt: { fontSize: FontSize.base, lineHeight: 20 },
  bubbleTxtMe: { color: Colors.primary },
  bubbleTxtOther: { color: Colors.white },
  bubbleTime: { fontSize: 10, marginTop: 2, textAlign: 'right' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.md, borderTopWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.white, gap: 8 },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: Radii.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: FontSize.base, color: Colors.textPrimary, maxHeight: 100, borderWidth: 0.5, borderColor: Colors.border },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 18, color: Colors.accent },
});