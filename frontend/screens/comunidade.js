import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { getUsuarioAtual, requestJson } from '../services/api';
import { colors } from '../theme/colors';
import { parseComposicao, calcularNotaEcologica } from '../utils/ecoScore';

export default function Comunidade({ navigation }) {
  const [analises, setAnalises] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [analiseEditando, setAnaliseEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [marcaEditada, setMarcaEditada] = useState('');
  const [composicaoEditada, setComposicaoEditada] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const usuarioAtual = getUsuarioAtual();

  useEffect(() => {
    let ativo = true;
    const intervaloBusca = setTimeout(async () => {
      try {
        setCarregando(true);
        setErro(null);
        const termo = busca.trim();
        const caminho = termo ? `/analises?busca=${encodeURIComponent(termo)}` : '/analises';
        const resposta = await requestJson(caminho);
        if (ativo) setAnalises(resposta || []);
      } catch (erroDoFetch) {
        if (ativo) setErro(erroDoFetch.message || 'Erro ao carregar comunidade.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }, 250);

    return () => {
      ativo = false;
      clearTimeout(intervaloBusca);
    };
  }, [busca]);

  async function excluirAnalise(id) {
    try {
      await requestJson(`/analises/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ usuarioId: usuarioAtual?.id, role: usuarioAtual?.role }),
      });
      setAnalises((prev) => prev.filter((item) => item.id !== id));
    } catch (erro) {
      setErro(erro.message || 'Erro ao excluir análise.');
    }
  }

  function abrirEdicao(analise) {
    setAnaliseEditando(analise);
    setNomeEditado(analise.nome || '');
    setMarcaEditada(analise.marca || '');
    setComposicaoEditada(analise.composicao || '');
  }

  async function salvarEdicao() {
    if (!analiseEditando || !nomeEditado.trim() || !marcaEditada.trim() || !composicaoEditada.trim()) {
      Alert.alert('Atenção', 'Preencha nome, marca e composição.');
      return;
    }
    setSalvandoEdicao(true);
    try {
      const materiais = parseComposicao(composicaoEditada);
      const resultado = calcularNotaEcologica(materiais);
      const resposta = await requestJson(`/analises/${analiseEditando.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          usuarioId: usuarioAtual?.id,
          nome: nomeEditado.trim(),
          marca: marcaEditada.trim(),
          composicao: composicaoEditada.trim(),
          resultado,
          materiais,
        }),
      });
      setAnalises((anteriores) => anteriores.map((item) => (
        item.id === analiseEditando.id ? { ...item, ...resposta.data, resultado, materiais } : item
      )));
      setAnaliseEditando(null);
    } catch (erroDaEdicao) {
      Alert.alert('Erro', erroDaEdicao.message || 'Não foi possível editar o cadastro.');
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function renderItem({ item }) {
    const ehMinhaAnalise = usuarioAtual?.id === item.usuarioId;
    const podeExcluir = usuarioAtual?.role === 'admin' || ehMinhaAnalise;

    return (
      <Card style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('Perfil', { usuarioId: item.usuarioId })}>
            <Text style={styles.itemUser}>{item.usuarioNome || 'Usuário'}{ehMinhaAnalise ? ' • Minha análise' : ''}</Text>
          </TouchableOpacity>
          <Text style={styles.itemDate}>{new Date(item.dataCriacao).toLocaleDateString()}</Text>
        </View>
        {item.nome ? <Text style={styles.itemNome}>{item.nome}</Text> : null}
        {item.marca ? <Text style={styles.itemMarca}>Marca: {item.marca}</Text> : null}
        <Text style={styles.itemComposicao}>{item.composicao}</Text>
        <View style={styles.itemResumo}>
          <Text style={styles.itemNota}>Nota: {item.resultado?.nota ?? '—'}</Text>
          <Text style={styles.itemNivel}>{item.resultado?.nivel ?? '—'}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.verButton}
            onPress={() => navigation.navigate('ResultadoAnalise', { composicao: item.composicao })}
          >
            <Text style={styles.verButtonText}>Ver análise</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.perfilButton}
            onPress={() => navigation.navigate('Perfil', { usuarioId: item.usuarioId })}
          >
            <Text style={styles.perfilButtonText}>Ver perfil</Text>
          </TouchableOpacity>
          {ehMinhaAnalise && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => abrirEdicao(item)}
            >
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          )}
          {podeExcluir && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => excluirAnalise(item.id)}
            >
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title="Comunidade"
        subtitle="Veja roupas cadastradas por outros usuários"
        icon={<Ionicons name="people" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por nome, marca ou composição"
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            autoCapitalize="words"
            accessibilityLabel="Buscar por nome da roupa, marca ou composição"
            returnKeyType="search"
          />
        </View>

        <Card style={styles.cardIntro}>
          <Text style={styles.introTitle}>Comunidade EcoClothes</Text>
          <Text style={styles.introText}>
            Acompanhe as peças que outros usuários cadastraram e veja como elas foram analisadas. Em breve teremos chat para trocar ideias com a comunidade.
          </Text>
          <Button
            title="Abrir chat da comunidade"
            variant="outline"
            onPress={() => navigation.navigate('ChatComunidade')}
          />
        </Card>

        {carregando ? (
          <Text style={styles.statusText}>Carregando roupas cadastradas...</Text>
        ) : erro ? (
          <Text style={[styles.statusText, styles.errorText]}>{erro}</Text>
        ) : analises.length === 0 ? (
          <Text style={styles.statusText}>Ainda não há roupas cadastradas na comunidade.</Text>
        ) : (
          <FlatList
            data={analises}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
      <Modal
        visible={Boolean(analiseEditando)}
        transparent
        animationType="fade"
        onRequestClose={() => setAnaliseEditando(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editModal}>
            <Text style={styles.modalTitle}>Editar cadastro</Text>
            <TextInput
              value={nomeEditado}
              onChangeText={setNomeEditado}
              placeholder="Nome da peça"
              placeholderTextColor={colors.textSecondary}
              style={styles.editInput}
            />
            <TextInput
              value={marcaEditada}
              onChangeText={setMarcaEditada}
              placeholder="Marca"
              placeholderTextColor={colors.textSecondary}
              style={styles.editInput}
            />
            <TextInput
              value={composicaoEditada}
              onChangeText={setComposicaoEditada}
              placeholder="Composição"
              placeholderTextColor={colors.textSecondary}
              style={[styles.editInput, styles.composicaoInput]}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setAnaliseEditando(null)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={salvarEdicao} disabled={salvandoEdicao}>
                <Text style={styles.saveButtonText}>{salvandoEdicao ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 16,
  },
  cardIntro: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 14,
    marginLeft: 10,
    fontSize: 15,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  statusText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 24,
    marginHorizontal: 16,
    fontSize: 14,
  },
  errorText: {
    color: colors.danger,
  },
  list: {
    paddingBottom: 24,
  },
  itemCard: {
    padding: 18,
    marginHorizontal: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemUser: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  itemDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  itemComposicao: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
  },
  itemNome: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  itemMarca: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    marginBottom: 8,
  },
  itemResumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemNota: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  itemNivel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  verButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  verButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  perfilButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  perfilButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  editModal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  editInput: {
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
    fontSize: 15,
  },
  composicaoInput: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  cancelButton: {
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
