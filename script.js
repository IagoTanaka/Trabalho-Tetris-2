const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

// Configurações do Jogo
const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;
const COLORS = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'];

let board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

const TETROMINOS = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
];

const tetrominoColors = [
  'cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'
];

let currentTetromino = randomTetromino();
let currentPos = { x: 3, y: 0 }; // Posição inicial do tetromino
let score = 0;
let gameOver = false;
let dropSpeed = 10000; // Velocidade inicial de queda das peças
let lastDropTime = 0;

// Tela de Game Over
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElem = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

document.addEventListener('keydown', (event) => {
  if (gameOver) return; // Ignora entradas quando o jogo terminar

  if (event.key === 'ArrowLeft') moveTetromino(-1, 0);
  if (event.key === 'ArrowRight') moveTetromino(1, 0);
  if (event.key === 'ArrowDown') moveTetromino(0, 1);
  if (event.key === 'ArrowUp') rotateTetromino();
});

// Reiniciar o jogo ao clicar no botão
restartButton.addEventListener('click', restartGame);

function randomTetromino() {
  const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
  return { shape: TETROMINOS[randomIndex], color: tetrominoColors[randomIndex] };
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Desenhando o tabuleiro
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      if (board[row][col]) {
        ctx.fillStyle = board[row][col];
        ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function drawTetromino() {
  const shape = currentTetromino.shape;
  const color = currentTetromino.color;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        ctx.fillStyle = color;
        ctx.fillRect((currentPos.x + col) * BLOCK_SIZE, (currentPos.y + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function moveTetromino(dx, dy) {
  if (canMove(currentTetromino.shape, currentPos.x + dx, currentPos.y + dy)) {
    currentPos.x += dx;
    currentPos.y += dy;
  } else if (dy === 1) {
    placeTetromino();
    clearFullLines();
    if (gameOverCheck()) {
      gameOver = true;
      finalScoreElem.innerText = score;
      gameOverScreen.style.display = 'flex'; // Mostra a tela de game over
    } else {
      currentTetromino = randomTetromino();
      currentPos = { x: 3, y: 0 };
    }
  }
  draw();
}

function rotateTetromino() {
  const rotatedShape = rotate(currentTetromino.shape);
  if (canMove(rotatedShape, currentPos.x, currentPos.y)) {
    currentTetromino.shape = rotatedShape;
  }
  draw();
}

function rotate(shape) {
  return shape[0].map((_, index) => shape.map(row => row[index])).reverse();
}

function canMove(shape, x, y) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        if (newX < 0 || newX >= COLUMNS || newY >= ROWS || board[newY] && board[newY][newX]) {
          return false;
        }
      }
    }
  }
  return true;
}

function placeTetromino() {
  const shape = currentTetromino.shape;
  const color = currentTetromino.color;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        board[currentPos.y + row][currentPos.x + col] = color;
      }
    }
  }
}

function clearFullLines() {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell !== 0)) {
      score += 10;
      document.getElementById('score').innerText = score;
      board.splice(row, 1); // Remove a linha
      board.unshift(Array(COLUMNS).fill(0)); // Adiciona uma linha vazia no topo
    }
  }
}

function gameOverCheck() {
  return board[0].some(cell => cell !== 0); // Verifica se a linha superior está cheia
}

function draw() {
  drawBoard();
  drawTetromino();
}

function gameLoop(timestamp) {
  if (!gameOver) {
    if (timestamp - lastDropTime > dropSpeed) {
      moveTetromino(0, 1); // Move a peça para baixo
      lastDropTime = timestamp;
    }
    requestAnimationFrame(gameLoop);
  }
}

// Inicializa o jogo
requestAnimationFrame(gameLoop);

function restartGame() {
  // Reseta o estado do jogo
  board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
  score = 0;
  document.getElementById('score').innerText = score;
  gameOver = false;
  gameOverScreen.style.display = 'none'; // Oculta a tela de Game Over
  currentTetromino = randomTetromino();
  currentPos = { x: 3, y: 0 };
  requestAnimationFrame(gameLoop); // Reinicia o loop do jogo
}

