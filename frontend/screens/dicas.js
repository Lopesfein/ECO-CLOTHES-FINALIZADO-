import { FlatList, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import { colors } from '../theme/colors';

const DICAS = [
  {
    id: '1',
    icon: 'scan',
    titulo: 'Escaneie antes de comprar',
    texto: 'Use o EcoClothes para verificar a composição e a nota ecológica antes de adquirir uma peça.',
  },
  {
    id: '2',
    icon: 'leaf',
    titulo: 'Prefira fibras naturais',
    texto: 'Algodão orgânico, linho e lã consomem menos recursos e são mais biodegradáveis que sintéticos.',
  },
  {
    id: '3',
    icon: 'water',
    titulo: 'Economize água na lavagem',
    texto: 'Lave roupas sintéticas com menos frequência e use sacos para microfibras na máquina de lavar.',
  },
  {
    id: '4',
    icon: 'repeat',
    titulo: 'Invista em durabilidade',
    texto: 'Escolha peças de qualidade que durem mais, reduzindo a necessidade de substituição frequente.',
  },
  {
    id: '5',
    icon: 'swap-horizontal',
    titulo: 'Reutilize e doe',
    texto: 'Antes de descartar, considere doar, trocar ou transformar roupas que não usa mais.',
  },
  {
    id: '6',
    icon: 'cart',
    titulo: 'Evite compras por impulso',
    texto: 'Reflita sobre a necessidade real da peça e sua durabilidade antes de comprar.',
  },
  {
    id: '7',
    icon: 'heart',
    titulo: 'Salve e compare',
    texto: 'Use a aba Favoritos para comparar peças e escolher a opção mais sustentável.',
  },
  {
    id: '8',
    icon: 'school',
    titulo: 'Eduque-se',
    texto: 'Explore as seções de Materiais, Sustentabilidade e Fast Fashion para aprender mais.',
  },
];

export default function Dicas({ navigation }) {
  function renderItem({ item }) {
    return (
      <Card>
        <View style={styles.itemHeader}>
          <View style={styles.iconBox}>
            <Ionicons name={item.icon} size={24} color={colors.primary} />
          </View>
          <Text style={styles.titulo}>{item.titulo}</Text>
        </View>
        <Text style={styles.texto}>{item.texto}</Text>
      </Card>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title="Dicas"
        subtitle="Hábitos para moda sustentável"
        icon={<Ionicons name="bulb" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={DICAS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 24,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  texto: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
