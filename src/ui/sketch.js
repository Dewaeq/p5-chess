/**@type {GameManager} */
let gameManager;

let tileSize = 90;

function setup() {

  if (displayWidth >= displayHeight) tileSize = (displayHeight * 0.6) / 8;
  else tileSize = (displayWidth * 0.6) / 8;

  const canvas = createCanvas(tileSize * 8, tileSize * 8);
  canvas.parent("#canvas");

  gameManager = new GameManager();
  gameManager.init();
}

function draw() {
  if (gameManager.gui.isDraggingPiece) {
    gameManager.gui.showDraggingPiece();
  }
}

function mousePressed() {
  if (gameManager.humanPlaysWhite !== gameManager.whiteToMove) {
    // return;
  }

  const squareIndex = getSquareUnderMouse();
  if (squareIndex < 0) return;

  if (gameManager.board.squares[squareIndex] !== PIECE_NONE) {
    gameManager.gui.dragPieceAtSquare(squareIndex);
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
