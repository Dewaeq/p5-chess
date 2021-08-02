class BoardGUI {
  static TileSize = 60;

  /**
   * @param {Board} board
   */
  constructor(board) {
    this.board = board;
    this.images = {};
    this.isDraggingPiece = false;
    this.draggingSquare = -1;
  }

  static SquareToGuiCoord = (square) => {
    let [rank, file] = BoardRepresentation.IndexToCoord(square);
    let x = rank;
    let y = 7 - file;
    return [x, y];
  };

  init() {
    const fileExt = ".png";

    for (let i = 0; i < 2; i++) {
      const pieceColor = i === 0 ? "white" : "black";
      this.images[`${pieceColor}-king`] = loadImage(
        `../assets/images/${pieceColor}/${pieceColor}-king${fileExt}`
      );
      this.images[`${pieceColor}-queen`] = loadImage(
        `../assets/images/${pieceColor}/${pieceColor}-queen${fileExt}`
      );
      this.images[`${pieceColor}-rook`] = loadImage(
        `../assets/images/${pieceColor}/${pieceColor}-rook${fileExt}`
      );
      this.images[`${pieceColor}-bishop`] = loadImage(
        `../assets/images/${pieceColor}/${pieceColor}-bishop${fileExt}`
      );
      this.images[`${pieceColor}-knight`] = loadImage(
        `../assets/images/${pieceColor}/${pieceColor}-knight${fileExt}`
      );
      this.images[`${pieceColor}-pawn`] = loadImage(
        `../assets/images/${pieceColor}/${pieceColor}-pawn${fileExt}`
      );
    }
  }

  show() {
    background(0);
    noStroke();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const isWhite = (i + j) % 2 === 0;

        fill(isWhite ? "#F1D7C1" : "#BC5448");
        rect(
          i * BoardGUI.TileSize,
          j * BoardGUI.TileSize,
          BoardGUI.TileSize,
          BoardGUI.TileSize
        );
      }
    }

    for (let i = 0; i < 64; i++) {
      const piece = this.board.squares[i];
      if (piece === PIECE_NONE) continue;
      if (this.isDraggingPiece && i === this.draggingSquare) continue;

      const pieceStr = Piece.PieceToString(piece);
      const [x, y] = BoardGUI.SquareToGuiCoord(i);

      image(
        this.images[pieceStr],
        x * BoardGUI.TileSize,
        y * BoardGUI.TileSize,
        BoardGUI.TileSize,
        BoardGUI.TileSize
      );
    }
  }

  showDraggingPiece() {
    const piece = this.board.squares[this.draggingSquare];
    if (piece === PIECE_NONE) return;

    this.show();

    const pieceStr = Piece.PieceToString(piece);

    image(
      this.images[pieceStr],
      mouseX - BoardGUI.TileSize / 2,
      mouseY - BoardGUI.TileSize / 2,
      BoardGUI.TileSize * 1.15,
      BoardGUI.TileSize * 1.15
    );
  }

  dragPieceAtSquare(square) {
    this.isDraggingPiece = true;
    this.draggingSquare = square;

    const piece = this.board.squares[square];
    if (piece === PIECE_NONE) return;
  }

  stopDraggingPiece() {
    this.draggingSquare = -1;
    this.isDraggingPiece = false;
    this.show();
  }
}
