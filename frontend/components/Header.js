import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function Header({ title, subtitle, onBack, icon, onMenu, onNotification, notificationCount = 0 }) {
  const { cores } = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: cores.primary }]}>
      {onMenu && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenu}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
        >
          <Ionicons name="menu" size={28} color={cores.textLight} />
        </TouchableOpacity>
      )}
      {onNotification && (
        <TouchableOpacity
          style={[styles.notificationButton, onMenu ? styles.notificationWithMenu : styles.notificationAtRight]}
          onPress={onNotification}
          accessibilityRole="button"
          accessibilityLabel="Abrir notificações"
        >
          <Ionicons name="notifications-outline" size={25} color={cores.textLight} />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backText, { color: cores.textLight }]}>← Voltar</Text>
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: cores.textLight }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: cores.accent }]}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 42 : 30,
    paddingBottom: 26,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    padding: 12,
    paddingTop: 20,
    marginBottom: 12,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  backText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 32,
    right: 16,
    zIndex: 2,
    padding: 8,
  },
  notificationButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 32,
    zIndex: 2,
    padding: 8,
  },
  notificationWithMenu: { right: 58 },
  notificationAtRight: { right: 16 },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 1,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 3,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  titleBlock: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textLight,
    lineHeight: 32,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});
