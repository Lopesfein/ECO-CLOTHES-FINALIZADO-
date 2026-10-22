import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function Card({ children, style }) {
  const { cores } = useTheme();
  return <View style={[styles.card, { backgroundColor: cores.card, borderColor: cores.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
