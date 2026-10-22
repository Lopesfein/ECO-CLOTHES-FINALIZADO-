import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import EcoScoreBadge from './EcoScoreBadge';

export default function MaterialCard({ tecido, percentual }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.nome}>{tecido.nome}</Text>
        {percentual !== null && percentual !== undefined && (
          <Text style={styles.percentual}>{percentual}%</Text>
        )}
      </View>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>Impacto</Text>
          <Text style={styles.value}>{tecido.impactoAmbiental}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>Biodegradável</Text>
          <Text style={styles.value}>{tecido.biodegradabilidade}</Text>
        </View>
        <EcoScoreBadge
          nota={tecido.notaEcologica}
          nivel=""
          cor={tecido.notaEcologica >= 7 ? colors.scoreHigh : tecido.notaEcologica >= 5 ? colors.scoreMedium : colors.scoreLow}
          size="small"
        />
      </View>
      <Text style={styles.descricao}>{tecido.descricao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nome: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  percentual: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.overlay,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  descricao: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
