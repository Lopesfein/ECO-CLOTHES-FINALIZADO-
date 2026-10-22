import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
  loading = false,
}) {
  const { cores } = useTheme();
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isOutline ? 'transparent' : isSecondary ? cores.secondary : cores.primary },
        isOutline && styles.outline,
        isOutline && { borderColor: cores.primary },
        isSecondary && styles.secondary,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? cores.primary : cores.white} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: cores.white },
            isOutline && styles.outlineText,
            isSecondary && styles.secondaryText,
            isOutline && { color: cores.primary },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  outlineText: {
    color: colors.primary,
  },
  secondaryText: {
    color: colors.white,
  },
});
