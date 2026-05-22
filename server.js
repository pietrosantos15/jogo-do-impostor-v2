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
    objetos: ['Aparelho parecido', 'Utensilio proximo', 'Item domestico'],
    valorant: ['Agente parecido', 'Mesma funcao', 'Habilidade parecida'],
    profissoes: ['Trabalho parecido', 'Mesmo ambiente', 'Ferramenta comum'],
    animais: ['Bicho parecido', 'Mesmo habitat', 'Comportamento parecido'],
    'clash royale': ['Carta parecida', 'Mesma funcao', 'Mesmo elixir']
  };

  const genericHints = [
    `Parecido com ${cleanCategory}`,
    'Mesmo contexto',
    'Ideia parecida',
    'Algo relacionado'
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
    .slice(0, 3)
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
    const prompt = `Voce e o gerador de pistas do Jogo do Impostor.

Palavra secreta: "${word}"
Categoria/tema: "${category}"

Responda com UMA palavra ou expressao curta que lembre a palavra secreta, seja parecida, relacionada ou do mesmo contexto, mas sem revelar a palavra secreta.

`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 30,
            temperature: 0.8
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
