const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { get, all, run } = require('./dbconfig');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function toDatabaseDate(date = new Date()) {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (erro) {
    return value;
  }
}

async function criarUsuarioAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminSenha = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminSenha) {
    console.warn('ADMIN_EMAIL e ADMIN_PASSWORD nao configurados; criacao do administrador ignorada.');
    return;
  }

  const usuarioExistente = await get('SELECT * FROM usuarios WHERE email = ?', [normalizeEmail(adminEmail)]);
  if (usuarioExistente) {
    return;
  }

  const senhaCriptografada = await bcrypt.hash(adminSenha, 10);
  const admin = {
    id: createId('usuario'),
    nome: 'Administrador EcoClothes',
    email: normalizeEmail(adminEmail),
    senha: senhaCriptografada,
    criadoEm: toDatabaseDate(),
    role: 'admin',
  };

  await run(
    'INSERT INTO usuarios (id, nome, email, senha, criadoEm, role) VALUES (?, ?, ?, ?, ?, ?)',
    [admin.id, admin.nome, admin.email, admin.senha, admin.criadoEm, admin.role]
  );
}

function getTecidos() {
  const filePath = path.resolve(__dirname, '../frontend/data/tecidos.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.tecidos;
}

const recuperacoes = new Map();

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function enviarCodigoPorEmail(email, codigo, nome = '') {
  const usuario = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const senha = process.env.GMAIL_PASS || process.env.EMAIL_PASS;

  if (!usuario || !senha) {
    console.warn('Credenciais do Gmail não configuradas. Código de recuperação:', codigo);
    throw new Error('Credenciais do Gmail não configuradas.');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: usuario,
      pass: senha,
    },
  });

  await transporter.sendMail({
    from: `EcoClothes <${usuario}>`,
    to: email,
    subject: 'Código de recuperação de senha - EcoClothes',
    html: `
      <h3>Olá, ${nome || 'usuário'}!</h3>
      <p>Você solicitou a recuperação da sua senha no EcoClothes.</p>
      <p>Use o código abaixo para redefinir sua senha:</p>
      <h2>${codigo}</h2>
      <p>Este código expira em 15 minutos.</p>
      <p>Se você não fez essa solicitação, ignore este e-mail.</p>
    `,
  });

  return true;
}

app.get('/health', (req, res) => {
  res.json({ ok: true, mensagem: 'Backend do EcoClothes funcionando' });
});

app.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
    return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios.' });
  }

  const emailNormalizado = normalizeEmail(email);

  const usuarioExistente = await get('SELECT id FROM usuarios WHERE email = ?', [emailNormalizado]);
  if (usuarioExistente) {
    return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10);
  const novoUsuario = {
    id: createId('usuario'),
    nome: nome.trim(),
    email: emailNormalizado,
    senha: senhaCriptografada,
    criadoEm: toDatabaseDate(),
  };

  await run(
    'INSERT INTO usuarios (id, nome, email, senha, criadoEm) VALUES (?, ?, ?, ?, ?)',
    [novoUsuario.id, novoUsuario.nome, novoUsuario.email, novoUsuario.senha, novoUsuario.criadoEm]
  );

  res.status(201).json({
    sucesso: true,
    mensagem: 'Usuário cadastrado com sucesso',
    data: {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    },
  });
});

app.get('/usuarios', async (req, res) => {
  const usuarios = await all('SELECT id, nome, email, criadoEm, role, fotoPerfil, tema FROM usuarios ORDER BY criadoEm DESC');
  res.json(usuarios);
});

app.get('/usuarios/busca', async (req, res) => {
  const nome = String(req.query.nome || '').trim();
  if (!nome) {
    return res.json([]);
  }

  const usuarios = await all(
    'SELECT id, nome, email, criadoEm, role, fotoPerfil, tema FROM usuarios WHERE nome LIKE ? ORDER BY nome ASC LIMIT 30',
    [`%${nome}%`]
  );
  res.json(usuarios);
});

app.get('/usuarios/:id', async (req, res) => {
  const usuario = await get('SELECT id, nome, email, criadoEm, role, fotoPerfil, tema FROM usuarios WHERE id = ?', [req.params.id]);
  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
  }
  res.json(usuario);
});

