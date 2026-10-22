import { createContext, useContext, useEffect, useState } from 'react';
import { getUsuarioAtual, requestJson, setUsuarioAtual } from '../services/api';

const FavoritosContext = createContext();

function favoritosLocaisDoUsuario(usuarioId) {
  return (globalThis.ecoFavoritos || []).filter((item) => item.usuarioId === usuarioId);
}

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([]);
  const [usuario, setUsuario] = useState(getUsuarioAtual());

  async function carregarFavoritos() {
    const usuarioAtual = usuario || getUsuarioAtual();
    if (!usuarioAtual?.id) {
      setFavoritos([]);
      return;
    }

    try {
      const resposta = await requestJson(`/usuarios/${usuarioAtual.id}/favoritos`);
      const locais = favoritosLocaisDoUsuario(usuarioAtual.id);
      const remotos = resposta || [];
      setFavoritos([
        ...remotos,
        ...locais.filter((local) => !remotos.some((remoto) => remoto.composicao === local.composicao)),
      ]);
    } catch (erro) {
      console.log('Erro ao carregar favoritos:', erro.message);
      setFavoritos(favoritosLocaisDoUsuario(usuarioAtual.id));
    }
  }

  useEffect(() => {
    carregarFavoritos();
  }, [usuario]);

  async function adicionarFavorito(item) {
    const usuarioAtual = usuario || getUsuarioAtual();
    if (!usuarioAtual?.id) {
      return { sucesso: false, mensagem: 'Nenhum usuário autenticado.' };
    }

    const favorito = {
      id: item.id || `favorito-local-${Date.now()}`,
      usuarioId: usuarioAtual.id,
      ...item,
      dataAdicionado: new Date().toISOString(),
    };

    try {
      const resposta = await requestJson('/favoritos', {
        method: 'POST',
        body: JSON.stringify(favorito),
      });

      const favoritoSalvo = resposta?.data || favorito;
      setFavoritos((prev) => {
        const existe = prev.find((f) => f.id === favoritoSalvo.id);
        if (existe) return prev;
        return [...prev, favoritoSalvo];
      });
      return { sucesso: true };
    } catch (erro) {
      console.log('Erro ao salvar favorito:', erro.message);
      const favoritosLocais = favoritosLocaisDoUsuario(usuarioAtual.id);
      if (!favoritosLocais.some((existente) => existente.composicao === favorito.composicao)) {
        globalThis.ecoFavoritos = [...(globalThis.ecoFavoritos || []), favorito];
      }
      setFavoritos(favoritosLocaisDoUsuario(usuarioAtual.id));
      return { sucesso: true, local: true, mensagem: 'Salvo localmente enquanto a API está indisponível.' };
    }
  }

  async function removerFavorito(id) {
    const usuarioAtual = usuario || getUsuarioAtual();
    try {
      await requestJson(`/favoritos/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ usuarioId: usuarioAtual?.id, role: usuarioAtual?.role }),
      });
    } catch (erro) {
      console.log('Erro ao remover favorito:', erro.message);
    }

    setFavoritos((prev) => prev.filter((f) => f.id !== id));
  }

  async function editarFavorito(id, data) {
    const usuarioAtual = usuario || getUsuarioAtual();
    if (!usuarioAtual?.id) {
      return;
    }

    try {
      const resposta = await requestJson(`/favoritos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ usuarioId: usuarioAtual.id, role: usuarioAtual.role, ...data }),
      });
      setFavoritos((prev) => prev.map((f) => (f.id === id ? resposta.data : f)));
    } catch (erro) {
      console.log('Erro ao editar favorito:', erro.message);
    }
  }

  function isFavorito(id) {
    return favoritos.some((f) => f.id === id);
  }

  function atualizarUsuario(novoUsuario) {
    setUsuarioAtual(novoUsuario);
    setUsuario(novoUsuario);
  }

  return (
    <FavoritosContext.Provider
      value={{
        usuario,
        favoritos,
        adicionarFavorito,
        removerFavorito,
        editarFavorito,
        isFavorito,
        carregarFavoritos,
        atualizarUsuario,
      }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error('useFavoritos deve ser usado dentro de FavoritosProvider');
  }
  return context;
}
