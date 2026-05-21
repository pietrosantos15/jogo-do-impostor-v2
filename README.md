# 🎮 Jogo do Impostor Online

Este é um jogo multiplayer em tempo real, inspirado na dinâmica de "Spyfall" e "Quem Sou Eu?". O projeto permite que amigos joguem juntos remotamente, onde um ou mais jogadores são sorteados como **impostores**. Enquanto os inocentes sabem a palavra secreta, o impostor deve usar a dedução e o blefe para não ser descoberto e tentar adivinhar o tema da rodada.

O diferencial deste projeto é a utilização de tecnologia **P2P (Peer-to-Peer)**, o que significa que a conexão é feita diretamente entre os jogadores, sem necessidade de um servidor de base de dados centralizado para as partidas.

---

## 🚀 Tecnologias Utilizadas

### Frontend (Cliente)
* **HTML5 & CSS3**: Estrutura e estilização moderna com sistema de variáveis  para gestão de cores 
* **JavaScript (Vanilla)**: Lógica principal do jogo, manipulação do DOM e gestão de estados.
* **PeerJS**: Biblioteca utilizada para facilitar a comunicação WebRTC, permitindo que o navegador de um jogador (Host) comunique diretamente com os outros (Clients).

---

## 📜 Funcionalidades

* **Multiplayer P2P em Tempo Real**: Conexão instantânea via IDs de sala gerados pelo PeerJS.
* **Sistema de Sorteio Semeado (Seeded Random)**: Garante que, mesmo numa rede descentralizada, todos os jogadores recebam a mesma categoria e a palavra correta (ou a função de impostor) de forma sincronizada através de uma *seed* matemática.
* **Categorias Diversificadas**

* **Configuração de Partida**: O líder pode definir livremente o número de jogadores e a quantidade de impostores.
* **Interface Responsiva**: Design adaptável para dispositivos móveis e desktop.

---

## 🛠️ Como Rodar o Projeto Localmente


1.  **Clonar o Repositório**:
    ```bash
    git clone [https://github.com/teu-utilizador/jogo-do-impostor.git](https://github.com/teu-utilizador/jogo-do-impostor-v2.git)
    cd jogo-do-impostor
    ```

2.  **Executar**:
    * Basta abrir o ficheiro `index.html` em qualquer navegador moderno.
    * Para uma experiência completa em rede, recomenda-se usar um servidor local simples (como a extensão "Live Server" do VS Code).

---

## 🕹️ Como Jogar

1.  **Criar Sala**: O Host escolhe as definições e clica em "Gerar Sala Online". Um link exclusivo será gerado.
2.  **Entrar**: Os amigos acedem ao link e aguardam a ligação ao líder.
3.  **Revelação**: Quando o jogo começa, cada um clica no seu número de jogador para revelar a sua função secretamente.
4.  **O Jogo**: Os jogadores fazem perguntas entre si. O objetivo dos inocentes é encontrar o impostor; o objetivo do impostor é sobreviver ou adivinhar a palavra.

---



**👨‍💻 Autor:** Pietro Santos
