/**@type {Board} */
let board;
/**@type {BoardGUI} */
let gui;
/**@type {Search} */
let search;

let tileSize = 90;
let pieceSize = tileSize;

function setup() {

  if (displayWidth >= displayHeight) tileSize = (displayHeight * 0.6) / 8;
  else tileSize = (displayWidth * 0.6) / 8;

  const canvas = createCanvas(tileSize * 8, tileSize * 8);
  canvas.parent("#canvas");

  board = new Board();
  gui = new BoardGUI(board);
  board.init();

  search = new Search(board);

  const fenStartString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  board.fenToBoard(fenStartString);

  gui.init();
  PrecomputedData.Init();

  gui.show();
}

function draw() {
  if (gui.isDraggingPiece) {
    gui.showDraggingPiece();
  }
}

function mousePressed() {
  const squareIndex = getSquareUnderMouse();

  if (squareIndex !== -1 && board.squares[squareIndex] !== PIECE_NONE) {
    gui.dragPieceAtSquare(squareIndex);
  }

  console.log(squareIndex, Piece.PieceToString(board.squares[squareIndex]));
}

function mouseReleased() {
  if (gui.isDraggingPiece) {
    gui.stopDraggingPiece();
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
