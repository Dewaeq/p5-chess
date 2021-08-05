class BoardGUI {
  /**
   * @param {Board} board
   */
  constructor(board) {
    this.board = board;
    this.guiSearch = new Search();
    this.images = {};
    /**@type {Move[]} */
    this.pieceMoves = [];
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
    this.guiSearch.init(this.board);

    const fileExt = ".png";

    for (let i = 0; i < 2; i++) {
      const pieceColor = (i === 0) ? "white" : "black";
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
          i * tileSize,
          j * tileSize,
          tileSize,
          tileSize
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
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize
      );
    }
  }

  showPieceMoves(startSquare) {
    const moves = this.guiSearch.generateMoves(this.board);

    if (moves.length === 0) {
      if (search.inCheck) {
        alert('Checkmate');
      } else {
        alert('Stalemate');
      }
    }

    this.pieceMoves = moves.filter(move => move.startSquare === startSquare);

    moves.forEach(move => {
      const targetSquare = move.targetSquare;
      const [x, y] = BoardGUI.SquareToGuiCoord(targetSquare);

      fill(162, 156, 154, 110);
      ellipse(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, tileSize / 2.5);
    });
  }

  showDraggingPiece() {
    const piece = this.board.squares[this.draggingSquare];
    if (piece === PIECE_NONE) return;

    this.show();

    const pieceStr = Piece.PieceToString(piece);
    const [x, y] = BoardGUI.SquareToGuiCoord(this.draggingSquare);

    fill(221, 165, 118);

    rect(
      x * tileSize,
      y * tileSize,
      tileSize,
      tileSize,
    );

    image(
      this.images[pieceStr],
      mouseX - tileSize / 2,
      mouseY - tileSize / 2,
      tileSize * 1.1,
      tileSize * 1.1
    );
    this.showPieceMoves(this.draggingSquare);
  }

  dragPieceAtSquare(square) {
    this.isDraggingPiece = true;
    this.draggingSquare = square;

    const piece = this.board.squares[square];
    if (piece === PIECE_NONE) return;
  }

  promotePiece() {
    const mouseTargetSquare = getSquareUnderMouse();
    const promotionMoves = this.pieceMoves.filter(move => move.isPromotion && move.targetSquare === mouseTargetSquare);
    if (promotionMoves.length === 0) return;

    // Get the promotion type
    let promotionType = null;
    while (promotionType === null) {
      const promptInput = parseInt(prompt('Promotion type: (1: Queen, 2: Rook, 3: Bishop, 4: Knight)'));
      if (promptInput > 0 && promptInput < 5) {
        promotionType = promptInput + 2;
      }
    }

    const promotingMove = promotionMoves.filter(move => move.flag === promotionType)[0];
    promotingMove.printMove();
    board.makeMove(promotingMove);

  }

  stopDraggingPiece() {
    const mouseTargetSquare = getSquareUnderMouse();

    for (const move of this.pieceMoves) {
      if (move.targetSquare === mouseTargetSquare) {
        if (move.isPromotion) {
          this.promotePiece();
        } else {
          board.makeMove(move);
        }
        break;
      }
    }
    this.draggingSquare = -1;
    this.isDraggingPiece = false;
    this.pieceMoves = [];
    this.show();
  }
}
