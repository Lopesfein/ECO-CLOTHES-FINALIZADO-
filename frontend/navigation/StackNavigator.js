import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';
import Login from '../screens/login';
import Cadastro from '../screens/cadastro';
import RecuperarSenha from '../screens/recuperarSenha';
import ResultadoAnalise from '../screens/resultadoAnalise';
import Perfil from '../screens/perfil';
import Comunidade from '../screens/comunidade';
import ChatComunidade from '../screens/chatComunidade';
import Materiais from '../screens/materiais';
import Sustentabilidade from '../screens/sustentabilidade';
import FastFashion from '../screens/fastFashion';
import ODS12 from '../screens/ods12';
import ODS13 from '../screens/ods13';
import Dicas from '../screens/dicas';
import Sobre from '../screens/sobre';
import ChatPrivado from '../screens/chatPrivado';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '600' },
};

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={Cadastro}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RecuperarSenha"
          component={RecuperarSenha}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResultadoAnalise"
          component={ResultadoAnalise}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Comunidade"
          component={Comunidade}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatComunidade"
          component={ChatComunidade}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Materiais"
          component={Materiais}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Sustentabilidade"
          component={Sustentabilidade}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FastFashion"
          component={FastFashion}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ODS12"
          component={ODS12}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ODS13"
          component={ODS13}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dicas"
          component={Dicas}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Sobre"
          component={Sobre}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatPrivado"
          component={ChatPrivado}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
