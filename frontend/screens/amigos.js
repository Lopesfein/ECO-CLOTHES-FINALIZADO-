import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import { colors } from '../theme/colors';
import { useFavoritos } from '../context/FavoritosContext';
import { getUsuarioAtual, requestJson } from '../services/api';

export default function Amigos({ navigation }) {
  const [busca, setBusca] = useState('');
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [convites, setConvites] = useState({});
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesMensagens, setNotificacoesMensagens] = useState([]);
  const [meusAmigos, setMeusAmigos] = useState([]);
  const [bloqueados, setBloqueados] = useState([]);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const { usuario } = useFavoritos();
  const usuarioAtual = usuario || getUsuarioAtual();
  const telaFocada = useIsFocused();
  const notificacoesAnimacao = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    notificacoesAnimacao.setValue(0);
    Animated.spring(notificacoesAnimacao, {
      toValue: 1,
      damping: 16,
      stiffness: 150,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [notificacoes.length, notificacoesAnimacao]);

  async function carregarNotificacoes() {
    if (!usuarioAtual?.id) return;
    try {
      const [convitesResposta, mensagensResposta] = await Promise.all([
        requestJson(`/convites-amizade?usuarioId=${encodeURIComponent(usuarioAtual.id)}`),
        requestJson(`/notificacoes-mensagens?usuarioId=${encodeURIComponent(usuarioAtual.id)}`),
      ]);
      setNotificacoes(convitesResposta || []);
      setNotificacoesMensagens(mensagensResposta || []);
    } catch (erroDaApi) {
      setErro('Não foi possível carregar as notificações. Verifique se o servidor está ativo.');
    }
  }

  async function carregarAmigos() {
    if (!usuarioAtual?.id) return;
    try {
      const resposta = await requestJson(`/amizades?usuarioId=${encodeURIComponent(usuarioAtual.id)}`);
      setMeusAmigos(resposta || []);
    } catch (erroDaApi) {
      setErro('Não foi possível carregar seus amigos.');
    }
  }

  async function carregarBloqueados() {
    if (!usuarioAtual?.id) return;
    try {
      const resposta = await requestJson(`/bloqueios?usuarioId=${encodeURIComponent(usuarioAtual.id)}`);
      setBloqueados(resposta || []);
    } catch (erroDaApi) {
      setErro('Não foi possível carregar os usuários bloqueados.');
    }
  }

  function abrirPerfilAmigo(usuario) {
    navigation.getParent()?.navigate('Perfil', {
      usuarioId: usuario.id,
      perfilProprio: false,
    });
  }

  async function carregarUsuarios(mostrarCarregando = false) {
    try {
      if (mostrarCarregando) setCarregando(true);
      setErro(null);
      const resposta = await requestJson('/usuarios');
      setTodosUsuarios(resposta || []);
    } catch (erroDaBusca) {
      setErro('Não foi possível carregar os usuários. Verifique se o servidor está ativo.');
    } finally {
      if (mostrarCarregando) setCarregando(false);
    }
  }

  useEffect(() => {
    if (!telaFocada) return undefined;

    carregarUsuarios(true);
    carregarNotificacoes();
    carregarAmigos();
    carregarBloqueados();

    const intervalo = setInterval(() => {
      carregarUsuarios();
      carregarNotificacoes();
      carregarBloqueados();
    }, 5000);

    return () => clearInterval(intervalo);
  }, [telaFocada, usuarioAtual?.id]);

  async function responderConvite(convite, status) {
    try {
      await requestJson(`/convites-amizade/${convite.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, usuarioId: usuarioAtual?.id }),
      });
      setNotificacoes((anteriores) => anteriores.filter((item) => item.id !== convite.id));
      if (status === 'aceito') carregarAmigos();
    } catch (erroDaApi) {
      setErro('Não foi possível responder ao convite. Tente novamente.');
    }
  }

  useEffect(() => {
    const termo = busca.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!termo) {
      setUsuarios([]);
      return;
    }

    const encontrados = todosUsuarios.filter((usuario) => {
      const nome = String(usuario.nome || '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return nome.includes(termo) && usuario.id !== usuarioAtual?.id;
    });
    setUsuarios(encontrados);
  }, [busca, todosUsuarios, bloqueados, usuarioAtual?.id]);

  const notificacaoAnimadaStyle = {
    opacity: notificacoesAnimacao,
    transform: [{ translateY: notificacoesAnimacao.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
  };

  function renderUsuario({ item }) {
    const convite = convites[item.id];
    const conviteEnviado = convite?.status === 'pendente';
    const amizadeConfirmada = convite?.status === 'aceito';

    async function enviarConvite() {
      try {
        if (!usuarioAtual?.id) {
          throw new Error('Faça login novamente para enviar convites.');
        }
        const resposta = await requestJson('/convites-amizade', {
          method: 'POST',
          body: JSON.stringify({ remetenteId: usuarioAtual.id, destinatarioId: item.id }),
        });
        setConvites((anteriores) => ({
          ...anteriores,
          [item.id]: resposta.convite || { status: 'pendente' },
        }));
      } catch (erroDoConvite) {
        setConvites((anteriores) => ({
          ...anteriores,
          [item.id]: { erro: erroDoConvite.message || 'Erro ao enviar convite.' },
        }));
      }
    }

    return (
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {item.fotoPerfil ? (
              <Image source={{ uri: item.fotoPerfil }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{item.nome?.charAt(0)?.toUpperCase() || '?'}</Text>
            )}
          </View>
          <View style={styles.userCopy}>
            <Text style={styles.userName}>{item.nome}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => abrirPerfilAmigo(item)}
          >
            <Ionicons name="person-outline" size={14} color={colors.primary} />
            <Text style={styles.profileButtonText}>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => navigation.navigate('ChatPrivado', { contato: item })}
          >
            <Ionicons name="chatbubble-outline" size={14} color={colors.white} />
            <Text style={styles.messageButtonText}>Mensagem</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.inviteButton, (conviteEnviado || amizadeConfirmada) && styles.inviteButtonSent]}
            onPress={enviarConvite}
            disabled={conviteEnviado || amizadeConfirmada}
          >
            <Ionicons
              name={conviteEnviado || amizadeConfirmada ? 'checkmark' : 'person-add-outline'}
              size={14}
              color={conviteEnviado || amizadeConfirmada ? colors.success : colors.secondary}
            />
            <Text style={styles.inviteButtonText}>
              {convite?.erro ? 'Tentar novamente' : amizadeConfirmada ? 'Amigos' : conviteEnviado ? 'Enviado' : 'Convidar'}
            </Text>
          </TouchableOpacity>
        </View>
        {convite?.erro && <Text style={styles.inviteError}>{convite.erro}</Text>}
      </Card>
    );
  }

  function abrirOpcoesAmigo(amigo) {
    Alert.alert(
      amigo.nome,
      'Escolha uma ação para este contato.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover amizade', style: 'destructive', onPress: () => removerAmizade(amigo) },
        { text: 'Bloquear usuário', style: 'destructive', onPress: () => bloquearUsuario(amigo) },
      ]
    );
  }

  function removerAmizade(amigo) {
    Alert.alert('Remover amizade?', `Você e ${amigo.nome} deixarão de ser amigos.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestJson(`/amizades/${encodeURIComponent(amigo.id)}`, {
              method: 'DELETE',
              body: JSON.stringify({ usuarioId: usuarioAtual?.id }),
            });
            setMeusAmigos((anteriores) => anteriores.filter((item) => item.id !== amigo.id));
            setConvites((anteriores) => {
              const atualizados = { ...anteriores };
              delete atualizados[amigo.id];
              return atualizados;
            });
          } catch (erroDaApi) {
            setErro(erroDaApi.message || 'Não foi possível remover a amizade.');
          }
        },
      },
    ]);
  }

  function bloquearUsuario(amigo) {
    Alert.alert('Bloquear usuário?', `${amigo.nome} não poderá enviar mensagens para você.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Bloquear',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestJson('/bloqueios', {
              method: 'POST',
              body: JSON.stringify({ bloqueadorId: usuarioAtual?.id, bloqueadoId: amigo.id }),
            });
            setMeusAmigos((anteriores) => anteriores.filter((item) => item.id !== amigo.id));
            setBloqueados((anteriores) => [...anteriores, { usuarioId: amigo.id, nome: amigo.nome, email: amigo.email }]);
            setConvites((anteriores) => {
              const atualizados = { ...anteriores };
              delete atualizados[amigo.id];
              return atualizados;
            });
          } catch (erroDaApi) {
            setErro(erroDaApi.message || 'Não foi possível bloquear o usuário.');
          }
        },
      },
    ]);
  }

  function desbloquearUsuario(usuario) {
    Alert.alert('Desbloquear usuário?', `Você poderá receber mensagens de ${usuario.nome} novamente.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desbloquear',
        onPress: async () => {
          try {
            await requestJson(`/bloqueios/${encodeURIComponent(usuario.usuarioId)}`, {
              method: 'DELETE',
              body: JSON.stringify({ usuarioId: usuarioAtual?.id }),
            });
            setBloqueados((anteriores) => anteriores.filter((item) => item.usuarioId !== usuario.usuarioId));
          } catch (erroDaApi) {
            setErro(erroDaApi.message || 'Não foi possível desbloquear o usuário.');
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <Header
        title="Amigos"
        subtitle="Encontre pessoas da comunidade"
        icon={<Ionicons name="people" size={32} color={colors.accent} />}
        onNotification={() => {
          setNotificacoesAbertas(true);
          carregarNotificacoes();
        }}
        notificationCount={notificacoes.length + notificacoesMensagens.length}
      />
      <View style={styles.content}>
        {!busca.trim() && meusAmigos.length > 0 && (
          <View style={styles.friendsSection}>
            <Text style={styles.sectionTitle}>Meus amigos</Text>
            <FlatList
              data={meusAmigos}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.friendChip}>
                  <TouchableOpacity
                    style={styles.friendInfo}
                    onPress={() => navigation.navigate('ChatPrivado', { contato: item })}
                  >
                    <View style={styles.friendAvatar}>
                      {item.fotoPerfil ? (
                        <Image source={{ uri: item.fotoPerfil }} style={styles.friendAvatarImage} />
                      ) : (
                        <Text style={styles.friendAvatarText}>{item.nome?.charAt(0)?.toUpperCase() || '?'}</Text>
                      )}
                    </View>
                    <Text style={styles.friendName} numberOfLines={1}>{item.nome}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.friendOptionsButton}
                    onPress={() => abrirOpcoesAmigo(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Opções de ${item.nome}`}
                  >
                    <Ionicons name="ellipsis-horizontal-circle-outline" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
        {!busca.trim() && bloqueados.length > 0 && (
          <View style={styles.blockedSection}>
            <Text style={styles.sectionTitle}>Usuários bloqueados</Text>
            {bloqueados.map((item) => (
              <View key={item.usuarioId} style={styles.blockedRow}>
                <View style={styles.blockedIdentity}>
                  <Ionicons name="person-remove-outline" size={20} color={colors.danger} />
                  <Text style={styles.blockedName}>{item.nome || 'Usuário'}</Text>
                </View>
                <TouchableOpacity style={styles.unblockButton} onPress={() => desbloquearUsuario(item)}>
                  <Text style={styles.unblockText}>Desbloquear</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por nome"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="search"
          />
        </View>

        {carregando && <Text style={styles.status}>Buscando pessoas...</Text>}
        {!carregando && erro && <Text style={[styles.status, styles.error]}>{erro}</Text>}
        {!carregando && !erro && !busca.trim() && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={52} color={colors.border} />
            <Text style={styles.emptyTitle}>Encontre novos amigos</Text>
            <Text style={styles.emptyText}>Digite um nome para ver perfis e iniciar uma conversa privada.</Text>
          </View>
        )}
        {!carregando && !erro && busca.trim() && usuarios.length === 0 && (
          <Text style={styles.status}>Nenhuma pessoa encontrada.</Text>
        )}
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          renderItem={renderUsuario}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      </View>
      <Modal
        visible={notificacoesAbertas}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificacoesAbertas(false)}
      >
        <View style={styles.notificationLayer}>
          <Pressable style={styles.notificationBackdrop} onPress={() => setNotificacoesAbertas(false)} />
          <View style={styles.notificationPanel}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Pedidos de amizade</Text>
              <Pressable onPress={() => setNotificacoesAbertas(false)}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
            {notificacoes.length === 0 && notificacoesMensagens.length === 0 ? (
              <Text style={styles.notificationEmpty}>Você não tem novas notificações.</Text>
            ) : (
              <>
              {notificacoesMensagens.map((mensagem) => (
                <TouchableOpacity
                  key={`mensagem-${mensagem.id}`}
                  style={styles.messageNotification}
                  onPress={() => {
                    setNotificacoesAbertas(false);
                    const contato = todosUsuarios.find((item) => item.id === mensagem.remetenteId) || { id: mensagem.remetenteId, nome: mensagem.remetenteNome };
                    navigation.navigate('ChatPrivado', { contato });
                  }}
                >
                  <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
                  <Text style={styles.messageNotificationText}>{mensagem.remetenteNome} enviou uma mensagem.</Text>
                </TouchableOpacity>
              ))}
              {notificacoes.map((convite) => (
                <Animated.View key={convite.id} style={[styles.inviteCard, notificacaoAnimadaStyle]}>
                  <View style={styles.inviteIdentity}>
                    <View style={styles.smallAvatar}>
                      {convite.remetenteFotoPerfil ? (
                        <Image source={{ uri: convite.remetenteFotoPerfil }} style={styles.smallAvatarImage} />
                      ) : (
                        <Text style={styles.smallAvatarText}>{convite.remetenteNome?.charAt(0)?.toUpperCase() || '?'}</Text>
                      )}
                    </View>
                    <Text style={styles.inviteName}>{convite.remetenteNome} quer ser seu amigo.</Text>
                  </View>
                  <View style={styles.inviteActions}>
                    <TouchableOpacity style={styles.acceptButton} onPress={() => responderConvite(convite, 'aceito')}>
                      <Text style={styles.acceptText}>Aceitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectButton} onPress={() => responderConvite(convite, 'recusado')}>
                      <Text style={styles.rejectText}>Recusar</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))}
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 16 },
  friendsSection: { marginBottom: 14 },
  blockedSection: { marginBottom: 14 },
  blockedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, marginBottom: 8 },
  blockedIdentity: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  blockedName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  unblockButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 10 },
  unblockText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  friendChip: { width: 88, alignItems: 'center', marginRight: 12 },
  friendInfo: { width: '100%', alignItems: 'center' },
  friendOptionsButton: { padding: 2, marginTop: 2 },
  friendAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.overlay, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  friendAvatarImage: { width: '100%', height: '100%', borderRadius: 23 },
  friendAvatarText: { color: colors.primary, fontSize: 19, fontWeight: '700' },
  friendName: { color: colors.text, fontSize: 11, fontWeight: '600', marginTop: 5, maxWidth: 76 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: { flex: 1, color: colors.text, paddingVertical: 14, marginLeft: 10, fontSize: 15 },
  list: { paddingBottom: 24 },
  userCard: { marginBottom: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  avatarImage: { width: '100%', height: '100%', borderRadius: 24 },
  userCopy: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 6, marginTop: 12 },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  profileButtonText: { color: colors.primary, fontWeight: '700', fontSize: 11 },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  messageButtonText: { color: colors.white, fontWeight: '700', fontSize: 11 },
  inviteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  inviteButtonSent: { borderColor: colors.success, backgroundColor: colors.overlay },
  inviteButtonText: { color: colors.secondary, fontWeight: '700', fontSize: 11 },
  inviteError: { color: colors.danger, fontSize: 12, marginTop: 8 },
  notificationLayer: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end' },
  notificationBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 24, 18, 0.35)' },
  notificationPanel: { width: '88%', maxWidth: 380, backgroundColor: colors.white, marginTop: 104, marginRight: 14, borderRadius: 16, padding: 16, elevation: 6 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  notificationTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  closeText: { fontSize: 28, color: colors.textSecondary, lineHeight: 28 },
  notificationEmpty: { color: colors.textSecondary, fontSize: 14, paddingVertical: 16 },
  messageNotification: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12, gap: 10 },
  messageNotificationText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  inviteCard: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 },
  inviteIdentity: { flexDirection: 'row', alignItems: 'center' },
  smallAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.overlay, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  smallAvatarImage: { width: '100%', height: '100%', borderRadius: 18 },
  smallAvatarText: { color: colors.primary, fontWeight: '700' },
  inviteName: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600', marginLeft: 10 },
  inviteActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  acceptButton: { flex: 1, backgroundColor: colors.primary, borderRadius: 9, paddingVertical: 9, alignItems: 'center' },
  acceptText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  rejectButton: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 9, alignItems: 'center' },
  rejectText: { color: colors.textSecondary, fontWeight: '700', fontSize: 13 },
  status: { textAlign: 'center', color: colors.textSecondary, marginTop: 24, fontSize: 14 },
  error: { color: colors.danger },
  empty: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 70 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 14 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 8 },
});
