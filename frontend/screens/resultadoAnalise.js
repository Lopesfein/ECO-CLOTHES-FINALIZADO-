import { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import EcoScoreBadge from '../components/EcoScoreBadge';
import MaterialCard from '../components/MaterialCard';
import { useFavoritos } from '../context/FavoritosContext';
import {
  parseComposicao,
  calcularNotaEcologica,
  getImpactoResumo,
} from '../utils/ecoScore';
import { colors } from '../theme/colors';
import { getUsuarioAtual, requestJson } from '../services/api';

export default function ResultadoAnalise({ route, navigation }) {
  const { nome = '', marca = '', composicao, fotoEtiqueta } = route.params;
  const { favoritos, usuario, adicionarFavorito } = useFavoritos();
  const [salvandoAnalise, setSalvandoAnalise] = useState(false);
  const [salvandoFavorito, setSalvandoFavorito] = useState(false);

  const materiais = parseComposicao(composicao);
  const resultado = calcularNotaEcologica(materiais);
  const resumo = getImpactoResumo(materiais);

  const usuarioAtual = usuario || getUsuarioAtual();
  const jaFavorito = favoritos.some((item) => item.composicao === composicao);

  useEffect(() => {
    async function salvarAnaliseNoBackend() {
      if (!usuarioAtual?.id) {
        return;
      }

      try {
        setSalvandoAnalise(true);
        await requestJson('/analises', {
          method: 'POST',
          body: JSON.stringify({
            usuarioId: usuarioAtual.id,
            nome,
            marca,
            composicao,
            resultado,
            materiais,
          }),
        });
      } catch (erro) {
        console.log('Erro ao salvar análise:', erro.message);
      } finally {
        setSalvandoAnalise(false);
      }
    }

    salvarAnaliseNoBackend();
  }, [composicao, marca, nome]);

  async function salvarFavorito() {
    setSalvandoFavorito(true);
    try {
      if (!usuarioAtual?.id) {
        throw new Error('Nenhum usuário autenticado. Faça login novamente.');
      }

      const resultadoFavorito = await adicionarFavorito({
        composicao,
        nome: nome || composicao,
        nota: resultado.nota,
        nivel: resultado.nivel,
        materiais,
      });

      Alert.alert(
        'Sucesso',
        resultadoFavorito.local
          ? 'Salvo localmente nesta sessão enquanto a API está indisponível.'
          : 'Análise salva nos favoritos.'
      );
    } catch (erro) {
      Alert.alert('Erro', erro.message || 'Não foi possível salvar nos favoritos.');
    } finally {
      setSalvandoFavorito(false);
    }
  }

  return (
    <ScreenContainer>
      <Header
        title="Resultado da Análise"
        subtitle="Nota ecológica da peça"
        icon={<Ionicons name="analytics" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.scoreCard}>
          {fotoEtiqueta ? (
            <Image source={{ uri: fotoEtiqueta }} style={styles.etiquetaImagem} resizeMode="contain" />
          ) : null}
          {nome ? <Text style={styles.pecaNome}>{nome}</Text> : null}
          {marca ? <Text style={styles.pecaMarca}>{marca}</Text> : null}
          <Text style={styles.composicaoLabel}>Composição analisada</Text>
          <Text style={styles.composicaoText}>{composicao}</Text>
          <EcoScoreBadge
            nota={resultado.nota}
            nivel={resultado.nivel}
            cor={resultado.cor}
            size="large"
            interactive
          />
        </Card>

        {materiais.length > 0 ? (
          <>
            <Card>
              <Text style={styles.sectionTitle}>Resumo do impacto</Text>
              <View style={styles.resumoRow}>
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoValue}>{resumo.totalMateriais}</Text>
                  <Text style={styles.resumoLabel}>Materiais</Text>
                </View>
                <View style={styles.resumoItem}>
                  <Text style={[styles.resumoValue, { color: colors.success }]}>
                    {resumo.biodegradaveis}
                  </Text>
                  <Text style={styles.resumoLabel}>Biodegradáveis</Text>
                </View>
                <View style={styles.resumoItem}>
                  <Text style={[styles.resumoValue, { color: colors.danger }]}>
                    {resumo.sinteticos}
                  </Text>
                  <Text style={styles.resumoLabel}>Sintéticos</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.circularCard}>
              <View style={styles.circularHeader}>
                <Ionicons name="repeat" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Próximo ciclo da peça</Text>
              </View>
              <Text style={styles.circularText}>
                Circularidade é manter a roupa em uso pelo maior tempo possível. Para esta peça:
              </Text>
              <Text style={styles.circularStep}>1. Use e lave com cuidado para prolongar a vida útil.</Text>
              <Text style={styles.circularStep}>2. Repare antes de substituir.</Text>
              <Text style={styles.circularStep}>3. Doe ou venda quando não fizer mais sentido para você.</Text>
              <Text style={styles.circularStep}>4. Recicle apenas quando a peça não puder mais ser usada.</Text>
            </Card>

            <Text style={styles.materiaisTitle}>Materiais identificados</Text>
            {materiais.map((material) => (
              <View key={material.id} style={styles.materialWrapper}>
                <MaterialCard tecido={material} percentual={material.percentual} />
                <View style={styles.detalhes}>
                  <View style={styles.detalheRow}>
                    <Ionicons name="cloud" size={16} color={colors.primary} />
                    <Text style={styles.detalheText}>{material.emissaoCarbono}</Text>
                  </View>
                  <View style={styles.detalheRow}>
                    <Ionicons name="repeat" size={16} color={colors.primary} />
                    <Text style={styles.detalheText}>Priorize uso prolongado e reparo</Text>
                  </View>
                  <Text style={styles.dica}>{material.dica}</Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <Card>
            <Text style={styles.erroText}>
              Não foi possível identificar materiais na composição informada.
              Tente usar nomes como Algodão, Poliéster, Linho, Elastano ou Náilon.
            </Text>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title={salvandoFavorito ? 'Salvando favorito...' : salvandoAnalise ? 'Salvando análise...' : jaFavorito ? 'Salvo nos Favoritos' : 'Salvar nos Favoritos'}
            onPress={salvarFavorito}
            disabled={jaFavorito || materiais.length === 0 || salvandoAnalise || salvandoFavorito}
          />
          <Button
            title="Nova Análise"
            variant="outline"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Escanear' })}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  actions: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    gap: 12,
  },
  scoreCard: {
    alignItems: 'center',
  },
  etiquetaImagem: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: colors.overlay,
  },
  circularCard: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  circularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circularText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  circularStep: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    marginTop: 4,
  },
  composicaoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  composicaoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resumoItem: {
    alignItems: 'center',
  },
  resumoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  resumoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  materiaisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  materialWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  detalhes: {
    backgroundColor: colors.overlay,
    borderRadius: 8,
    padding: 12,
    marginTop: -6,
  },
  detalheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detalheText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  dica: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  erroText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
