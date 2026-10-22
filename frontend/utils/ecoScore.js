import tecidosData from '../data/tecidos.json';

const ALIASES = {
  algodao: ['algodão', 'algodao', 'cotton'],
  algodao_organico: ['algodão orgânico', 'algodao organico', 'organic cotton'],
  poliester: ['poliéster', 'poliester', 'polyester', 'pes'],
  linho: ['linho', 'linen'],
  elastano: ['elastano', 'elastane', 'spandex', 'lycra'],
  nailon: ['náilon', 'nailon', 'nylon', 'poliamida', 'polyamide'],
  viscose: ['viscose', 'rayon', 'modal'],
  la: ['lã', 'la', 'wool'],
  poliester_reciclado: ['poliéster reciclado', 'poliester reciclado', 'recycled polyester', 'rpet'],
  bambu: ['bambu', 'bamboo'],
};

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getAllTecidos() {
  return tecidosData.tecidos;
}

export function getTecidoById(id) {
  return tecidosData.tecidos.find((t) => t.id === id);
}

export function findTecidoByName(name) {
  const normalized = normalizeText(name);
  for (const tecido of tecidosData.tecidos) {
    const aliases = ALIASES[tecido.id] || [tecido.nome];
    if (aliases.some((alias) => normalized.includes(normalizeText(alias)))) {
      return tecido;
    }
  }
  return null;
}

export function parseComposicao(texto) {
  if (!texto || !texto.trim()) return [];

  const partes = texto.split(/[,;]+/);
  const materiais = [];

  partes.forEach((parte) => {
    const match = parte.trim().match(/(\d+)\s*%?\s*(.+)/i);
    if (match) {
      const percentual = parseInt(match[1], 10);
      const nomeMaterial = match[2].trim();
      const tecido = findTecidoByName(nomeMaterial);
      if (tecido) {
        materiais.push({ ...tecido, percentual });
      }
    } else {
      const tecido = findTecidoByName(parte.trim());
      if (tecido) {
        materiais.push({ ...tecido, percentual: null });
      }
    }
  });

  if (materiais.length === 0) {
    const tecido = findTecidoByName(texto);
    if (tecido) {
      materiais.push({ ...tecido, percentual: 100 });
    }
  }

  return materiais;
}

export function calcularNotaEcologica(materiais) {
  if (!materiais || materiais.length === 0) {
    return { nota: 0, nivel: 'Desconhecido', cor: '#9E9E9E' };
  }

  let somaPesos = 0;
  let somaNotas = 0;

  materiais.forEach((material) => {
    const peso = material.percentual || 100 / materiais.length;
    somaPesos += peso;
    somaNotas += material.notaEcologica * peso;
  });

  const nota = Math.round((somaNotas / somaPesos) * 10) / 10;

  let nivel;
  let cor;
  if (nota >= 7) {
    nivel = 'Sustentável';
    cor = '#2E7D32';
  } else if (nota >= 5) {
    nivel = 'Moderado';
    cor = '#F9A825';
  } else {
    nivel = 'Pouco sustentável';
    cor = '#C62828';
  }

  return { nota, nivel, cor };
}

export function getImpactoResumo(materiais) {
  const biodegradaveis = materiais.filter(
    (m) => m.biodegradabilidade === 'Alta'
  ).length;
  const sinteticos = materiais.filter(
    (m) => m.biodegradabilidade === 'Nenhuma' || m.biodegradabilidade === 'Muito baixa'
  ).length;

  return {
    totalMateriais: materiais.length,
    biodegradaveis,
    sinteticos,
  };
}
