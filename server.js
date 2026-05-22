const { ExpressPeerServer } = require('peer');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('PeerJS Server - Jogo do Impostor está online! 🎮');
});

app.post('/hint', async (req, res) => {
  const { word, category } = req.body;
  if (!word || !category) return res.status(400).json({ error: 'word e category são obrigatórios' });

  try {
    const prompt = `Você é um assistente para um jogo de dedução chamado Jogo do Impostor. Crie uma dica curta (máximo 6 palavras) sobre "${word}" da categoria "${category}" que dê uma pista sem revelar a palavra. Exemplos: para "Leão" → "rei das savanas com juba", para "Jett" → "agente ágil com facas e vento", para "Geladeira" → "guarda comida em baixa temperatura". Responda APENAS com a dica, sem explicações, sem pontuação no final, sem aspas.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 50, temperature: 0.7 }
        })
      }
    );
    const data = await response.json();
    const hint = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
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
  proxied: true,
});

app.use('/peerjs', peerServer);

peerServer.on('connection', (client) => {
  console.log(`Cliente conectado: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`Cliente desconectado: ${client.getId()}`);
});
