import { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { requestJson } from '../services/api';
import { useFavoritos } from '../context/FavoritosContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { atualizarUsuario } = useFavoritos();
  const { definirTema } = useTheme();

  async function fazerLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha email e senha.');
      return;
    }

    try {
      setCarregando(true);
      const resposta = await requestJson('/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });

      atualizarUsuario(resposta.data);
      definirTema(resposta.data.tema);
      navigation.replace('MainTabs');
    } catch (erro) {
      Alert.alert('Erro ao entrar', erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <View style={styles.content}>
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
            <View style={styles.brandBox}>
              <Ionicons name="leaf" size={32} color={colors.accent} />
              <Text style={styles.logoText}>EcoClothes</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.subtitle}>Consumo consciente na moda</Text>

            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
            <Button title={carregando ? 'Entrando...' : 'Entrar'} onPress={fazerLogin} disabled={carregando} />
            <Button
              title="Criar conta"
              variant="outline"
              onPress={() => navigation.navigate('Cadastro')}
            />
            <Button
              title="Recuperar senha"
              variant="outline"
              onPress={() => navigation.navigate('RecuperarSenha')}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  imageWrap: {
    height: 220,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 18,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(18,14,11,0.35)',
  },
  brandBox: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.6,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#1f1a17',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    fontWeight: '600',
  },
});