app.put('/usuarios/:id', async (req, res) => {
  const usuario = await get('SELECT id, nome, email, criadoEm, role, fotoPerfil, tema FROM usuarios WHERE id = ?', [req.params.id]);
  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
  }

  const nome = typeof req.body.nome === 'string' && req.body.nome.trim() ? req.body.nome.trim() : usuario.nome;
  const fotoPerfil = req.body.fotoPerfil === null || typeof req.body.fotoPerfil === 'string' ? req.body.fotoPerfil : usuario.fotoPerfil;
  const tema = req.body.tema === 'escuro' ? 'escuro' : req.body.tema === 'claro' ? 'claro' : (usuario.tema || 'claro');

  await run('UPDATE usuarios SET nome = ?, fotoPerfil = ?, tema = ? WHERE id = ?', [nome, fotoPerfil, tema, req.params.id]);
  res.json({ sucesso: true, data: { ...usuario, nome, fotoPerfil, tema } });
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email?.trim() || !senha?.trim()) {
    return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
  }

  const usuario = await get('SELECT * FROM usuarios WHERE email = ?', [normalizeEmail(email)]);

  if (!usuario) {
    return res.status(401).json({ mensagem: 'Usuário não encontrado.' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

  if (!senhaCorreta) {
    return res.status(401).json({ mensagem: 'Senha incorreta.' });
  }

  const { senha: _, ...usuarioSemSenha } = usuario;

  res.json({
    sucesso: true,
    mensagem: 'Login bem-sucedido',
    data: usuarioSemSenha,
  });
});

app.get('/tecidos', (req, res) => {
  res.json(getTecidos());
});

app.get('/analises', async (req, res) => {
  const busca = String(req.query.busca || '').trim();
  const parametros = [];
  const filtro = busca
    ? `WHERE a.nome LIKE ? OR a.marca LIKE ? OR a.composicao LIKE ?`
    : '';

  if (busca) {
    const termo = `%${busca}%`;
    parametros.push(termo, termo, termo);
  }

  const analises = await all(
    `SELECT a.*, u.nome AS usuarioNome
     FROM analises a
     LEFT JOIN usuarios u ON a.usuarioId = u.id
     ${filtro}
     ORDER BY a.dataCriacao DESC`
    , parametros
  );

  res.json(analises.map((item) => ({
    ...item,
    resultado: parseJson(item.resultado),
    materiais: parseJson(item.materiais),
  })));
});

app.put('/analises/:id', async (req, res) => {
  const { usuarioId, nome, marca, composicao, resultado, materiais } = req.body;
  const { id } = req.params;

  const analiseExistente = await get('SELECT * FROM analises WHERE id = ?', [id]);
  if (!analiseExistente) {
    return res.status(404).json({ mensagem: 'Análise não encontrada.' });
  }

  if (!usuarioId || analiseExistente.usuarioId !== usuarioId) {
    return res.status(403).json({ mensagem: 'Somente o usuário que cadastrou esta peça pode editá-la.' });
  }

  const analiseAtualizada = {
    ...analiseExistente,
    nome: nome?.trim() || analiseExistente.nome,
    marca: marca?.trim() || analiseExistente.marca,
    composicao: composicao?.trim() || analiseExistente.composicao,
    resultado: resultado ? JSON.stringify(resultado) : analiseExistente.resultado,
    materiais: materiais ? JSON.stringify(materiais) : analiseExistente.materiais,
  };

  await run(
    'UPDATE analises SET nome = ?, marca = ?, composicao = ?, resultado = ?, materiais = ? WHERE id = ?',
    [analiseAtualizada.nome, analiseAtualizada.marca, analiseAtualizada.composicao, analiseAtualizada.resultado, analiseAtualizada.materiais, id]
  );

  res.json({ sucesso: true, mensagem: 'Análise atualizada com sucesso', data: analiseAtualizada });
});

app.delete('/analises/:id', async (req, res) => {
  const { usuarioId, role } = req.body;
  const { id } = req.params;

  const analiseExistente = await get('SELECT * FROM analises WHERE id = ?', [id]);
  if (!analiseExistente) {
    return res.status(404).json({ mensagem: 'Análise não encontrada.' });
  }

  if (analiseExistente.usuarioId !== usuarioId && role !== 'admin') {
    return res.status(403).json({ mensagem: 'Não autorizado a remover esta análise.' });
  }

  await run('DELETE FROM analises WHERE id = ?', [id]);

  res.json({ sucesso: true, mensagem: 'Análise removida com sucesso' });
});

app.get('/mensagens', async (req, res) => {
  const mensagens = await all(`SELECT * FROM mensagens ORDER BY dataCriacao ASC`);
  res.json(mensagens);
});

app.post('/mensagens', async (req, res) => {
  const { usuarioId, autor, texto } = req.body;

  if (!autor?.trim() || !texto?.trim()) {
    return res.status(400).json({ mensagem: 'Autor e texto são obrigatórios.' });
  }

  const mensagem = {
    id: createId('msg'),
    usuarioId: usuarioId || null,
    autor: autor.trim(),
    texto: texto.trim(),
    dataCriacao: toDatabaseDate(),
  };

  await run(
    'INSERT INTO mensagens (id, usuarioId, autor, texto, dataCriacao) VALUES (?, ?, ?, ?, ?)',
    [mensagem.id, mensagem.usuarioId, mensagem.autor, mensagem.texto, mensagem.dataCriacao]
  );

  res.status(201).json({ sucesso: true, mensagem: 'Mensagem enviada com sucesso', data: mensagem });
});

app.delete('/mensagens/:id', async (req, res) => {
  const { usuarioId, role } = req.body;
  const { id } = req.params;

  const mensagemExistente = await get('SELECT * FROM mensagens WHERE id = ?', [id]);
  if (!mensagemExistente) {
    return res.status(404).json({ mensagem: 'Mensagem não encontrada.' });
  }

  if (mensagemExistente.usuarioId !== usuarioId && role !== 'admin') {
    return res.status(403).json({ mensagem: 'Não autorizado a remover esta mensagem.' });
  }

  await run('DELETE FROM mensagens WHERE id = ?', [id]);

  res.json({ sucesso: true, mensagem: 'Mensagem removida com sucesso' });
});

app.get('/mensagens-privadas', async (req, res) => {
  const usuarioId = String(req.query.usuarioId || '');
  const contatoId = String(req.query.contatoId || '');

  if (!usuarioId || !contatoId) {
    return res.status(400).json({ mensagem: 'Usuários da conversa são obrigatórios.' });
  }

  const mensagens = await all(
    `SELECT id, remetenteId, destinatarioId, texto, dataCriacao
     FROM mensagensPrivadas
     WHERE (remetenteId = ? AND destinatarioId = ?)
        OR (remetenteId = ? AND destinatarioId = ?)
     ORDER BY dataCriacao ASC`,
    [usuarioId, contatoId, contatoId, usuarioId]
  );
  res.json(mensagens);
});

app.patch('/mensagens-privadas/lidas', async (req, res) => {
  const { usuarioId, contatoId } = req.body;
  if (!usuarioId || !contatoId) {
    return res.status(400).json({ mensagem: 'Usuários da conversa são obrigatórios.' });
  }
  await run(
    'UPDATE mensagensPrivadas SET lida = 1 WHERE destinatarioId = ? AND remetenteId = ?',
    [usuarioId, contatoId]
  );
  res.json({ sucesso: true });
});

app.delete('/mensagens-privadas/:id', async (req, res) => {
  const usuarioId = req.query.usuarioId || req.body.usuarioId;
  const mensagem = await get(
    'SELECT id FROM mensagensPrivadas WHERE id = ? AND remetenteId = ?',
    [req.params.id, usuarioId]
  );

  if (!mensagem) {
    return res.status(404).json({ mensagem: 'Mensagem não encontrada ou não pertence a você.' });
  }

  await run('DELETE FROM mensagensPrivadas WHERE id = ?', [req.params.id]);
  res.json({ sucesso: true, mensagem: 'Mensagem apagada.' });
});

app.post('/mensagens-privadas/:id/apagar', async (req, res) => {
  const usuarioId = req.body.usuarioId || req.query.usuarioId;
  const mensagem = await get(
    'SELECT id FROM mensagensPrivadas WHERE id = ? AND remetenteId = ?',
    [req.params.id, usuarioId]
  );

  if (!mensagem) {
    return res.status(404).json({ mensagem: 'Mensagem não encontrada ou não pertence a você.' });
  }

  await run('DELETE FROM mensagensPrivadas WHERE id = ?', [req.params.id]);
  res.json({ sucesso: true, mensagem: 'Mensagem apagada.' });
});

app.get('/notificacoes-mensagens', async (req, res) => {
  const usuarioId = String(req.query.usuarioId || '');
  if (!usuarioId) return res.status(400).json({ mensagem: 'Usuário é obrigatório.' });

  const mensagens = await all(
    `SELECT m.id, m.remetenteId, m.texto, m.dataCriacao, u.nome AS remetenteNome, u.fotoPerfil AS remetenteFotoPerfil
     FROM mensagensPrivadas m
     INNER JOIN usuarios u ON u.id = m.remetenteId
     WHERE m.destinatarioId = ? AND m.lida = 0
     ORDER BY m.dataCriacao DESC`,
    [usuarioId]
  );
  res.json(mensagens);
});

app.post('/mensagens-privadas', async (req, res) => {
  const { remetenteId, destinatarioId, texto } = req.body;

  if (!remetenteId || !destinatarioId || !texto?.trim()) {
    return res.status(400).json({ mensagem: 'Remetente, destinatário e mensagem são obrigatórios.' });
  }

  if (remetenteId === destinatarioId) {
    return res.status(400).json({ mensagem: 'Você não pode enviar mensagem para si mesmo.' });
  }

  const bloqueio = await get(
    'SELECT id FROM bloqueios WHERE bloqueadorId = ? AND bloqueadoId = ? LIMIT 1',
    [destinatarioId, remetenteId]
  );
  if (bloqueio) {
    return res.status(403).json({ mensagem: 'Este usuário bloqueou o recebimento de mensagens.' });
  }

  const usuarios = await all('SELECT id FROM usuarios WHERE id IN (?, ?)', [remetenteId, destinatarioId]);
  if (usuarios.length !== 2) {
    return res.status(404).json({ mensagem: 'Usuário da conversa não foi encontrado.' });
  }

  const mensagem = {
    id: createId('mensagem-privada'),
    remetenteId,
    destinatarioId,
    texto: texto.trim(),
    dataCriacao: toDatabaseDate(),
  };

  await run(
    'INSERT INTO mensagensPrivadas (id, remetenteId, destinatarioId, texto, dataCriacao) VALUES (?, ?, ?, ?, ?)',
    [mensagem.id, mensagem.remetenteId, mensagem.destinatarioId, mensagem.texto, mensagem.dataCriacao]
  );

  res.status(201).json({ sucesso: true, data: mensagem });
});

app.post('/convites-amizade', async (req, res) => {
  const { remetenteId, destinatarioId } = req.body;

  if (!remetenteId || !destinatarioId) {
    return res.status(400).json({ mensagem: 'Remetente e destinatário são obrigatórios.' });
  }
  if (remetenteId === destinatarioId) {
    return res.status(400).json({ mensagem: 'Você não pode convidar a si mesmo.' });
  }

  const usuarios = await all('SELECT id FROM usuarios WHERE id IN (?, ?)', [remetenteId, destinatarioId]);
  if (usuarios.length !== 2) {
    return res.status(404).json({ mensagem: 'Usuário do convite não foi encontrado.' });
  }

  const conviteExistente = await get(
    `SELECT id, remetenteId, destinatarioId, status, dataCriacao FROM convitesAmizade
     WHERE (remetenteId = ? AND destinatarioId = ?)
        OR (remetenteId = ? AND destinatarioId = ?)
     LIMIT 1`,
    [remetenteId, destinatarioId, destinatarioId, remetenteId]
  );
  if (conviteExistente) {
    if (conviteExistente.status === 'recusado') {
      const dataCriacao = toDatabaseDate();
      await run(
        'UPDATE convitesAmizade SET remetenteId = ?, destinatarioId = ?, status = ?, dataCriacao = ? WHERE id = ?',
        [remetenteId, destinatarioId, 'pendente', dataCriacao, conviteExistente.id]
      );
      return res.status(201).json({
        sucesso: true,
        convite: { ...conviteExistente, remetenteId, destinatarioId, status: 'pendente', dataCriacao },
        mensagem: 'Convite enviado novamente.',
      });
    }

    if (conviteExistente.status === 'aceito') {
      const usuarioAId = [remetenteId, destinatarioId].sort()[0];
      const usuarioBId = [remetenteId, destinatarioId].sort()[1];
      const amizade = await get(
        'SELECT id FROM amizades WHERE usuarioAId = ? AND usuarioBId = ?',
        [usuarioAId, usuarioBId]
      );
      if (!amizade) {
        await run('DELETE FROM convitesAmizade WHERE id = ?', [conviteExistente.id]);
      } else {
        return res.json({ sucesso: true, convite: conviteExistente, mensagem: 'Vocês já são amigos.' });
      }
    } else {
      return res.json({ sucesso: true, convite: conviteExistente, mensagem: 'Convite já enviado.' });
    }
  }

  const convite = {
    id: createId('convite'),
    remetenteId,
    destinatarioId,
    status: 'pendente',
    dataCriacao: toDatabaseDate(),
  };
  await run(
    'INSERT INTO convitesAmizade (id, remetenteId, destinatarioId, status, dataCriacao) VALUES (?, ?, ?, ?, ?)',
    [convite.id, convite.remetenteId, convite.destinatarioId, convite.status, convite.dataCriacao]
  );

  res.status(201).json({ sucesso: true, convite, mensagem: 'Convite enviado com sucesso.' });
});

app.get('/convites-amizade', async (req, res) => {
  const usuarioId = String(req.query.usuarioId || '');
  if (!usuarioId) {
    return res.status(400).json({ mensagem: 'Usuário é obrigatório.' });
  }

  const convites = await all(
    `SELECT c.id, c.remetenteId, c.destinatarioId, c.status, c.dataCriacao,
            u.nome AS remetenteNome, u.email AS remetenteEmail, u.fotoPerfil AS remetenteFotoPerfil
     FROM convitesAmizade c
     INNER JOIN usuarios u ON u.id = c.remetenteId
     WHERE c.destinatarioId = ? AND c.status = 'pendente'
     ORDER BY c.dataCriacao DESC`,
    [usuarioId]
  );
  res.json(convites);
});

app.patch('/convites-amizade/:id', async (req, res) => {
  const { status, usuarioId } = req.body;
  if (!['aceito', 'recusado'].includes(status) || !usuarioId) {
    return res.status(400).json({ mensagem: 'Status e usuário são obrigatórios.' });
  }

  const convite = await get(
    'SELECT * FROM convitesAmizade WHERE id = ? AND destinatarioId = ?',
    [req.params.id, usuarioId]
  );
  if (!convite) {
    return res.status(404).json({ mensagem: 'Convite não encontrado.' });
  }

  await run('UPDATE convitesAmizade SET status = ? WHERE id = ?', [status, req.params.id]);
  if (status === 'aceito') {
    const usuarioAId = [convite.remetenteId, convite.destinatarioId].sort()[0];
    const usuarioBId = [convite.remetenteId, convite.destinatarioId].sort()[1];
    await run(
      'INSERT IGNORE INTO amizades (id, usuarioAId, usuarioBId, dataCriacao) VALUES (?, ?, ?, ?)',
      [createId('amizade'), usuarioAId, usuarioBId, toDatabaseDate()]
    );
  }
  res.json({ sucesso: true, status, mensagem: status === 'aceito' ? 'Amizade aceita.' : 'Convite recusado.' });
});

app.get('/amizades', async (req, res) => {
  const usuarioId = String(req.query.usuarioId || '');
  if (!usuarioId) return res.status(400).json({ mensagem: 'Usuário é obrigatório.' });

  const amigos = await all(
    `SELECT u.id, u.nome, u.email, u.fotoPerfil
     FROM amizades a
     INNER JOIN usuarios u ON u.id = IF(a.usuarioAId = ?, a.usuarioBId, a.usuarioAId)
     WHERE a.usuarioAId = ? OR a.usuarioBId = ?
     ORDER BY u.nome ASC`,
    [usuarioId, usuarioId, usuarioId]
  );
  res.json(amigos);
});

app.delete('/amizades/:amigoId', async (req, res) => {
  const usuarioId = String(req.body.usuarioId || '');
  const amigoId = String(req.params.amigoId || '');
  if (!usuarioId || !amigoId) {
    return res.status(400).json({ mensagem: 'Usuários são obrigatórios.' });
  }

  const usuarioAId = [usuarioId, amigoId].sort()[0];
  const usuarioBId = [usuarioId, amigoId].sort()[1];
  const resultado = await run(
    'DELETE FROM amizades WHERE usuarioAId = ? AND usuarioBId = ?',
    [usuarioAId, usuarioBId]
  );
  if (!resultado.changes) {
    return res.status(404).json({ mensagem: 'Amizade não encontrada.' });
  }
  await run(
    `DELETE FROM convitesAmizade
     WHERE (remetenteId = ? AND destinatarioId = ?)
        OR (remetenteId = ? AND destinatarioId = ?)`,
    [usuarioId, amigoId, amigoId, usuarioId]
  );
  res.json({ sucesso: true, mensagem: 'Amizade removida.' });
});

app.get('/bloqueios', async (req, res) => {
  const usuarioId = String(req.query.usuarioId || '');
  if (!usuarioId) return res.status(400).json({ mensagem: 'Usuário é obrigatório.' });

  const bloqueios = await all(
    `SELECT b.bloqueadoId AS usuarioId, u.nome, u.email, u.fotoPerfil
     FROM bloqueios b
     INNER JOIN usuarios u ON u.id = b.bloqueadoId
     WHERE b.bloqueadorId = ?
     ORDER BY u.nome ASC`,
    [usuarioId]
  );
  res.json(bloqueios);
});

app.delete('/bloqueios/:bloqueadoId', async (req, res) => {
  const bloqueadorId = String(req.body.usuarioId || '');
  const bloqueadoId = String(req.params.bloqueadoId || '');
  if (!bloqueadorId || !bloqueadoId) {
    return res.status(400).json({ mensagem: 'Usuários são obrigatórios.' });
  }

  const resultado = await run(
    'DELETE FROM bloqueios WHERE bloqueadorId = ? AND bloqueadoId = ?',
    [bloqueadorId, bloqueadoId]
  );
  if (!resultado.changes) {
    return res.status(404).json({ mensagem: 'Bloqueio não encontrado.' });
  }
  res.json({ sucesso: true, mensagem: 'Usuário desbloqueado.' });
});

app.post('/bloqueios', async (req, res) => {
  const { bloqueadorId, bloqueadoId } = req.body;
  if (!bloqueadorId || !bloqueadoId || bloqueadorId === bloqueadoId) {
    return res.status(400).json({ mensagem: 'Usuários válidos são obrigatórios.' });
  }

  const usuario = await get('SELECT id FROM usuarios WHERE id = ?', [bloqueadoId]);
  if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

  await run(
    'INSERT IGNORE INTO bloqueios (id, bloqueadorId, bloqueadoId, dataCriacao) VALUES (?, ?, ?, ?)',
    [createId('bloqueio'), bloqueadorId, bloqueadoId, toDatabaseDate()]
  );

  const usuarioAId = [bloqueadorId, bloqueadoId].sort()[0];
  const usuarioBId = [bloqueadorId, bloqueadoId].sort()[1];
  await run('DELETE FROM amizades WHERE usuarioAId = ? AND usuarioBId = ?', [usuarioAId, usuarioBId]);
  await run(
    `DELETE FROM convitesAmizade
     WHERE (remetenteId = ? AND destinatarioId = ?)
        OR (remetenteId = ? AND destinatarioId = ?)`,
    [bloqueadorId, bloqueadoId, bloqueadoId, bloqueadorId]
  );

  res.json({ sucesso: true, mensagem: 'Usuário bloqueado.' });
});

app.post('/recuperar-senha', async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ mensagem: 'Informe um e-mail para recuperar a senha.' });
  }

  const usuario = await get('SELECT id, nome, email FROM usuarios WHERE email = ?', [normalizeEmail(email)]);

  if (!usuario) {
    return res.json({ sucesso: true, mensagem: 'Se o e-mail estiver cadastrado, enviaremos instruções.' });
  }

  const codigo = gerarCodigo();
  recuperacoes.set(usuario.email, {
    codigo,
    usuarioId: usuario.id,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  try {
    await enviarCodigoPorEmail(usuario.email, codigo, usuario.nome);
    return res.json({
      sucesso: true,
      mensagem: 'Código enviado para o seu e-mail. Verifique também a caixa de spam.',
    });
  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro.message);
    return res.status(500).json({
      mensagem: 'Não foi possível enviar o e-mail. Verifique as credenciais do Gmail.',
    });
  }
});

