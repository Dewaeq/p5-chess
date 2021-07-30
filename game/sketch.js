/**@type {Board} */
let board;
/**@type {BoardGUI} */
let gui;

function setup() {
  const canvas = createCanvas(60 * 8, 60 * 8);
  canvas.parent("#canvas");

  board = new Board();
  board.init();
  gui = new BoardGUI(board);

  const fenStartString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  board.fenToBoard(fenStartString);

  gui.init();

  setTimeout(() => {
    gui.show();
  }, 1000);
}

function draw() {
  if (gui.isDraggingPiece) {
    gui.show();
    gui.showDraggingPiece();
  }
}

function mousePressed() {
  const squareIndex = getSquareUnderMouse();

  if (squareIndex !== -1) {
    gui.dragPieceAtSquare(squareIndex);
  }

  console.log(Piece.PieceToString(board.squares[squareIndex]));
}

function mouseReleased() {
  if (gui.isDraggingPiece) gui.stopDraggingPiece();
}

function getSquareUnderMouse() {
  const rank = floor(mouseX / BoardGUI.TileSize);
  const file = 7 - floor(mouseY / BoardGUI.TileSize);

  if (rank > 7 || rank < 0) return -1;
  if (file > 7 || file < 0) return -1;

  const squareIndex = BoardRepresentation.CoordToIndex(rank, file);
  return squareIndex;
}
