const { ExpressPeerServer } = require('peer');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('PeerJS Server - Jogo do Impostor está online! 🎮');
});

app.post('/hint', async (req, res) => {
  const { word, category } = req.body;

  if (!word || !category) {
    return res.status(400).json({ error: 'word e category são obrigatórios' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY não configurada no Render');
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });
  }

  try {
    const prompt = `Você é um assistente para um jogo de dedução chamado Jogo do Impostor. Crie uma dica curta, com no máximo 6 palavras, sobre "${word}" da categoria "${category}" que dê uma pista sem revelar a palavra. Responda APENAS com a dica, sem explicações, sem pontuação no final e sem aspas.`;

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
      return res.status(500).json({
        error: 'Erro da API Gemini',
        details: data.error?.message || data
      });
    }

    const hint = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!hint) {
      console.error('Gemini respondeu sem dica:', JSON.stringify(data, null, 2));
      return res.status(500).json({ error: 'Gemini não retornou dica' });
    }

    res.json({ hint });
  } catch (e) {
    console.error('Erro Gemini:', e);
    res.status(500).json({ error: 'Erro ao gerar dica' });
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
