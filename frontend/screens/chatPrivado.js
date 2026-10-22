import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import { colors } from '../theme/colors';
import { getUsuarioAtual, requestJson } from '../services/api';

export default function ChatPrivado({ route, navigation }) {
  const contato = route?.params?.contato;
  const usuarioAtual = getUsuarioAtual();
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const listaMensagensRef = useRef(null);

  function rolarParaMensagemRecente() {
    requestAnimationFrame(() => {
      listaMensagensRef.current?.scrollToEnd({ animated: true });
    });
  }

  async function carregarMensagens(inicial = false) {
    if (!usuarioAtual?.id || !contato?.id) return;
    try {
      if (inicial) setCarregando(true);
      const resposta = await requestJson(
        `/mensagens-privadas?usuarioId=${encodeURIComponent(usuarioAtual.id)}&contatoId=${encodeURIComponent(contato.id)}`
      );
      setMensagens(resposta || []);
      await requestJson('/mensagens-privadas/lidas', {
        method: 'PATCH',
        body: JSON.stringify({ usuarioId: usuarioAtual.id, contatoId: contato.id }),
      });
      setErro(null);
    } catch (erroDaApi) {
      setErro(erroDaApi.message || 'Não foi possível carregar a conversa.');
    } finally {
      if (inicial) setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMensagens(true);
    const intervalo = setInterval(() => carregarMensagens(), 3000);
    return () => clearInterval(intervalo);
  }, [contato?.id, usuarioAtual?.id]);

  async function enviarMensagem() {
    if (!texto.trim() || !usuarioAtual?.id || !contato?.id || enviando) return;
    try {
      setEnviando(true);
      const resposta = await requestJson('/mensagens-privadas', {
        method: 'POST',
        body: JSON.stringify({
          remetenteId: usuarioAtual.id,
          destinatarioId: contato.id,
          texto: texto.trim(),
        }),
      });
      setMensagens((anteriores) => [...anteriores, resposta.data]);
      rolarParaMensagemRecente();
      setTexto('');
      setErro(null);
    } catch (erroDaApi) {
      setErro(erroDaApi.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  }

  async function apagarMensagem(mensagem) {
    try {
      await requestJson(`/mensagens-privadas/${mensagem.id}/apagar`, {
        method: 'POST',
        body: JSON.stringify({ usuarioId: usuarioAtual?.id }),
      });
      setMensagens((anteriores) => anteriores.filter((item) => item.id !== mensagem.id));
    } catch (erroDaApi) {
      setErro(erroDaApi.message || 'Não foi possível apagar a mensagem.');
    }
  }

  function formatarHorario(data) {
    const valorData = String(data || '');
    const dataNormalizada = valorData.includes('T') ? valorData : valorData.replace(' ', 'T') + 'Z';
    const dataMensagem = new Date(dataNormalizada);
    if (Number.isNaN(dataMensagem.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dataMensagem);
  }

  function renderMensagem({ item }) {
    const minha = item.remetenteId === usuarioAtual?.id;
    return (
      <View style={[styles.message, minha ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, minha && styles.myMessageText]}>{item.texto}</Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, minha && styles.myMessageTime]}>{formatarHorario(item.dataCriacao)}</Text>
          {minha && (
            <TouchableOpacity onPress={() => apagarMensagem(item)} style={styles.deleteMessageButton}>
              <Ionicons name="trash-outline" size={13} color={colors.white} />
              <Text style={styles.deleteMessageText}>Apagar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title={contato?.nome || 'Mensagem'}
        subtitle="Conversa privada"
        icon={<Ionicons name="chatbubbles" size={30} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {carregando ? (
          <Text style={styles.status}>Carregando conversa...</Text>
        ) : erro && mensagens.length === 0 ? (
          <Text style={[styles.status, styles.error]}>{erro}</Text>
        ) : (
          <FlatList
            ref={listaMensagensRef}
            data={mensagens}
            keyExtractor={(item) => item.id}
            renderItem={renderMensagem}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={rolarParaMensagemRecente}
            ListEmptyComponent={<Text style={styles.empty}>Diga oi para iniciar a conversa.</Text>}
          />
        )}
        <TouchableOpacity
          style={styles.scrollDownButton}
          onPress={rolarParaMensagemRecente}
          accessibilityRole="button"
          accessibilityLabel="Ir para as mensagens mais recentes"
        >
          <Ionicons name="arrow-down" size={20} color={colors.white} />
        </TouchableOpacity>
        {erro && mensagens.length > 0 && <Text style={styles.inlineError}>{erro}</Text>}
        <View style={styles.inputRow}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva uma mensagem"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendButton} onPress={enviarMensagem} disabled={enviando}>
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  messageList: { paddingVertical: 16, flexGrow: 1, justifyContent: 'flex-end' },
  message: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, marginBottom: 8 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  messageText: { color: colors.text, fontSize: 15, lineHeight: 20 },
  myMessageText: { color: colors.white },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5, gap: 8 },
  messageTime: { color: colors.textSecondary, fontSize: 10 },
  myMessageTime: { color: 'rgba(255,255,255,0.75)' },
  deleteMessageButton: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  deleteMessageText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 12 },
  input: { flex: 1, maxHeight: 100, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, color: colors.text, fontSize: 15 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  status: { textAlign: 'center', color: colors.textSecondary, marginTop: 30 },
  error: { color: colors.danger, paddingHorizontal: 12 },
  inlineError: { color: colors.danger, textAlign: 'center', fontSize: 12 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginBottom: 20 },
  scrollDownButton: { alignSelf: 'flex-end', width: 42, height: 42, borderRadius: 21, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 6, elevation: 3 },
});
