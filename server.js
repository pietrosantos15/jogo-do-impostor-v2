const { PeerServer } = require('peer');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('PeerJS Server - Jogo do Impostor está online! 🎮');
});

const PORT = process.env.PORT || 9000;

// Start HTTP server first
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Mount PeerJS on the same HTTP server
const peerServer = PeerServer({
  server,
  path: '/peerjs',
  allow_discovery: false,
  proxied: true,
  alive_timeout: 60000,
  key: 'peerjs',
  concurrent_limit: 5000,
});

peerServer.on('connection', (client) => {
  console.log(`Cliente conectado: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`Cliente desconectado: ${client.getId()}`);
});