app.post('/verificar-codigo', (req, res) => {
  const { email, codigo } = req.body;

  const recuperacao = recuperacoes.get(normalizeEmail(email));

  if (!recuperacao || recuperacao.codigo !== codigo) {
    return res.status(400).json({ mensagem: 'Código inválido.' });
  }

  if (Date.now() > recuperacao.expiresAt) {
    recuperacoes.delete(normalizeEmail(email));
    return res.status(400).json({ mensagem: 'Código expirado.' });
  }

  return res.json({ sucesso: true, mensagem: 'Código validado com sucesso.', usuarioId: recuperacao.usuarioId });
});

app.post('/redefinir-senha', async (req, res) => {
  const { email, codigo, senha } = req.body;

  if (!email?.trim() || !codigo || !senha?.trim()) {
    return res.status(400).json({ mensagem: 'Informe e-mail, código e nova senha.' });
  }

  const recuperacao = recuperacoes.get(normalizeEmail(email));

  if (!recuperacao || recuperacao.codigo !== codigo) {
    return res.status(400).json({ mensagem: 'Código inválido.' });
  }

  if (Date.now() > recuperacao.expiresAt) {
    recuperacoes.delete(normalizeEmail(email));
    return res.status(400).json({ mensagem: 'Código expirado.' });
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10);
  await run('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaCriptografada, recuperacao.usuarioId]);
  recuperacoes.delete(normalizeEmail(email));

  return res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso.' });
});

app.post('/analises', async (req, res) => {
  const { usuarioId, nome, marca, composicao, resultado, materiais } = req.body;

  if (!usuarioId || !composicao?.trim()) {
    return res.status(400).json({ mensagem: 'Usuário e composição são obrigatórios.' });
  }

  const nomeCadastro = nome?.trim() || composicao.trim();
  const marcaCadastro = marca?.trim() || 'Não informada';

  const analise = {
    id: createId('analise'),
    usuarioId,
    nome: nomeCadastro,
    marca: marcaCadastro,
    composicao,
    resultado: JSON.stringify(resultado || {}),
    materiais: JSON.stringify(materiais || []),
    dataCriacao: toDatabaseDate(),
  };

  await run(
    'INSERT INTO analises (id, usuarioId, nome, marca, composicao, resultado, materiais, dataCriacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [analise.id, analise.usuarioId, analise.nome, analise.marca, analise.composicao, analise.resultado, analise.materiais, analise.dataCriacao]
  );

  res.status(201).json({ sucesso: true, mensagem: 'Análise salva com sucesso', data: analise });
});

app.get('/usuarios/:id/analises', async (req, res) => {
  const analises = await all('SELECT * FROM analises WHERE usuarioId = ? ORDER BY dataCriacao DESC', [req.params.id]);
  res.json(analises.map((item) => ({
    ...item,
    resultado: parseJson(item.resultado),
    materiais: parseJson(item.materiais),
  })));
});

app.post('/favoritos', async (req, res) => {
  const { usuarioId, composicao, nome, nota, nivel, materiais } = req.body;

  if (!usuarioId || !composicao) {
    return res.status(400).json({ mensagem: 'Usuário e composição são obrigatórios.' });
  }

  const usuario = await get('SELECT id FROM usuarios WHERE id = ?', [usuarioId]);
  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário da sessão não foi encontrado.' });
  }

  const favoritoExistente = await get(
    'SELECT id FROM favoritos WHERE usuarioId = ? AND composicao = ? LIMIT 1',
    [usuarioId, composicao]
  );
  if (favoritoExistente) {
    return res.json({ sucesso: true, mensagem: 'Favorito já existe', data: favoritoExistente });
  }

  const favorito = {
    id: createId('favorito'),
    usuarioId,
    composicao,
    nome,
    nota,
    nivel,
    materiais: JSON.stringify(materiais || []),
    dataAdicionado: toDatabaseDate(),
  };

  await run(
    'INSERT INTO favoritos (id, usuarioId, composicao, nome, nota, nivel, materiais, dataAdicionado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [favorito.id, favorito.usuarioId, favorito.composicao, favorito.nome, favorito.nota, favorito.nivel, favorito.materiais, favorito.dataAdicionado]
  );

  res.status(201).json({ sucesso: true, mensagem: 'Favorito salvo com sucesso', data: favorito });
});

