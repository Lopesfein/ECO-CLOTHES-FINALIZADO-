import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import { useFavoritos } from '../context/FavoritosContext';
import { getUsuarioAtual } from '../services/api';
import { colors } from '../theme/colors';

export default function Favoritos({ navigation }) {
  const { favoritos, removerFavorito } = useFavoritos();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    setUsuario(getUsuarioAtual());
  }, []);

  function renderItem({ item }) {
    const isOwner = usuario?.id && item.usuarioId === usuario.id;

    return (
      <View style={styles.item}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemNome}>{item.nome || item.composicao}</Text>
          <Text style={styles.itemData}>
            Nota: {item.nota} — {item.nivel}
          </Text>
          {isOwner && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('ResultadoAnalise', { composicao: item.composicao })}
              >
                <Text style={styles.editButtonText}>Ver análise</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => removerFavorito(item.id)}>
          <Text style={styles.deleteText}>Remover</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title="Favoritos"
        subtitle="Peças salvas para comparar"
        icon={<Ionicons name="heart" size={32} color={colors.accent} />}
      />
      {favoritos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
          <Text style={styles.emptyText}>
            Escaneie etiquetas e salve as análises para comparar peças depois.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemData: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
