const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const modeSelect = document.getElementById("mode");
const difficultySelect = document.getElementById("difficulty");
const gameDiv = document.getElementById("game");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let playMode = "bot";
let difficulty = "medium";

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

startBtn.onclick = () => {
  playMode = modeSelect.value;
  difficulty = difficultySelect.value;
  document.querySelector(".mode-select").classList.add("hidden");
  gameDiv.classList.remove("hidden");
  resetBoard();
};

restartBtn.onclick = () => resetBoard();

function resetBoard() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  statusEl.textContent = "X ถึงตาเล่น";
  renderBoard();
}

function renderBoard() {
  boardEl.innerHTML = "";
  board.forEach((cell, i) => {
    const div = document.createElement("div");
    div.className = "cell" + (cell ? " taken" : "");
    div.textContent = cell;
    div.onclick = () => handleClick(i);
    boardEl.appendChild(div);
  });
}

function handleClick(index) {
  if (gameOver || board[index]) return;
  // ถ้าโหมด bot ให้ผู้เล่น X เท่านั้นที่คลิกได้
  if (playMode === "bot" && currentPlayer !== "X") return;

  board[index] = currentPlayer;
  playClick();
  renderBoard();

  if (checkWin(currentPlayer)) {
    playWin();
    statusEl.textContent = `🎉 ผู้เล่น ${currentPlayer} ชนะ!`;
    gameOver = true;
    return;
  }

  if (board.every(c => c !== "")) {
    statusEl.textContent = "😺 เสมอกัน!";
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `${currentPlayer} ถึงตาเล่น`;

  if (playMode === "bot" && currentPlayer === "O" && !gameOver) {
    setTimeout(botMove, 420);
  }
}

function checkWin(player) {
  return winPatterns.some(p => p.every(i => board[i] === player));
}

function botMove() {
  if (gameOver) return;
  let move;
  if (difficulty === "easy") move = randomMove();
  else if (difficulty === "medium") move = findWinningMove("O") ?? findWinningMove("X") ?? randomMove();
  else move = bestMove();

  if (move !== undefined && move !== null) {
    board[move] = "O";
    playClick();
    renderBoard();

    if (checkWin("O")) {
      playWin();
      statusEl.textContent = "🤖 บอทชนะ!";
      gameOver = true;
      return;
    }
    if (board.every(c => c !== "")) {
      statusEl.textContent = "😺 เสมอกัน!";
      gameOver = true;
      return;
    }
    currentPlayer = "X";
    statusEl.textContent = `${currentPlayer} ถึงตาเล่น`;
  }
}

function randomMove() {
  const empties = board.map((v,i) => v === "" ? i : null).filter(v => v !== null);
  return empties[Math.floor(Math.random() * empties.length)];
}

function findWinningMove(player) {
  for (const [a,b,c] of winPatterns) {
    const line = [board[a], board[b], board[c]];
    if (line.filter(v => v === player).length === 2 && line.includes("")) {
      return [a,b,c][line.indexOf("")];
    }
  }
  return null;
}

function bestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(testBoard, isMaximizing) {
  if (checkStaticWin(testBoard, "O")) return 1;
  if (checkStaticWin(testBoard, "X")) return -1;
  if (testBoard.every(c => c !== "")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (testBoard[i] === "") {
        testBoard[i] = "O";
        let val = minimax(testBoard, false);
        testBoard[i] = "";
        best = Math.max(best, val);
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (testBoard[i] === "") {
        testBoard[i] = "X";
        let val = minimax(testBoard, true);
        testBoard[i] = "";
        best = Math.min(best, val);
      }
    }
    return best;
  }
}

function checkStaticWin(bd, player) {
  return winPatterns.some(p => p.every(i => bd[i] === player));
}

// sounds
function playClick() {
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play().catch(()=>{});
  }
}
function playWin() {
  if (winSound) {
    winSound.currentTime = 0;
    winSound.play().catch(()=>{});
  }
}

// initial
renderBoard();
statusEl.textContent = "กด เริ่มเกม เพื่อเล่น";
