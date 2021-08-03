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
  search = new Search();
  board.init();
  search.init(board);

  const fenStartString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  board.fenToBoard(fenStartString);

  gui.init();
  PrecomputedData.Init();

  setTimeout(() => {
    gui.show();
  }, 1000);
}

function draw() {
  if (gui.isDraggingPiece) {
    gui.showDraggingPiece();
  }
}

function mousePressed() {
  const squareIndex = getSquareUnderMouse();

  if (squareIndex !== -1) {
    gui.dragPieceAtSquare(squareIndex);
  }

  console.log(squareIndex, Piece.PieceToString(board.squares[squareIndex]));
}

function mouseReleased() {
  if (gui.isDraggingPiece) gui.stopDraggingPiece();
}

function getSquareUnderMouse() {
  const rank = floor(mouseX / tileSize);
  const file = 7 - floor(mouseY / tileSize);

  if (rank > 7 || rank < 0) return -1;
  if (file > 7 || file < 0) return -1;

  const squareIndex = BoardRepresentation.CoordToIndex(rank, file);
  return squareIndex;
}