app.get('/usuarios/:id/favoritos', async (req, res) => {
  const favoritos = await all('SELECT * FROM favoritos WHERE usuarioId = ? ORDER BY dataAdicionado DESC', [req.params.id]);
  res.json(favoritos.map((item) => ({
    ...item,
    materiais: parseJson(item.materiais),
  })));
});

app.put('/favoritos/:id', async (req, res) => {
  const { usuarioId, role, nome, composicao, nota, nivel, materiais } = req.body;
  const { id } = req.params;

  const favoritoExistente = await get('SELECT * FROM favoritos WHERE id = ?', [id]);
  if (!favoritoExistente) {
    return res.status(404).json({ mensagem: 'Favorito não encontrado.' });
  }

  if (usuarioId && favoritoExistente.usuarioId !== usuarioId && role !== 'admin') {
    return res.status(403).json({ mensagem: 'Não autorizado a editar este favorito.' });
  }

  const favoritoAtualizado = {
    ...favoritoExistente,
    nome: nome ?? favoritoExistente.nome,
    composicao: composicao ?? favoritoExistente.composicao,
    nota: nota ?? favoritoExistente.nota,
    nivel: nivel ?? favoritoExistente.nivel,
    materiais: materiais ? JSON.stringify(materiais) : favoritoExistente.materiais,
  };

  await run(
    'UPDATE favoritos SET nome = ?, composicao = ?, nota = ?, nivel = ?, materiais = ? WHERE id = ?',
    [
      favoritoAtualizado.nome,
      favoritoAtualizado.composicao,
      favoritoAtualizado.nota,
      favoritoAtualizado.nivel,
      favoritoAtualizado.materiais,
      id,
    ]
  );

  res.json({ sucesso: true, mensagem: 'Favorito atualizado com sucesso', data: favoritoAtualizado });
});

app.delete('/favoritos/:id', async (req, res) => {
  const { usuarioId, role } = req.body;
  const favorito = await get('SELECT * FROM favoritos WHERE id = ?', [req.params.id]);

  if (!favorito) {
    return res.status(404).json({ mensagem: 'Favorito não encontrado.' });
  }

  if (favorito.usuarioId !== usuarioId && role !== 'admin') {
    return res.status(403).json({ mensagem: 'Não autorizado a remover este favorito.' });
  }

  await run('DELETE FROM favoritos WHERE id = ?', [req.params.id]);

  res.json({ sucesso: true, mensagem: 'Favorito removido com sucesso' });
});

app.use((erro, req, res, next) => {
  console.error(`Erro em ${req.method} ${req.originalUrl}:`, erro);
  res.status(500).json({ mensagem: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await criarUsuarioAdmin();
    console.log('Admin criado ou já existente.');
  } catch (erro) {
    console.error('Erro ao criar usuário admin:', erro.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer();

module.exports = app;