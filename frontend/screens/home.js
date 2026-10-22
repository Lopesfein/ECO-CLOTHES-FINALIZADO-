import { Modal, Pressable, ScrollView, Text, StyleSheet, View, Image } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors } from '../theme/colors';

export default function Home({ navigation }) {
  const [menuAberto, setMenuAberto] = useState(false);

  const menuItems = [
    { title: 'Materiais', subtitle: 'Tecidos, origem e impacto real', icon: 'shirt-outline', screen: 'Materiais' },
    { title: 'Sustentabilidade', subtitle: 'Entenda o impacto da moda', icon: 'earth-outline', screen: 'Sustentabilidade' },
    { title: 'Fast Fashion', subtitle: 'O ciclo do consumo descartável', icon: 'flash-outline', screen: 'FastFashion' },
    { title: 'ODS 12', subtitle: 'Consumo e produção responsáveis', icon: 'cart-outline', screen: 'ODS12' },
    { title: 'ODS 13', subtitle: 'Mudanças climáticas e moda', icon: 'cloud-outline', screen: 'ODS13' },
    { title: 'Dicas', subtitle: 'Hábitos para um guarda-roupa consciente', icon: 'bulb-outline', screen: 'Dicas' },
    { title: 'Sobre o Projeto', subtitle: 'Missão, autores e visão', icon: 'information-circle-outline', screen: 'Sobre' },
  ];

  function abrirTela(screen) {
    setMenuAberto(false);
    navigation.navigate(screen);
  }

  return (
    <ScreenContainer>
      <Header
        title="EcoClothes"
        subtitle="Entre na conversa sobre moda consciente"

        onMenu={() => setMenuAberto(true)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroWrap}>
          <Card style={styles.heroCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.badge}>COMUNIDADE ECOCLOTHES</Text>
              <Text style={styles.welcomeTitle}>Veja o que outras pessoas estão usando.</Text>
              <Text style={styles.welcomeText}>
                Compare análises, descubra materiais e participe de uma moda mais transparente.
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.ctaBlock}>
          <Text style={styles.eyebrow}>UM ESPAÇO PARA TROCAR</Text>
          <Text style={styles.ctaTitle}>Sua próxima escolha começa numa boa conversa.</Text>
          <Text style={styles.ctaText}>Entre na comunidade para ver peças analisadas por pessoas reais e abrir os perfis de quem está construindo esse movimento.</Text>
          <Button title="Começar agora" onPress={() => navigation.navigate('Comunidade')} />
        </View>

        <View style={styles.previewRow}>
          <View style={styles.previewItem}><Ionicons name="people" size={22} color={colors.primary} /><Text style={styles.previewText}>Veja a comunidade</Text></View>
          <View style={styles.previewItem}><Ionicons name="analytics" size={22} color={colors.primary} /><Text style={styles.previewText}>Compare EcoScores</Text></View>
          <View style={styles.previewItem}><Ionicons name="repeat" size={22} color={colors.primary} /><Text style={styles.previewText}>Use mais, descarte menos</Text></View>
        </View>
      </ScrollView>

      <Modal visible={menuAberto} animationType="slide" transparent onRequestClose={() => setMenuAberto(false)}>
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={() => setMenuAberto(false)} />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View><Text style={styles.drawerEyebrow}>EXPLORAR</Text><Text style={styles.drawerTitle}>EcoClothes</Text></View>
              <Pressable onPress={() => setMenuAberto(false)} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
            </View>
            <Text style={styles.drawerText}>Acesse os conteúdos que estavam na página inicial.</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {menuItems.map((item) => (
                <Pressable key={item.screen} style={styles.menuItem} onPress={() => abrirTela(item.screen)}>
                  <Ionicons name={item.icon} size={22} color={colors.primary} />
                  <View style={styles.menuCopy}><Text style={styles.menuTitle}>{item.title}</Text><Text style={styles.menuSubtitle}>{item.subtitle}</Text></View>
                  <Text style={styles.menuArrow}>›</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  heroWrap: {
    marginTop: 0,
    marginBottom: 12,
  },
  heroCard: {
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f4efe9',
    borderColor: '#efe2d5',
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(19, 13, 10, 0.38)',
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    zIndex: 1,
  },
  badge: {
    color: '#f6e5d7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 29,
    fontWeight: '700',
    color: '#fffdfb',
    lineHeight: 36,
    maxWidth: 250,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#f4eadf',
    lineHeight: 20,
    maxWidth: 290,
  },
  ctaBlock: {
    marginHorizontal: 16,
    paddingVertical: 22,
  },
  eyebrow: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
    marginBottom: 10,
  },
  ctaText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  previewRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    marginHorizontal: 16,
    gap: 14,
  },
  previewItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  modalLayer: { flex: 1, flexDirection: 'row' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 24, 18, 0.45)' },
  drawer: { width: '84%', maxWidth: 360, backgroundColor: colors.white, padding: 22, paddingTop: 54 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  drawerEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.secondary },
  drawerTitle: { fontSize: 28, fontWeight: '700', color: colors.primary, marginTop: 4 },
  drawerText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 18 },
  closeButton: { padding: 4 },
  closeText: { fontSize: 30, color: colors.textSecondary, lineHeight: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border },
  menuCopy: { flex: 1, marginLeft: 12 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  menuSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  menuArrow: { fontSize: 25, color: colors.primary, marginLeft: 8 },
});
