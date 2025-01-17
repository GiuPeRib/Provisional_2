const imageUrl = 'https://github.com/GiuPeRib/Provisional_2/blob/main/Apparato%20di%20distillazione%20semplice%20-%20Copia.jpg?raw=true';
let draggedElement = null;
let touchStartX = 0;
let touchStartY = 0;

function createPuzzle(imageUrl) {
  const puzzleContainer = document.getElementById('puzzleContainer');
  puzzleContainer.innerHTML = '';
  const pieceSize = 100; // Dimensione del pezzo del puzzle
  const img = new Image();
  img.src = imageUrl;
  img.onload = function() {
    const cols = Math.ceil(img.width / pieceSize);
    const rows = Math.ceil(img.height / pieceSize);

    puzzleContainer.style.gridTemplateColumns = `repeat(${cols}, ${pieceSize}px)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${rows}, ${pieceSize}px)`;

    const pieces = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const piece = document.createElement('canvas');
        piece.classList.add('puzzlePiece');
        piece.width = pieceSize;
        piece.height = pieceSize;
        piece.draggable = false;
        const context = piece.getContext('2d');
        context.drawImage(img, col * pieceSize, row * pieceSize, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);
        piece.dataset.position = `${row}-${col}`;
        pieces.push(piece);
      }
    }

    pieces.sort(() => Math.random() - 0.5);

    pieces.forEach((piece, index) => {
      piece.dataset.index = index;

      piece.addEventListener('touchstart', (event) => {
        if (!puzzleCompleted) {
          const touch = event.touches[0];
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
          draggedElement = event.target;
        }
      });

      piece.addEventListener('touchmove', (event) => {
        event.preventDefault();
        if (draggedElement) {
          const touch = event.touches[0];
          const deltaX = touch.clientX - touchStartX;
          const deltaY = touch.clientY - touchStartY;
          draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }
      });

      piece.addEventListener('touchend', (event) => {
        event.preventDefault();
        const touch = event.changedTouches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY).closest('.puzzlePiece');
        const sourceIndex = draggedElement.dataset.index;
        const targetIndex = targetElement ? targetElement.dataset.index : null;

        if (draggedElement && targetElement && draggedElement !== targetElement && !puzzleCompleted) {
          swapPieces(sourceIndex, targetIndex);
          checkPuzzle(); // Verifica automatica dopo lo scambio
        }
        draggedElement.style.transform = ''; // Resetta la trasformazione
        draggedElement = null;
      });

      puzzleContainer.appendChild(piece);
    });
  };
}

function swapPieces(sourceIndex, targetIndex) {
  const puzzleContainer = document.getElementById('puzzleContainer');
  const sourcePiece = puzzleContainer.querySelector(`[data-index='${sourceIndex}']`);
  const targetPiece = puzzleContainer.querySelector(`[data-index='${targetIndex}']`);

  if (sourcePiece && targetPiece) {
    // Scambia gli indici
    [sourcePiece.dataset.index, targetPiece.dataset.index] = [targetIndex, sourceIndex];

    // Scambia le posizioni nel DOM
    const sourceLeft = sourcePiece.style.left;
    const sourceTop = sourcePiece.style.top;
    sourcePiece.style.left = targetPiece.style.left;
    sourcePiece.style.top = targetPiece.style.top;
    targetPiece.style.left = sourceLeft;
    targetPiece.style.top = sourceTop;
  }
}

let puzzleCompleted = false;

function checkPuzzle() {
  const pieces = document.querySelectorAll('.puzzlePiece');
  let isCorrect = true;

  pieces.forEach((piece, index) => {
    const [originalRow, originalCol] = piece.dataset.position.split('-').map(Number);
    const currentRow = Math.floor(index / Math.sqrt(pieces.length));
    const currentCol = index % Math.sqrt(pieces.length);

    if (originalRow !== currentRow || originalCol !== currentCol) {
      isCorrect = false;
    }
  });

  const message = document.getElementById('message');
  if (isCorrect) {
    message.textContent = 'Congratulazioni! Hai ricomposto correttamente il puzzle!';
    puzzleCompleted = true;
    document.getElementById('restartButton').style.display = 'block';
    // Disabilita il drag sui pezzi
    document.querySelectorAll('.puzzlePiece').forEach(piece => {
      piece.draggable = false;
    });
  } else {
    message.textContent = 'Il puzzle non è ancora corretto. Continua a provare!';
  }
}

document.getElementById('restartButton').addEventListener('click', () => {
  puzzleCompleted = false;
  createPuzzle(imageUrl);
  document.getElementById('restartButton').style.display = 'none';
  document.getElementById('message').textContent = '';
});

createPuzzle(imageUrl);
