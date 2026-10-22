import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function ScreenContainer({ children, style }) {
  const { cores } = useTheme();
  return <View style={[styles.container, { backgroundColor: cores.background }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
