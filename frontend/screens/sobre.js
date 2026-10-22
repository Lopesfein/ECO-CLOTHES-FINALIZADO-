import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import { colors } from '../theme/colors';

export default function Sobre({ navigation }) {
  return (
    <ScreenContainer>
      <Header
        title="Sobre o Projeto"
        subtitle="EcoClothes"
        icon={<Ionicons name="information-circle" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.logoRow}>
            <Text style={styles.appName}>EcoClothes</Text>
          </View>
          <Text style={styles.text}>
            EcoClothes nasceu para conectar moda, informação e consciência ambiental. O app transforma uma etiqueta
            comum em uma ferramenta de decisão inteligente, ajudando o usuário a entender o impacto da peça antes da compra.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Missão</Text>
          <Text style={styles.text}>
            Tornar a moda mais transparente e responsável, dando acesso a dados simples e úteis sobre materiais,
            sustentabilidade e consumo consciente.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Autores</Text>
          <Text style={styles.text}>Lorenzo Miguel</Text>
          <Text style={styles.text}>Matheus Pereira</Text>
          <Text style={styles.text}>Vinicius Cardoso</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Orientadores</Text>
          <Text style={styles.text}>Carlos Tadeu Queiroz Morais</Text>
          <Text style={styles.text}>Rafaella Egues da Rosa</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Nossa visão</Text>
          <Text style={styles.text}>
            Queremos construir uma cultura de consumo mais inteligente, reduzindo o desperdício, valorizando a
            qualidade e apresentando alternativas que respeitem o planeta e as pessoas.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          <View style={styles.feature}><Ionicons name="scan" size={18} color={colors.primary} /><Text style={styles.featureText}>Escaneamento de etiquetas</Text></View>
          <View style={styles.feature}><Ionicons name="analytics" size={18} color={colors.primary} /><Text style={styles.featureText}>Análise de composição e nota ecológica</Text></View>
          <View style={styles.feature}><Ionicons name="shirt" size={18} color={colors.primary} /><Text style={styles.featureText}>Banco de dados de materiais</Text></View>
          <View style={styles.feature}><Ionicons name="heart" size={18} color={colors.primary} /><Text style={styles.featureText}>Favoritos para comparação</Text></View>
          <View style={styles.feature}><Ionicons name="book" size={18} color={colors.primary} /><Text style={styles.featureText}>Conteúdo educacional</Text></View>
        </Card>

        <Text style={styles.footer}>Consumo consciente • moda responsável • Agenda 2030</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: 16,
    marginTop: 12,
    lineHeight: 18,
  },
});
