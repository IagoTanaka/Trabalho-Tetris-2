const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;
const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFFC33', '#33FFF5', '#A133FF'];

const tetrominos = [
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 1], [1, 1]],       // O
  [[1, 1, 1, 1]],         // I
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]]  // J
];

let board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

let currentTetromino = getRandomTetromino();
let position = { x: 4, y: 0 };
let gameInterval;

function getRandomTetromino() {
  const index = Math.floor(Math.random() * tetrominos.length);
  return tetrominos[index];
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      if (board[row][col] !== 0) {
        ctx.fillStyle = COLORS[board[row][col] - 1];
        ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function drawTetromino() {
  const shape = currentTetromino;
  const color = COLORS[tetrominos.indexOf(shape)];
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        ctx.fillStyle = color;
        ctx.fillRect((position.x + col) * BLOCK_SIZE, (position.y + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function moveTetrominoDown() {
  position.y++;
  if (collision()) {
    position.y--;
    placeTetromino();
    clearLines();
    currentTetromino = getRandomTetromino();
    position = { x: 4, y: 0 };
    if (collision()) {
      gameOver();
    }
  }
}

function collision() {
  const shape = currentTetromino;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] && (board[row + position.y] && board[row + position.y][col + position.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function placeTetromino() {
  const shape = currentTetromino;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        board[row + position.y][col + position.x] = tetrominos.indexOf(currentTetromino) + 1;
      }
    }
  }
}

function clearLines() {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell !== 0)) {
      board.splice(row, 1);
      board.unshift(Array(COLUMNS).fill(0));
    }
  }
}

function rotateTetromino() {
  const rotated = currentTetromino[0].map((_, index) =>
    currentTetromino.map(row => row[index])
  );
  const tempTetromino = currentTetromino;
  currentTetromino = rotated;
  if (collision()) {
    currentTetromino = tempTetromino;
  }
}

function moveTetrominoLeft() {
  position.x--;
  if (collision()) position.x++;
}

function moveTetrominoRight() {
  position.x++;
  if (collision()) position.x--;
}

function gameOver() {
  clearInterval(gameInterval);
  alert('Game Over');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    moveTetrominoDown();
  } else if (e.key === 'ArrowLeft') {
    moveTetrominoLeft();
  } else if (e.key === 'ArrowRight') {
    moveTetrominoRight();
  } else if (e.key === 'ArrowUp') {
    rotateTetromino();
  }
});

function gameLoop() {
  drawBoard();
  drawTetromino();
  moveTetrominoDown();
}

gameInterval = setInterval(gameLoop, 500);
