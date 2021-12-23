const ANALYZING = true;

/**@type {GameManager} */
let gameManager;
/**@type {PGNAnalyzer} */
let pgnAnalyzer;
let canvas;

let tileSize = 90;

async function setup() {
  setTileSize();

  canvas = createCanvas(tileSize * 8, tileSize * 8);
  canvas.parent("#canvas");

  gameManager = new GameManager();
  await gameManager.init();

  pgnAnalyzer = new PGNAnalyzer();
  pgnAnalyzer.init();
}

function windowResized() {
  setTileSize();
  resizeCanvas(tileSize * 8, tileSize * 8);

  gameManager.gui.show();
}

function setTileSize() {
  if (windowWidth >= windowHeight) tileSize = (windowHeight * 0.8) / 8;
  else tileSize = (windowWidth * 0.85) / 8;
}

function startEvaluation() {
  gameManager.aiPlayer.search.resetWorkers();
  gameManager.aiPlayer.search.startMultiThreadedIterativeSearch(50000000);
}

function draw() {
  if (gameManager.gui.isDraggingPiece) {
    gameManager.gui.showDraggingPiece();
  }
}

function mousePressed() {
  gameManager.gui.show();

  const squareIndex = getSquareUnderMouse();
  if (squareIndex < 0) {
    gameManager.gui.draggingSquare = -1;
    return;
  }

  if (gameManager.gui.draggingSquare !== -1 && gameManager.gui.pieceMoves.filter(m => m.targetSquare === squareIndex).length > 0) {
    gameManager.gui.stopDraggingPiece();
  }

  else {
    gameManager.gui.draggingSquare = -1;
    if (gameManager.board.squares[squareIndex] !== PIECE_NONE) {
      gameManager.gui.dragPieceAtSquare(squareIndex);
    }
  }

  console.log(squareIndex, Piece.PieceToString(gameManager.board.squares[squareIndex]));
}

function mouseReleased() {
  if (gameManager.gui.isDraggingPiece) {
    gameManager.gui.stopDraggingPiece();
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    if (gameManager.moveHistory.length > 0) {
      $("#undo-move").click();
    } else if (pgnAnalyzer.pgnString) {
      pgnAnalyzer.goToPreviousMove();
    }
  }
  if (!pgnAnalyzer.pgnString) return;

  if (keyCode === RIGHT_ARROW) {
    pgnAnalyzer.goToNextMove();
  } else if (keyCode === UP_ARROW) {
    pgnAnalyzer.goToPgnMove(0);
  } else if (keyCode === DOWN_ARROW) {
    pgnAnalyzer.goToPgnMove(pgnAnalyzer.pgnMoves.length - 1);
  }
}

function getSquareUnderMouse() {
  const file = floor(mouseX / tileSize);
  const rank = 7 - floor(mouseY / tileSize);

  if (rank > 7 || rank < 0) return -1;
  if (file > 7 || file < 0) return -1;

  const squareIndex = BoardRepresentation.CoordToIndex(rank, file);
  return squareIndex;
}
