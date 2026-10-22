import { ScrollView, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import { colors } from '../theme/colors';

export default function FastFashion({ navigation }) {
  return (
    <ScreenContainer>
      <Header
        title="Fast Fashion"
        subtitle="O modelo do descarte rápido"
        icon={<Ionicons name="flash" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.title}>O que é Fast Fashion?</Text>
          <Text style={styles.text}>
            O modelo fast fashion é baseado em alta rotatividade, baixo custo e
            descartabilidade. Ele estimula o consumo impulsivo, com tendências que
            mudam constantemente e peças produzidas em massa a preços baixos.
          </Text>
        </Card>

        <Card>
          <Text style={styles.title}>Números alarmantes</Text>
          <Text style={styles.text}>
            Globalmente, são produzidas mais de 100 bilhões de roupas por ano, muitas
            descartadas após poucas utilizações. Isso gera grande volume de resíduos
            têxteis, em sua maioria não recicláveis, que acumulam em aterros ou são
            incinerados.
          </Text>
        </Card>

        <Card>
          <Text style={styles.title}>Microplásticos</Text>
          <Text style={styles.text}>
            Cerca de 35% dos microplásticos que poluem os oceanos vêm da lavagem de
            tecidos sintéticos como poliéster, náilon e acrílico. Esses materiais
            são muito comuns em roupas de baixo custo e dificultam a biodegradação
            das peças descartadas.
          </Text>
        </Card>

        <Card>
          <Text style={styles.title}>Como combater</Text>
          <Text style={styles.text}>
            Reduza compras por impulso, invista em peças duráveis, prefira fibras
            naturais ou recicladas e utilize ferramentas como o EcoClothes para
            avaliar a composição antes de comprar. Pequenas mudanças de hábito podem
            gerar resultados positivos no futuro.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
