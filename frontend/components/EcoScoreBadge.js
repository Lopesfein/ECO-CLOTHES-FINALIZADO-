import { useState } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function EcoScoreBadge({ nota, nivel, cor, size = 'large', interactive = false }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';
  const [aberto, setAberto] = useState(false);
  const explicacao = nota >= 7
    ? 'Boa escolha: este material combina menor impacto com potencial de uso prolongado.'
    : nota >= 5
      ? 'Escolha intermediária: a durabilidade e o cuidado com a peça fazem diferença.'
      : 'Atenção: priorize usar por mais tempo, reparar e evitar novas compras por impulso.';

  const conteudo = (
    <>
      <View
        style={[
          styles.circle,
          isSmall && styles.smallCircle,
          { borderColor: cor || colors.primary },
          isLarge && styles.largeCircle,
        ]}
      >
        <Text style={[styles.nota, isSmall && styles.smallNota, isLarge && styles.largeNota]}>
          {nota}
        </Text>
        {!isSmall && <Text style={styles.maxNota}>/10</Text>}
      </View>
      {nivel ? (
        <Text style={[styles.nivel, { color: cor || colors.primary }]}>{nivel}</Text>
      ) : null}
      {interactive && (
        <Text style={styles.hint}>{aberto ? 'Toque para fechar' : 'Toque para entender'}</Text>
      )}
    </>
  );

  return (
    <View style={[styles.container, isLarge && styles.largeContainer]}>
      {interactive ? (
        <Pressable onPress={() => setAberto((valor) => !valor)} style={styles.pressable}>
          {conteudo}
          {aberto && <Text style={styles.explicacao}>{explicacao}</Text>}
        </Pressable>
      ) : conteudo}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  largeContainer: {
    paddingVertical: 16,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
  },
  smallCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  largeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
  },
  smallNota: {
    fontSize: 16,
  },
  nota: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  largeNota: {
    fontSize: 40,
  },
  maxNota: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  nivel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  pressable: {
    alignItems: 'center',
  },
  hint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
  },
  explicacao: {
    maxWidth: 280,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
});
