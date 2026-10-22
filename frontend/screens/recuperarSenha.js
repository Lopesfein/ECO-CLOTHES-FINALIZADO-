import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { requestJson } from '../services/api';

export default function RecuperarSenha({ navigation }) {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [etapa, setEtapa] = useState('email');

  async function enviarCodigo() {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Informe seu e-mail para recuperar a senha.');
      return;
    }

    try {
      setCarregando(true);
      const resposta = await requestJson('/recuperar-senha', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      Alert.alert(
        'Código enviado',
        'Enviamos o código para o e-mail informado. Verifique também a caixa de spam.',
      );
      setEtapa('codigo');
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    } finally {
      setCarregando(false);
    }
  }

  async function validarCodigo() {
    if (!codigo.trim()) {
      Alert.alert('Atenção', 'Informe o código recebido.');
      return;
    }

    try {
      setCarregando(true);
      await requestJson('/verificar-codigo', {
        method: 'POST',
        body: JSON.stringify({ email, codigo }),
      });

      setEtapa('senha');
      Alert.alert('Código validado', 'Agora defina a sua nova senha.');
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    } finally {
      setCarregando(false);
    }
  }

  async function redefinirSenha() {
    if (!novaSenha.trim() || !confirmarSenha.trim()) {
      Alert.alert('Atenção', 'Preencha a nova senha e a confirmação.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não conferem.');
      return;
    }

    try {
      setCarregando(true);
      await requestJson('/redefinir-senha', {
        method: 'POST',
        body: JSON.stringify({ email, codigo, senha: novaSenha }),
      });

      Alert.alert('Senha alterada', 'Sua senha foi redefinida com sucesso.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    } finally {
      setCarregando(false);
    }
  }

  const title = etapa === 'codigo' ? 'Confirmar código' : etapa === 'senha' ? 'Nova senha' : 'Recuperar senha';
  const subtitle = etapa === 'codigo'
    ? 'Digite o código recebido'
    : etapa === 'senha'
      ? 'Defina uma nova senha'
      : 'Envie o código para redefinir sua senha';

  return (
    <ScreenContainer>
      <Header
        title={title}
        subtitle={subtitle}
        icon={<Ionicons name="mail-open" size={32} color={colors.accent} />}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          {etapa === 'email'
            ? 'Informe o e-mail cadastrado. O backend irá gerar um código de recuperação para você usar no próximo passo.'
            : etapa === 'codigo'
              ? 'Digite o código gerado para continuar com a redefinição da senha.'
              : 'Escolha uma nova senha para concluir a recuperação.'}
        </Text>

        {etapa === 'email' && (
          <Input
            placeholder="Seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}

        {etapa === 'codigo' && (
          <Input
            placeholder="Código recebido"
            value={codigo}
            onChangeText={setCodigo}
            keyboardType="number-pad"
          />
        )}

        {etapa === 'senha' && (
          <>
            <Input
              placeholder="Nova senha"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
            />
            <Input
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
            />
          </>
        )}

        {etapa === 'email' && (
          <Button
            title={carregando ? 'Gerando código...' : 'Gerar código'}
            onPress={enviarCodigo}
            loading={carregando}
          />
        )}

        {etapa === 'codigo' && (
          <Button
            title={carregando ? 'Validando...' : 'Validar código'}
            onPress={validarCodigo}
            loading={carregando}
          />
        )}

        {etapa === 'senha' && (
          <Button
            title={carregando ? 'Salvando...' : 'Salvar nova senha'}
            onPress={redefinirSenha}
            loading={carregando}
          />
        )}

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
});
