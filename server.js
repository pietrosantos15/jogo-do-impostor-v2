const { ExpressPeerServer } = require('peer');
const express = require('express');

const app = express();

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

app.use((req, res, next) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('PeerJS Server - Jogo do Impostor esta online!');
});

function createFallbackHint(word, category) {
  const cleanWord = String(word).trim();
  const cleanCategory = String(category).trim();
  const lowerCategory = cleanCategory.toLowerCase();

  const categoryHints = {
    objetos: ['Usado no dia a dia', 'Fica dentro de casa', 'Voce pode tocar'],
    valorant: ['Aparece no jogo tatico', 'Tem habilidades especiais', 'Faz parte do Valorant'],
    profissoes: ['Alguem trabalha com isso', 'Exige uma habilidade especifica', 'Pode ser uma carreira'],
    animais: ['Ser vivo da natureza', 'Pode aparecer em zoologico', 'Tem instintos proprios'],
    'clash royale': ['Carta de batalha', 'Usado na arena', 'Tem custo de elixir']
  };

  const genericHints = [
    `Pertence a ${cleanCategory}`,
    'Pense na categoria escolhida',
    'Algo bem conhecido',
    'Tem caracteristicas marcantes'
  ];

  const options = categoryHints[lowerCategory] || genericHints;
  const index = cleanWord
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), cleanCategory.length) % options.length;

  return options[index];
}

function cleanHint(text) {
  return String(text)
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .replace(/[.!?]+$/g, '')
    .split(/\s+/)
    .slice(0, 6)
    .join(' ');
}

app.post('/hint', async (req, res) => {
  const { word, category } = req.body;

  if (!word || !category) {
    return res.status(400).json({ error: 'word e category sao obrigatorios' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY nao configurada; usando dica local');
    return res.json({ hint: createFallbackHint(word, category), source: 'fallback' });
  }

  try {
    const prompt = `Voce e um assistente para um jogo de deducao chamado Jogo do Impostor. Crie uma dica curta, com no maximo 6 palavras, sobre "${word}" da categoria "${category}" que de uma pista sem revelar a palavra. Responda APENAS com a dica, sem explicacoes, sem pontuacao no final e sem aspas.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro da API Gemini:', JSON.stringify(data, null, 2));
      return res.json({
        hint: createFallbackHint(word, category),
        source: 'fallback',
        warning: data.error?.message || 'Erro da API Gemini'
      });
    }

    const hint = cleanHint(data.candidates?.[0]?.content?.parts?.[0]?.text || '');

    if (!hint) {
      console.error('Gemini respondeu sem dica:', JSON.stringify(data, null, 2));
      return res.json({ hint: createFallbackHint(word, category), source: 'fallback' });
    }

    res.json({ hint, source: 'gemini' });
  } catch (e) {
    console.error('Erro Gemini:', e);
    res.json({ hint: createFallbackHint(word, category), source: 'fallback' });
  }
});

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  path: '/',
  allow_discovery: false,
  proxied: true
});

app.use('/peerjs', peerServer);

peerServer.on('connection', (client) => {
  console.log(`Cliente conectado: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`Cliente desconectado: ${client.getId()}`);
});
