const { ExpressPeerServer } = require('peer');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('PeerJS Server - Jogo do Impostor está online! 🎮');
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
