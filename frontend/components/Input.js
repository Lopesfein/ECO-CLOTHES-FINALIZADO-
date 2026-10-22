import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function Input({ style, secureTextEntry = false, ...props }) {
  const { cores } = useTheme();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const isPasswordField = secureTextEntry;

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { borderColor: cores.border, backgroundColor: cores.white, color: cores.text }, style, isPasswordField && styles.passwordInput]}
        placeholderTextColor={cores.textSecondary}
        secureTextEntry={isPasswordField && !mostrarSenha}
        {...props}
      />

      {isPasswordField && (
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setMostrarSenha((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={cores.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.text,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  passwordInput: {
    paddingRight: 46,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 6,
  },
});
