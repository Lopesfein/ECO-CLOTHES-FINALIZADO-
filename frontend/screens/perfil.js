import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, Modal, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useFavoritos } from '../context/FavoritosContext';
import { useTheme } from '../context/ThemeContext';
import { getUsuarioAtual, requestJson } from '../services/api';
import { colors } from '../theme/colors';

export default function Perfil({ navigation, route }) {
  const { usuario: usuarioLogado, atualizarUsuario } = useFavoritos();
  const { tema, alternarTema, definirTema, cores } = useTheme();
  const usuarioAtual = usuarioLogado || getUsuarioAtual();
  const perfilExternoId = route?.params?.perfilProprio ? null : route?.params?.usuarioId;
  const perfilId = perfilExternoId || usuarioAtual?.id;
  const ehPerfilProprio = !perfilExternoId;
  const [usuario, setUsuario] = useState(() => usuarioAtual);
  const [analises, setAnalises] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [notaMedia, setNotaMedia] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState(usuarioAtual?.nome || '');
  const [fotoEditada, setFotoEditada] = useState(usuarioAtual?.fotoPerfil || null);
  const [salvando, setSalvando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (ehPerfilProprio) {
        setUsuario(usuarioAtual);
        setNomeEditado(usuarioAtual?.nome || '');
        setFotoEditada(usuarioAtual?.fotoPerfil || null);
        if (usuarioAtual?.tema) definirTema(usuarioAtual.tema);
      }
      carregarPerfil();
    }, [perfilId])
  );

  async function carregarPerfil() {
    if (!perfilId) {
      console.log('Sem usuarioId, retornando');
      return;
    }

    setCarregando(true);
    try {
      console.log('Carregando perfil para usuarioId:', perfilId);
      const resultados = await Promise.allSettled([
        requestJson(`/usuarios/${perfilId}`),
        requestJson(`/usuarios/${perfilId}/analises`),
        requestJson(`/usuarios/${perfilId}/favoritos`),
      ]);

      const [usuarioResultado, analisesResultado, favoritosResultado] = resultados;
      const usuarioData = usuarioResultado.status === 'fulfilled'
        ? usuarioResultado.value
        : getUsuarioAtual();
      const analisesData = analisesResultado.status === 'fulfilled'
        ? analisesResultado.value || []
        : [];
      const favoritosLocais = (globalThis.ecoFavoritos || []).filter((item) => item.usuarioId === perfilId);
      const favoritosRemotos = favoritosResultado.status === 'fulfilled'
        ? favoritosResultado.value || []
        : [];
      const favoritosData = [
        ...favoritosRemotos,
        ...favoritosLocais.filter((local) => !favoritosRemotos.some((remoto) => remoto.composicao === local.composicao)),
      ];

      setUsuario(usuarioData);
      setAnalises(analisesData);
      setFavoritos(favoritosData);

      if (analisesData.length) {
        const somaNotas = analisesData.reduce((acc, item) => {
          const resultado = typeof item.resultado === 'string'
            ? JSON.parse(item.resultado)
            : item.resultado;
          const nota = Number(resultado?.nota ?? item.nota ?? 0);
          return acc + (Number.isFinite(nota) ? nota : 0);
        }, 0);
        setNotaMedia((somaNotas / analisesData.length).toFixed(1));
      } else {
        setNotaMedia(null);
      }

      const falhas = resultados.filter((resultado) => resultado.status === 'rejected');
      if (falhas.length === resultados.length) {
        throw falhas[0].reason;
      }
    } catch (erro) {
      console.error('Erro ao carregar perfil:', erro);
      Alert.alert('Erro', erro.message || 'Não foi possível carregar o perfil.');
    } finally {
      setCarregando(false);
    }
  }

  async function escolherFotoPerfil() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso às fotos para escolher uma foto de perfil.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.4,
      width: 384,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });
    if (!resultado.canceled) {
      const foto = resultado.assets[0];
      setFotoEditada(foto.base64 ? `data:${foto.mimeType || 'image/jpeg'};base64,${foto.base64}` : foto.uri);
    }
  }

  async function salvarPerfil() {
    if (!perfilId || !nomeEditado.trim()) {
      Alert.alert('Atenção', 'Informe seu nome.');
      return;
    }
    setSalvando(true);
    try {
      const resposta = await requestJson(`/usuarios/${perfilId}`, {
        method: 'PUT',
        body: JSON.stringify({ nome: nomeEditado.trim(), fotoPerfil: fotoEditada, tema }),
      });
      setUsuario(resposta.data);
      if (ehPerfilProprio) atualizarUsuario(resposta.data);
      setEditando(false);
      setFotoEditada(resposta.data.fotoPerfil || null);
      Alert.alert('Perfil atualizado', 'Suas alterações foram salvas.');
    } catch (erro) {
      Alert.alert('Erro', erro.message || 'Não foi possível salvar o perfil.');
    } finally {
      setSalvando(false);
    }
  }

  async function mudarTema() {
    const proximoTema = tema === 'claro' ? 'escuro' : 'claro';
    alternarTema();
    if (perfilId && ehPerfilProprio) {
      try {
        const resposta = await requestJson(`/usuarios/${perfilId}`, {
          method: 'PUT',
          body: JSON.stringify({ tema: proximoTema }),
        });
        setUsuario(resposta.data);
        atualizarUsuario(resposta.data);
      } catch (erro) {
        Alert.alert('Erro', 'O tema foi alterado localmente, mas não foi possível sincronizá-lo.');
      }
    }
  }

  if (carregando) {
    return (
      <ScreenContainer>
        <Header
          title="Perfil"
          subtitle="Sua jornada sustentável"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title={ehPerfilProprio ? 'Meu perfil' : 'Perfil do Usuário'}
        subtitle={ehPerfilProprio ? 'Sua jornada sustentável' : 'Conheça este usuário'}
        onBack={perfilExternoId ? () => navigation.goBack() : undefined}
        onMenu={ehPerfilProprio ? () => setMenuAberto(true) : undefined}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {usuario?.fotoPerfil ? (
              <Image source={{ uri: usuario.fotoPerfil }} style={styles.avatarImage} />
            ) : <Ionicons name="person" size={48} color={cores.primary} />}
          </View>
          <Text style={[styles.nome, { color: cores.text }]}>{usuario?.nome || 'Consumidor Consciente'}</Text>
          {ehPerfilProprio && <Text style={[styles.email, { color: cores.textSecondary }]}>{usuario?.email || 'usuario@ecoclothes.app'}</Text>}
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Ionicons name="heart" size={24} color={cores.primary} />
              <Text style={[styles.statValue, { color: cores.primary }]}>{favoritos.length}</Text>
              <Text style={[styles.statLabel, { color: cores.textSecondary }]}>Favoritos</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="leaf" size={24} color={cores.primary} />
              <Text style={[styles.statValue, { color: cores.primary }]}>{notaMedia !== null ? notaMedia : '—'}</Text>
              <Text style={[styles.statLabel, { color: cores.textSecondary }]}>Nota média</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="checkmark-circle" size={24} color={cores.primary} />
              <Text style={[styles.statValue, { color: cores.primary }]}>{analises.length}</Text>
              <Text style={[styles.statLabel, { color: cores.textSecondary }]}>Análises</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: cores.text }]}>Sobre você</Text>
          <Text style={[styles.sectionText, { color: cores.textSecondary }]}>
            Este perfil faz parte do protótipo EcoClothes, desenvolvido para
            auxiliar consumidores na avaliação do impacto ambiental das roupas
            e promover decisões de compra mais conscientes.
          </Text>
        </Card>

        {ehPerfilProprio && (
          <Button
            title="Sair"
            variant="outline"
            onPress={() => navigation.replace('Login')}
          />
        )}
      </ScrollView>
      <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => setMenuAberto(false)}>
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuAberto(false)}>
          <View style={[styles.menu, { backgroundColor: cores.card, borderColor: cores.border }]}>
            <Text style={[styles.menuTitle, { color: cores.text }]}>Opções do perfil</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setEditando(true); setMenuAberto(false); }}>
              <Ionicons name="create-outline" size={21} color={cores.primary} />
              <Text style={[styles.menuText, { color: cores.text }]}>Editar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuAberto(false); mudarTema(); }}>
              <Ionicons name={tema === 'escuro' ? 'sunny-outline' : 'moon-outline'} size={21} color={cores.secondary} />
              <Text style={[styles.menuText, { color: cores.text }]}>{tema === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuAberto(false); navigation.replace('Login'); }}>
              <Ionicons name="log-out-outline" size={21} color={colors.danger} />
              <Text style={[styles.menuText, { color: colors.danger }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={editando} transparent animationType="fade" onRequestClose={() => setEditando(false)}>
        <View style={styles.editBackdrop}>
          <View style={[styles.editModal, { backgroundColor: cores.card, borderColor: cores.border }]}>
            <Text style={[styles.menuTitle, { color: cores.text }]}>Editar perfil</Text>
            <Input placeholder="Seu nome" value={nomeEditado} onChangeText={setNomeEditado} />
            <Button title={fotoEditada ? 'Trocar foto de perfil' : 'Escolher foto de perfil'} variant="outline" onPress={escolherFotoPerfil} />
            <Button title="Salvar alterações" onPress={salvarPerfil} loading={salvando} />
            <TouchableOpacity onPress={() => setEditando(false)} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: cores.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  menuBackdrop: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 76,
    paddingRight: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  menu: {
    width: 230,
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  editBackdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  editModal: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  themeHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nome: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsCard: {
    marginTop: 0,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  stat: {
    alignItems: 'center',
    marginVertical: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
