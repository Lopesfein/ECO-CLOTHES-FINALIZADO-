import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import { colors } from '../theme/colors';

const METAS = [
  'Implementar o quadro de gestão sustentável do consumo e da produção',
  'Alcançar o uso sustentável e a gestão eficiente dos recursos naturais',
  'Reduzir significativamente a geração de resíduos por meio da prevenção, redução, reciclagem e reutilização',
  'Garantir que as pessoas tenham informações relevantes para promover o desenvolvimento sustentável',
];

export default function ODS12({ navigation }) {
  return (
    <ScreenContainer>
      <Header
        title="ODS 12"
        subtitle="Consumo e produção responsáveis"
        icon={<Ionicons name="cart" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.odsBadge}>
            <Text style={styles.odsNumber}>12</Text>
          </View>
          <Text style={styles.title}>Objetivo de Desenvolvimento Sustentável</Text>
          <Text style={styles.text}>
            O ODS 12 incentiva padrões de consumo e produção responsáveis, propondo
            mudanças na maneira como empresas produzem e como as pessoas consomem
            produtos no dia a dia. Faz parte da Agenda 2030 da ONU.
          </Text>
        </Card>

        <Card>
          <Text style={styles.title}>Relação com a moda</Text>
          <Text style={styles.text}>
            O consumo excessivo de roupas afeta o desenvolvimento das cidades.
            Grande parte das peças descartadas acaba em aterros sanitários,
            ocupando espaço e aumentando os custos da gestão de resíduos urbanos.
            Estimular hábitos conscientes contribui para a preservação ambiental e
            melhora a qualidade de vida nas áreas urbanas.
          </Text>
        </Card>

        <Card>
          <Text style={styles.title}>Metas do ODS 12</Text>
          {METAS.map((meta, index) => (
            <View key={index} style={styles.metaItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.metaText}>{meta}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.title}>EcoClothes e o ODS 12</Text>
          <Text style={styles.text}>
            Ao oferecer informações claras sobre a composição das roupas e seus
            impactos ambientais, o EcoClothes contribui para o consumo responsável,
            reduz o desperdício e colabora para o cumprimento deste objetivo.
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
  odsBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#BF8B2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  odsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
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
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
    lineHeight: 20,
  },
});
