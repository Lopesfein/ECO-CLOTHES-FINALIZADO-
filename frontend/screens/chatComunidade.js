import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import { colors } from '../theme/colors';
import { getUsuarioAtual, requestJson } from '../services/api';

export default function ChatComunidade({ navigation }) {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const usuarioAtual = getUsuarioAtual();
  const usuarioRole = usuarioAtual?.role;
  const listaMensagensRef = useRef(null);

  function rolarParaMensagemRecente() {
    requestAnimationFrame(() => {
      listaMensagensRef.current?.scrollToEnd({ animated: true });
    });
  }

  useEffect(() => {
    let ativo = true;
    let intervalo;

    async function carregarMensagens(inicial = false) {
      try {
        if (inicial) {
          setCarregando(true);
        }
        const resposta = await requestJson('/mensagens');
        if (ativo) {
          setMensagens(resposta || []);
        }
      } catch (erro) {
        console.log('Erro ao carregar chat:', erro.message);
      } finally {
        if (ativo && inicial) {
          setCarregando(false);
        }
      }
    }

    carregarMensagens(true);
    intervalo = setInterval(() => carregarMensagens(), 3000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, []);

  async function enviarMensagem() {
    if (!novaMensagem.trim()) return;

    try {
      const autor = usuarioAtual?.nome || 'Anônimo';
      const resposta = await requestJson('/mensagens', {
        method: 'POST',
        body: JSON.stringify({
          usuarioId: usuarioAtual?.id,
          autor,
          texto: novaMensagem.trim(),
        }),
      });

      setNovaMensagem('');
      setMensagens((prev) => [...prev, resposta.data]);
      rolarParaMensagemRecente();
    } catch (erro) {
      console.log('Erro ao enviar mensagem:', erro.message);
    }
  }

  async function removerMensagem(id) {
    if (!usuarioAtual?.id && usuarioRole !== 'admin') return;

    try {
      await requestJson(`/mensagens/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ usuarioId: usuarioAtual?.id, role: usuarioRole }),
      });
      setMensagens((prev) => prev.filter((item) => item.id !== id));
    } catch (erro) {
      console.log('Erro ao remover mensagem:', erro.message);
    }
  }

  function renderItem({ item }) {
    const podeExcluir = item.usuarioId === usuarioAtual?.id || usuarioRole === 'admin';

    return (
      <View style={styles.messageBubble}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageAuthor}>{item.autor}</Text>
          {podeExcluir && (
            <TouchableOpacity onPress={() => removerMensagem(item.id)}>
              <Text style={styles.removeText}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.messageText}>{item.texto}</Text>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <Header title="Chat da Comunidade" subtitle="Converse com outros usuários" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <View style={styles.content}>
        {carregando ? (
          <Text style={styles.loadingText}>Carregando mensagens...</Text>
        ) : (
          <FlatList
            ref={listaMensagensRef}
            data={mensagens}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={rolarParaMensagemRecente}
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
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            placeholder="Digite sua mensagem"
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={enviarMensagem}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={enviarMensagem}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageList: {
    paddingVertical: 16,
  },
  messageBubble: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    color: colors.text,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  removeText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollDownButton: {
    alignSelf: 'flex-end',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    elevation: 3,
  },
});
