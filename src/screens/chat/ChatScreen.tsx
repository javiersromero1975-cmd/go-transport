import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { Colors, FontSize, Radii, Spacing } from '../../theme';

interface Message {
  id: string;
  sender_id: string;
  sender_role: string;
  mensaje: string;
  created_at: string;
}

export const ChatScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const viajeId = route?.params?.viajeId ?? 'demo-trip-001';
  const otherName = route?.params?.otherName ?? 'Carlos Rivas';
  const senderId = user?.id ?? `demo-${user?.role ?? 'passenger'}-${Date.now()}`;

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel(`chat-${viajeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `viaje_id=eq.${viajeId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .eq('viaje_id', viajeId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || loading) return;
    const msg = text.trim();
    setText('');
    setLoading(true);

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: senderId,
      sender_role: user?.role ?? 'passenger',
      mensaje: msg,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const { error } = await supabase.from('mensajes').insert([{
        viaje_id: viajeId,
        sender_id: senderId,
        sender_role: user?.role ?? 'passenger',
        mensaje: msg,
      }]);
      if (error) {
        console.log('Chat error:', error.message);
      }
    } catch (err) {
      console.log('Send error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isMe = (msg: Message) => msg.sender_id === senderId;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerAv}><Text style={s.headerAvTxt}>{otherName[0]}</Text></View>
          <View>
            <Text style={s.headerName}>{otherName}</Text>
            <Text style={s.headerSub}>En viaje · En línea</Text>
          </View>
        </View>
        <TouchableOpacity style={s.callBtn} onPress={() => Alert.alert('Llamar', `¿Llamar a ${otherName}?`)}>
          <Text style={{ fontSize: 20 }}>📞</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={s.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={() => (
          <View style={s.emptyChat}>
            <Text style={s.emptyChatIcon}>💬</Text>
            <Text style={s.emptyChatTxt}>Inicia la conversación</Text>
            <Text style={s.emptyChatSub}>Los mensajes son privados entre tú y {otherName}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[s.msgWrap, isMe(item) ? s.msgWrapMe : s.msgWrapOther]}>
            <View style={[s.bubble, isMe(item) ? s.bubbleMe : s.bubbleOther]}>
              <Text style={[s.bubbleTxt, isMe(item) ? s.bubbleTxtMe : s.bubbleTxtOther]}>{item.mensaje}</Text>
              <Text style={[s.time, isMe(item) ? s.timeMe : s.timeOther]}>{formatTime(item.created_at)}</Text>
            </View>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={Colors.textTertiary}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!text.trim() || loading) && s.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim() || loading}
          >
            <Text style={s.sendBtnTxt}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { padding: 4 },
  backTxt: { fontSize: 22, color: Colors.white },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAv: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  headerAvTxt: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  headerName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.white },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  callBtn: { padding: 4 },
  messageList: { padding: Spacing.lg, paddingBottom: 8, flexGrow: 1 },
  emptyChat: { alignItems: 'center', paddingTop: 80 },
  emptyChatIcon: { fontSize: 48, marginBottom: 16 },
  emptyChatTxt: { fontSize: FontSize.lg, fontWeight: '500', color: Colors.textPrimary, marginBottom: 6 },
  emptyChatSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  msgWrap: { marginBottom: 8, maxWidth: '80%' },
  msgWrapMe: { alignSelf: 'flex-end' },
  msgWrapOther: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 16, padding: 10, paddingHorizontal: 14 },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.background, borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: Colors.border },
  bubbleTxt: { fontSize: FontSize.base, lineHeight: 20 },
  bubbleTxtMe: { color: Colors.white },
  bubbleTxtOther: { color: Colors.textPrimary },
  time: { fontSize: 10, marginTop: 4 },
  timeMe: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  timeOther: { color: Colors.textTertiary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: Spacing.md, borderTopWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.white },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: Radii.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: FontSize.base, color: Colors.textPrimary, maxHeight: 100, borderWidth: 0.5, borderColor: Colors.border },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnTxt: { fontSize: 18, color: Colors.accent },
});