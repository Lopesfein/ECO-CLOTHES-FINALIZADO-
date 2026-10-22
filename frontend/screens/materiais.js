import { FlatList, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import EcoScoreBadge from '../components/EcoScoreBadge';
import { getAllTecidos } from '../utils/ecoScore';
import { colors } from '../theme/colors';

export default function Materiais({ navigation }) {
  const tecidos = getAllTecidos();

  function renderItem({ item }) {
    const cor =
      item.notaEcologica >= 7
        ? colors.scoreHigh
        : item.notaEcologica >= 5
          ? colors.scoreMedium
          : colors.scoreLow;

    return (
      <Card>
        <View style={styles.itemHeader}>
          <Text style={styles.nome}>{item.nome}</Text>
          <EcoScoreBadge nota={item.notaEcologica} nivel="" cor={cor} size="small" />
        </View>
        <Text style={styles.descricao}>{item.descricao}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="alert-circle" size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Impacto</Text>
            <Text style={styles.infoValue}>{item.impactoAmbiental}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="leaf" size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Biodegradável</Text>
            <Text style={styles.infoValue}>{item.biodegradabilidade}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="water" size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Água</Text>
            <Text style={styles.infoValue}>{item.consumoAgua}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cloud" size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Carbono</Text>
            <Text style={styles.infoValue}>{item.emissaoCarbono}</Text>
          </View>
        </View>
        <Text style={styles.dica}>💡 {item.dica}</Text>
      </Card>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title="Materiais"
        subtitle="Banco de dados de tecidos"
        icon={<Ionicons name="shirt" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={tecidos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryKicker}>Guia rápido</Text>
            <Text style={styles.summaryTitle}>Escolher tecido certo muda tudo.</Text>
            <Text style={styles.summaryText}>
              A composição da peça influencia durabilidade, conforto, impacto ambiental e a forma como a roupa será usada ao longo do tempo.
            </Text>
          </Card>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 24,
  },
  summaryCard: {
    marginBottom: 12,
  },
  summaryKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.secondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nome: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  descricao: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  infoItem: {
    width: '47%',
    backgroundColor: colors.overlay,
    borderRadius: 8,
    padding: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  dica: {
    fontSize: 13,
    color: colors.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
