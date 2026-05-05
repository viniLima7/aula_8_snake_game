//CONFIGURAÇÃO

const COLUNAS = 20;
const LINHAS = 20;
const PONTOS_POR_COMIDA = 10;

const VELOCIDADE = parseInt(localStorage.getItem("velocidade_cobra")) || 130;

//VARIÁVEIS DE ESTADO DO JOGO
let cobra = []; //Armazena as posições da cobra
let direcao = { x: 1, y: 0 }; //Direção atual do movimento
let proximaDirecao = { x: 1, y: 0 }; //Direção da próxima tickada
let comida = { x: 0, y: 0 }; //Armazena a posição da comida
let pontuacao = 0;
let recorde = parseInt(localStorage.getItem("recorde_cobra")) || 0;
let intervalo = null; //Referência do setIntervalo do loop infinito do jogo
let emJogo = false;

//GRADE
const grade = document.getElementById("grade");
let celulas = []; //Referência às células da grade

function criarGrade() {
  grade.innerHTML = "";
  celulas = [];

  for (let y = 0; y < LINHAS; y++) {
    const linha = [];

    for (let x = 0; x < COLUNAS; x++) {
      const celula = document.createElement("div");
      celula.className = "celula";
      grade.appendChild(celula);
      linha.push(celula);
    }

    celulas.push(linha);
  }
}

function limparGrade() {
  for (let y = 0; y < LINHAS; y++) {
    for (let x = 0; x < COLUNAS; x++) {
      celulas[y][x].className = "celula";
    }
  }
}

// Desenhar a cobra e a comida na grade
function renderizar() {
  limparGrade();

  // Desenha a comida
  celulas[comida.y][comida.x].classList.add("comida");

  // Desenha o corpo da cobra
  for (let i = 1; i < cobra.length; i++) {
    celulas[cobra[i].y][cobra[i].x].classList.add("cobra");
  }

  // Desenha a cabeça da cobra
  celulas[cobra[0].y][cobra[0].x].classList.add("cabeca");
}

// INICIALIZAÇÃO

function iniciar() {
  cobra = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  direcao = { x: 1, y: 0 };
  proximaDirecao = { x: 1, y: 0 };
  pontuacao = 0;
  emJogo = true;

  atualizarHUD();
  gerarComida();
  renderizar();
  esconderOverlay();

  // Loop
  if (intervalo) clearInterval(intervalo);

  intervalo = setInterval(tick, VELOCIDADE);
}

function reiniciar() {
  iniciar();
}

function tick() {
  direcao = { ...proximaDirecao };

  const novaX = cobra[0].x + direcao.x;
  const novaY = cobra[0].y + direcao.y;

  if (novaX < 0 || novaX >= COLUNAS || novaY < 0 || novaY >= LINHAS) {
    encerrarJogo();
    return;
  }

  for (let i = 0; i < cobra.length; i++) {
    if (cobra[i].x === novaX && cobra[i].y === novaY) {
      encerrarJogo();
      return;
    }
  }

  cobra.unshift({ x: novaX, y: novaY });

  if (novaX === comida.x && novaY === comida.y) {
    pontuacao += PONTOS_POR_COMIDA;
    atualizarHUD();
    gerarComida();
  } else {
    cobra.pop();
  }

  renderizar();
}

function gerarComida() {
  let posicaoLivre = false;
  let novaComida;

  while (!posicaoLivre) {
    novaComida = {
      x: Math.floor(Math.random() * COLUNAS),
      y: Math.floor(Math.random() * LINHAS),
    };

    posicaoLivre = true;

    for (let i = 0; i < cobra.length; i++) {
      if (cobra[i].x === novaComida.x && cobra[i].y === novaComida.y) {
        posicaoLivre = false;
        break;
      }
    }
  }

  comida = novaComida;
}

function mudarDirecao(tecla) {
  if (tecla === "ArrowUp" && direcao.y !== 1) proximaDirecao = { x: 0, y: -1 };
  if (tecla === "ArrowDown" && direcao.y !== -1)
    proximaDirecao = { x: 0, y: 1 };
  if (tecla === "ArrowLeft" && direcao.x !== 1)
    proximaDirecao = { x: -1, y: 0 };
  if (tecla === "ArrowRight" && direcao.x !== -1)
    proximaDirecao = { x: 1, y: 0 };
}

document.addEventListener("keydown", (evento) => {
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(evento.key)
  ) {
    evento.preventDefault();
  }

  mudarDirecao(evento.key);
});

function atualizarHUD() {
  document.getElementById("pontuacao").textContent = pontuacao;
  document.getElementById("recorde").textContent = recorde;
}

function encerrarJogo() {
  emJogo = false;
  clearInterval(intervalo);

  let novoRecorde = false;

  if (pontuacao > recorde) {
    recorde = pontuacao;
    localStorage.setItem("cobra_recorde", recorde);
    novoRecorde = true;
  }

  document.getElementById("overlay-pontos").textContent = pontuacao + " pontos";
  document.getElementById("overlay-recorde").textContent = novoRecorde
    ? "🏆 Novo recorde!"
    : "Recorde: " + recorde;

  document.getElementById("overlay").classList.add("visivel");
}

function esconderOverlay() {
  document.getElementById("overlay").classList.remove("visivel");
}

criarGrade();
iniciar();
