import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { requestJson } from '../services/api';

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function cadastrarUsuario() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      setCarregando(true);
      await requestJson('/usuarios', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      });

      setTimeout(() => {
        navigation.replace('Login');
      }, 400);

      Alert.alert('Sucesso', 'Cadastro realizado! Faça login para continuar.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (erro) {
      Alert.alert('Erro no cadastro', erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScreenContainer>
      <Header
        title="Cadastro"
        subtitle="Junte-se ao consumo consciente"
        icon={<Ionicons name="person-add" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' }}
              style={styles.coverImage}
              resizeMode="cover"
            />
            <View style={styles.overlay} />
            <Text style={styles.imageText}>Moda consciente, estilo real.</Text>
          </View>

          <Input placeholder="Nome completo" value={nome} onChangeText={setNome} />
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
          <Button title={carregando ? 'Cadastrando...' : 'Cadastrar'} onPress={cadastrarUsuario} disabled={carregando} />
          <Button
            title="Já tenho conta"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  imageWrap: {
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(24,18,15,0.28)',
  },
  imageText: {
    position: 'absolute',
    left: 16,
    bottom: 14,
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});
