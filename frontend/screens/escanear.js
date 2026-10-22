import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors } from '../theme/colors';

const EXEMPLOS = [
  '65% Algodão, 35% Poliéster',
  '100% Linho',
  '80% Algodão Orgânico, 20% Elastano',
];

export default function Escanear({ navigation }) {
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [composicao, setComposicao] = useState('');
  const [imagemEtiqueta, setImagemEtiqueta] = useState(null);

  async function escolherImagem(source) {
    const permissao = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera ou às fotos para adicionar a etiqueta.');
      return;
    }

    const resultado = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!resultado.canceled) {
      setImagemEtiqueta(resultado.assets[0].uri);
    }
  }

  function abrirSeletorImagem() {
    Alert.alert('Adicionar etiqueta', 'Escolha de onde deseja obter a foto.', [
      { text: 'Câmera', onPress: () => escolherImagem('camera') },
      { text: 'Galeria', onPress: () => escolherImagem('gallery') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function analisar() {
    if (!nome.trim() || !marca.trim() || !composicao.trim()) {
      Alert.alert('Atenção', 'Informe o nome, a marca e a composição da peça.');
      return;
    }
    navigation.navigate('ResultadoAnalise', {
      nome: nome.trim(),
      marca: marca.trim(),
      composicao: composicao.trim(),
      fotoEtiqueta: imagemEtiqueta,
    });
  }

  return (
    <ScreenContainer>
      <Header
        title="Escanear Etiqueta"
        subtitle="Identifique os materiais da peça"
        icon={<Ionicons name="scan" size={32} color={colors.accent} />}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.cameraPlaceholder}>
            <TouchableOpacity style={styles.cameraFrame} onPress={abrirSeletorImagem} activeOpacity={0.85}>
              {imagemEtiqueta ? (
                <Image source={{ uri: imagemEtiqueta }} style={styles.etiquetaImagem} />
              ) : (
                <>
                  <Ionicons name="camera" size={64} color={colors.primaryLight} />
                  <Text style={styles.cameraText}>Fotografe ou selecione a etiqueta</Text>
                  <Text style={styles.cameraSubtext}>A imagem ficará disponível para conferência</Text>
                </>
              )}
            </TouchableOpacity>
            <Button title={imagemEtiqueta ? 'Trocar foto da etiqueta' : 'Adicionar foto da etiqueta'} onPress={abrirSeletorImagem} />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Composição manual</Text>
          <Text style={styles.sectionHint}>
            Cadastre a peça informando nome, marca e a composição como aparece na etiqueta.
          </Text>
          <Input
            placeholder="Nome da peça"
            value={nome}
            onChangeText={setNome}
          />
          <Input
            placeholder="Marca"
            value={marca}
            onChangeText={setMarca}
          />
          <Input
            placeholder="Ex: 65% Algodão, 35% Poliéster"
            value={composicao}
            onChangeText={setComposicao}
            multiline
            style={styles.textArea}
          />
          <Text style={styles.exemplosTitle}>Exemplos rápidos:</Text>
          {EXEMPLOS.map((exemplo) => (
            <Button
              key={exemplo}
              title={exemplo}
              variant="outline"
              onPress={() => setComposicao(exemplo)}
              style={styles.exemploBtn}
            />
          ))}
          <Button title="Analisar Composição" onPress={analisar} />
        </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  cameraPlaceholder: {
    alignItems: 'center',
  },
  cameraFrame: {
    width: '100%',
    height: 200,
    backgroundColor: colors.overlay,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  etiquetaImagem: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    resizeMode: 'contain',
  },
  cameraText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  cameraSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  exemplosTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  exemploBtn: {
    paddingVertical: 10,
  },
});
