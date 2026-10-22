import { createContext, useContext, useState } from 'react';
import { colors } from '../theme/colors';

const lightColors = { ...colors };
const darkColors = {
  ...colors,
  primary: '#D7E7D6',
  primaryDark: '#AFCBB2',
  primaryLight: '#9DB7A0',
  secondary: '#D6A36A',
  accent: '#EBCB9F',
  background: '#101413',
  white: '#222B28',
  text: '#F3F5F2',
  textSecondary: '#B5C0B8',
  textLight: '#101413',
  border: '#34413A',
  card: '#1A211F',
  overlay: 'rgba(157, 183, 160, 0.14)',
};

const ThemeContext = createContext({
  tema: 'claro',
  cores: lightColors,
  alternarTema: () => {},
  definirTema: () => {},
});

function aplicarCores(novasCores) {
  Object.keys(novasCores).forEach((key) => {
    colors[key] = novasCores[key];
  });
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(globalThis.ecoTema || 'claro');
  const cores = tema === 'escuro' ? darkColors : lightColors;

  aplicarCores(cores);

  function alternarTema() {
    setTema((atual) => {
      const proximo = atual === 'claro' ? 'escuro' : 'claro';
      globalThis.ecoTema = proximo;
      aplicarCores(proximo === 'escuro' ? darkColors : lightColors);
      return proximo;
    });
  }

  function definirTema(novoTema) {
    const proximoTema = novoTema === 'escuro' ? 'escuro' : 'claro';
    globalThis.ecoTema = proximoTema;
    aplicarCores(proximoTema === 'escuro' ? darkColors : lightColors);
    setTema(proximoTema);
  }

  return (
    <ThemeContext.Provider value={{ tema, cores, alternarTema, definirTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
