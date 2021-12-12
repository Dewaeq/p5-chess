/**@type {GameManager} */
let gameManager;
let canvas;

let tileSize = 90;

function setup() {
  setTileSize();

  canvas = createCanvas(tileSize * 8, tileSize * 8);
  canvas.parent("#canvas");

  gameManager = new GameManager();
  gameManager.init();
}

function windowResized() {
  setTileSize();
  resizeCanvas(tileSize * 8, tileSize * 8);
}

function setTileSize() {
  if (windowWidth >= windowHeight) tileSize = (windowHeight * 0.8) / 8;
  else tileSize = (windowWidth * 0.85) / 8;
}

function draw() {
  if (gameManager.gui.isDraggingPiece) {
    gameManager.gui.showDraggingPiece();
  }
}

function mousePressed() {
  if (!gameManager.humansTurn) {
    return;
  }

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

function getSquareUnderMouse() {
  const file = floor(mouseX / tileSize);
  const rank = 7 - floor(mouseY / tileSize);

  if (rank > 7 || rank < 0) return -1;
  if (file > 7 || file < 0) return -1;

  const squareIndex = BoardRepresentation.CoordToIndex(rank, file);
  return squareIndex;
}
