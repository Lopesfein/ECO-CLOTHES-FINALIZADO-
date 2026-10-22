import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

import Home from '../screens/home';
import Escanear from '../screens/escanear';
import Favoritos from '../screens/favoritos';
import Perfil from '../screens/perfil';
import Amigos from '../screens/amigos';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { cores } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: cores.primary,
        tabBarInactiveTintColor: cores.textSecondary,
        tabBarStyle: {
          backgroundColor: cores.white,
          borderTopColor: cores.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Escanear: focused ? 'scan' : 'scan-outline',
            Favoritos: focused ? 'heart' : 'heart-outline',
            Perfil: focused ? 'person' : 'person-outline',
            Amigos: focused ? 'people' : 'people-outline',
          };

          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: 'Início' }} />
      <Tab.Screen name="Escanear" component={Escanear} options={{ title: 'Escanear' }} />
      <Tab.Screen name="Favoritos" component={Favoritos} options={{ title: 'Favoritos' }} />
      <Tab.Screen name="Amigos" component={Amigos} options={{ title: 'Amigos' }} />
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        initialParams={{ perfilProprio: true }}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}
