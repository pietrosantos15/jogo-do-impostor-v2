# Servidor PeerJS — Jogo do Impostor

## Deploy no Render (grátis)

### Passo a passo:

1. **Crie uma conta** em https://render.com (grátis, pode usar login do GitHub/Google)

2. **Suba este código para o GitHub:**
   - Crie um repositório novo no GitHub (pode ser privado)
   - Faça upload de `server.js`, `package.json` e `render.yaml`

3. **No Render, crie um novo serviço:**
   - Clique em **"New +"** → **"Web Service"**
   - Conecte seu repositório do GitHub
   - O Render vai detectar o `render.yaml` automaticamente
   - Clique em **"Create Web Service"**

4. **Aguarde o deploy** (leva ~2 minutos)

5. **Copie a URL** do seu serviço (ex: `https://impostor-peer-server.onrender.com`)

6. **Atualize o `script.js` do jogo:**
   - Encontre a variável `PEER_SERVER_URL` no topo do arquivo
   - Substitua pela sua URL do Render

### ⚠️ Observação sobre o plano gratuito do Render:
O servidor "dorme" após 15 minutos sem uso. A primeira conexão pode demorar ~30 segundos para acordar.
Para evitar isso, o jogo já inclui lógica de reconexão automática.
