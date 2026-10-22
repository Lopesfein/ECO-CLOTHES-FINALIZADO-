import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import { colors } from '../theme/colors';

const METAS = [
  'Fortalecer a resiliência e a capacidade de adaptação a riscos relacionados ao clima',
  'Integrar medidas da mudança do clima nas políticas e planejamentos nacionais',
  'Melhorar a educação e a conscientização sobre mudanças climáticas',
  'Promover mecanismos de aumento da capacidade para gestão eficaz do clima',
];

export default function ODS13({ navigation }) {
  return (
    <ScreenContainer>
      <Header
        title="ODS 13"
        subtitle="Ação contra mudanças climáticas"
        icon={<Ionicons name="cloud" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.odsBadge}>
            <Text style={styles.odsNumber}>13</Text>
          </View>
          <Text style={styles.title}>Objetivo de Desenvolvimento Sustentável</Text>
          <Text style={styles.text}>
            O ODS 13 trata de tomar medidas urgentes para combater as mudanças
            climáticas e seus impactos. A indústria da moda contribui com 2% a 8%
            das emissões globais de gases de efeito estufa.
          </Text>
        </Card>

        <Card>
          <Text style={styles.title}>Moda e clima</Text>
          <Text style={styles.text}>
            A produção têxtil consome grandes quantidades de energia e água, além de
            emitir poluentes em todas as etapas da cadeia produtiva. Tecidos
            sintéticos derivados do petróleo, como poliéster e náilon, têm alta
            pegada de carbono e contribuem para o aquecimento global.
          </Text>
        </Card>

        <Card>
          <Text style={styles.title}>Metas do ODS 13</Text>
          {METAS.map((meta, index) => (
            <View key={index} style={styles.metaItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.metaText}>{meta}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.title}>EcoClothes e o ODS 13</Text>
          <Text style={styles.text}>
            Ao informar sobre emissões de carbono e impacto ambiental dos tecidos,
            o aplicativo incentiva escolhas que reduzem a pegada de carbono da moda,
            contribuindo para ações contra as mudanças climáticas.
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
    backgroundColor: '#3F7E44',
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
