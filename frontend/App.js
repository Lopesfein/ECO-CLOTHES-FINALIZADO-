import { StatusBar } from 'expo-status-bar';
import StackNavigator from './navigation/StackNavigator';
import { FavoritosProvider } from './context/FavoritosContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <FavoritosProvider>
        <StatusBar style="auto" />
        <StackNavigator />
      </FavoritosProvider>
    </ThemeProvider>
  );
}
