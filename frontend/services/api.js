import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  const manifest = Constants.expoConfig || Constants.manifest || {};
  const debuggerHost = manifest.debuggerHost || manifest.hostUri || '';

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:3000`;
    }
    return `http://${host}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  if (Platform.OS === 'ios') {
    return 'http://127.0.0.1:3000';
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = getApiBaseUrl();

export function getUsuarioAtual() {
  return globalThis.usuario || null;
}

export function setUsuarioAtual(usuario) {
  globalThis.usuario = usuario;
  return usuario;
}

export async function requestJson(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (erro) {
    throw new Error(
      `Não foi possível conectar à API em ${url}. ` +
      'Inicie o backend na porta 3000 e tente novamente.'
    );
  }

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error(
      `A API retornou uma resposta inválida em ${API_BASE_URL}. ` +
      'Verifique se o backend está rodando na porta 3000.'
    );
  }

  if (!response.ok) {
    throw new Error(data?.mensagem || 'Erro na solicitação');
  }

  return data;
}
