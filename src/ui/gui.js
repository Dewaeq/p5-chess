class BoardGUI {
  /**
   * @param {Board} board
   */
  constructor(board) {
    this.board = board;
    this.moveGen = new MoveGenerator();
    this.images = {};
    this.moveSound;
    /**@type {Move[]} */
    this.pieceMoves = [];
    this.isDraggingPiece = false;
    this.draggingSquare = -1;
    this.lastMove = INVALID_MOVE;
  }

  static SquareToGuiCoord = (square) => {
    let [rank, file] = BoardRepresentation.IndexToCoord(square);
    let x = rank;
    let y = 7 - file;
    return [x, y];
  };

  init() {
    this.moveGen.init(this.board);
    this.initUI();

    this.moveSound = loadSound('../../assets/sounds/move_sound.wav');

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

  initUI() {

    $("#include-quiet-input").prop("checked", true);
    $("#order-moves-input").prop("checked", true);
    $("#play-white-input").prop("checked", true);

    $("#play-white-input").on("click", function () {
      gameManager.humanPlaysWhite = !gameManager.humanPlaysWhite
    });

    $("#include-quiet-input").on("click", function () {
      gameManager.aiPlayer.search.searchQuiescencent = !gameManager.aiPlayer.search.searchQuiescencent
    });

    $("#order-moves-input").on("click", function () {
      gameManager.aiPlayer.search.orderMoves = !gameManager.aiPlayer.search.orderMoves
    });

    $("#fen-string-input").val(fenStartString);

    $("#fen-string-input").on("change", function () {
      this.board.fenToBoard($(this).val());
    });

    $("#search-depth-input").val(4);

    $("#search-depth-input").on("change", function () {
      if (!isNumeric($(this).val())) {
        $(this).val(gameManager.aiPlayer.searchDepth);
        return;
      }

      const newDepth = parseInt($(this).val());
      gameManager.aiPlayer.searchDepth = newDepth;
    });
  }

  updateStats() {
    const numNodes = gameManager.aiPlayer.search.numNodes;
    const numQNodes = gameManager.aiPlayer.search.numQNodes;
    const numCutOffs = gameManager.aiPlayer.search.numCutOffs;
    const calcTime = gameManager.aiPlayer.search.calcTime;

    $("#nodes-count").text(numNodes);
    $("#qnodes-count").text(numQNodes);
    $("#cuttofs-count").text(numCutOffs);
    $("#calc-time-count").text((calcTime / 1000).toFixed(4) + " s");
    $("#nodes-per-second-count").text(((numNodes + numQNodes) / calcTime * 1000) | 0);
  }

  setEval(gameEval) {
    $("#game-eval").text(gameEval);
  }

  setGameState(gameState) {
    $("#game-state").text(gameState);
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

    if (this.lastMove !== INVALID_MOVE) {
      const [startSquare, targetSquare] = [this.lastMove.startSquare, this.lastMove.targetSquare];

      const [startX, startY] = BoardGUI.SquareToGuiCoord(startSquare);
      fill("#FFCE88");
      rect(startX * tileSize, startY * tileSize, tileSize, tileSize);

      const [targetX, targetY] = BoardGUI.SquareToGuiCoord(targetSquare);
      rect(targetX * tileSize, targetY * tileSize, tileSize, tileSize);
      fill("#DBA671");
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
    const moves = this.moveGen.generateMoves(this.board);

    if (moves.length === 0) {
      return;
    }

    this.pieceMoves = moves.filter(move => move.startSquare === startSquare);

    this.pieceMoves.forEach(move => {
      const [x, y] = BoardGUI.SquareToGuiCoord(move.targetSquare);

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
  }

  playMoveSound() {
    this.moveSound.play();
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
    gameManager.makeMove(promotingMove);
  }

  stopDraggingPiece() {
    const mouseTargetSquare = getSquareUnderMouse();

    for (const move of this.pieceMoves) {
      if (move.targetSquare === mouseTargetSquare) {
        if (move.isPromotion) {
          this.playMoveSound();
          this.promotePiece();
        } else {
          this.playMoveSound();
          gameManager.makeMove(move);
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
