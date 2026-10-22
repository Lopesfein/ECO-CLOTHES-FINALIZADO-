import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import { colors } from '../theme/colors';

export default function Sustentabilidade({ navigation }) {
  return (
    <ScreenContainer>
      <Header
        title="Sustentabilidade"
        subtitle="Consumo consciente na moda"
        icon={<Ionicons name="earth" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.kicker}>Resumo</Text>
          <Text style={styles.title}>Moda com menor impacto.</Text>
          <Text style={styles.text}>
            Sustentabilidade na moda é muito mais do que usar materiais “naturais”; é repensar toda a cadeia,
            desde a origem da fibra até o descarte final. O objetivo é reduzir poluição, desperdício e pressão sobre
            recursos naturais.
          </Text>
        </Card>

        <Card>
          <Text style={styles.kicker}>Impacto real</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>2% a 8%</Text>
              <Text style={styles.metricLabel}>das emissões globais</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>2.700L</Text>
              <Text style={styles.metricLabel}>água por camiseta</Text>
            </View>
          </View>
          <Text style={styles.text}>
            A indústria têxtil é uma das maiores fontes de emissões e consumo hídrico do mundo. Por isso, a moda
            precisa ser analisada de forma mais crítica, com base em composição, produção e durabilidade.
          </Text>
        </Card>

        <Card>
          <Text style={styles.kicker}>Consumo consciente</Text>
          <Text style={styles.text}>
            Consumo consciente significa comprar menos, escolher melhor e usar mais. Isso inclui priorizar peças
            duráveis, materiais com menor impacto, produção localizada e atenção à qualidade da peça e não só ao preço.
          </Text>
        </Card>

        <Card>
          <Text style={styles.kicker}>Como agir</Text>
          {[
            '• prefira fibras com menor impacto ambiental',
            '• priorize durabilidade e reparo',
            '• desconfie de descartes rápidos e tendências efêmeras',
            '• escolha marcas com transparência e produção responsável',
          ].map((item) => (
            <Text key={item} style={styles.text}>{item}</Text>
          ))}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.secondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.overlay,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
