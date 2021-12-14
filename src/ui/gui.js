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
    this.initUI();

    this.moveSound = new Audio("../assets/sounds/move_sound.wav");

    // Hacky trick to enable audio for IOS Safari
    this.moveSound.addEventListener("play", () => {
      if (!this.firstLaunch) {
        this.moveSound.pause();
        this.firstLaunch = true;
      }
    });

    document.addEventListener("click", () => {
      if (!this.firstLaunch)
        this.moveSound.play();
    });

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
    $("#undo-move").prop("disabled", true);
    $("#include-quiet-input").prop("checked", true);
    $("#order-moves-input").prop("checked", true);
    $("#play-white-input").prop("checked", true);
    $("#search-time-input").val(gameManager.aiPlayer.searchTime);
    $("#fen-string-input").val(fenStartString);
    $("#num-workers-input").val(gameManager.aiPlayer.search.numWorkers)

    $("#undo-move").on("click", function () {
      gameManager.board.unMakeMove(gameManager.gui.lastMove);
      gameManager.gui.lastMove = INVALID_MOVE;
      gameManager.gui.show();
      startEvaluation();
      $(this).prop("disabled", true);
    });

    $("#play-white-input").on("click", function () {
      // Only switch sides when it's the human's turn to not 
      // mess up aiPlayer's ongoing search
      if (gameManager.humansTurn) {
        gameManager.humanPlaysWhite = !gameManager.humanPlaysWhite;
        gameManager.aiPlayer.turnToMove();
      } else {
        $("#play-white-input").prop("checked", gameManager.humanPlaysWhite);
      }
    });

    $("#include-quiet-input").on("click", function () {
      gameManager.aiPlayer.search.searchQuiescencent = !gameManager.aiPlayer.search.searchQuiescencent;
    });

    $("#order-moves-input").on("click", function () {
      gameManager.aiPlayer.search.orderMoves = !gameManager.aiPlayer.search.orderMoves;
    });

    $("#fen-string-input").on("change", function () {
      gameManager.board.fenToBoard($(this).val());
    });

    $("#search-time-input").on("change", function () {
      gameManager.aiPlayer.searchTime = parseInt($(this).val());
    });

    $("#num-workers-input").on("change", function () {
      const value = parseInt($(this).val());
      if (gameManager.humansTurn && value > 0 && value < 6) {
        gameManager.aiPlayer.search.numWorkers = value;
        gameManager.aiPlayer.search.resetWorkers();
      } else {
        $(this).val(gameManager.aiPlayer.search.numWorkers);
      }
    });
  }

  updateStats() {
    const searchDepth = gameManager.aiPlayer.search.lastCompletedDepth;
    const numNodes = gameManager.aiPlayer.search.numNodes;
    const numQNodes = gameManager.aiPlayer.search.numQNodes;
    const numCutOffs = gameManager.aiPlayer.search.numCutOffs;
    const calcTime = gameManager.aiPlayer.search.calcTime;

    $("#search-depth-count").text(searchDepth);
    $("#nodes-count").text(Math.round(numNodes / 1000));
    $("#qnodes-count").text(Math.round(numNodes / 1000));
    $("#cuttofs-count").text(numCutOffs);
    $("#nodes-per-second-count").text(Math.round((numNodes + numQNodes) / calcTime));
  }

  setEval(gameEval) {
    $("#advantageBar").css("height", `${50 + gameEval * 5}%`);
    if (typeof (gameEval) === "number") {
      $(".game-eval").text(gameEval.toFixed(2));
    }
    else {
      $(".game-eval").text(gameEval);
    }
  }

  setGameState(gameState) {
    $("#game-state").text(gameState);
  }

  updateSearchDepthStat(newLastCompletedDepth) {
    $("#search-depth-count").text(newLastCompletedDepth);
  }

  /**
   * @param {Map<number, number>} moveEvaluations 
   */
  showMoveEvaluations(moveEvaluations) {
    this.show(false);

    // Clear previous data
    for (let i = 0; i < 3; i++) {
      $(`#best-move-${i}`).text("");
    }

    const sortedEval = Array.from(moveEvaluations).sort((a, b) => b[1] - a[1]);
    const maxLength = (sortedEval.length > 3) ? 3 : sortedEval.length;
    for (let i = 0; i < maxLength; i++) {
      const bestmove = sortedEval[i];
      const move = new Move(bestmove[0]);
      let moveScore;
      if (Search.IsMateScore(bestmove[1])) {
        moveScore = "#" + Search.NumPlyToMateFromScore(bestmove[1]);
      } else {
        moveScore = (bestmove[1] / 100 * ((this.board.whiteToMove) ? 1 : -1)).toFixed(2);
      }
      const startSquare = BoardRepresentation.CoordToString(move.startSquare);
      const targetSquare = BoardRepresentation.CoordToString(move.targetSquare);

      this.drawArrow(move.startSquare, move.targetSquare, (i + 1) * 50);

      $(`#best-move-${i}`).text(`${moveScore} ${startSquare}${targetSquare}`);
    }
  }

  drawArrow(startSquare, targetSquare, weight) {
    stroke(weight, 300 - weight);
    strokeWeight(tileSize / 10);
    const from = BoardGUI.SquareToGuiCoord(startSquare);
    const to = BoardGUI.SquareToGuiCoord(targetSquare);
    const offset = tileSize / 2;

    from[0] = from[0] * tileSize + offset;
    from[1] = from[1] * tileSize + offset;
    to[0] = to[0] * tileSize + offset;
    to[1] = to[1] * tileSize + offset;

    line(
      from[0],
      from[1],
      to[0],
      to[1],
    );
    // Arrow from https://stackoverflow.com/a/44892083
    push();
    var angle = atan2(from[1] - to[1], from[0] - to[0]); //gets the angle of the line
    translate(to[0], to[1]); //translates to the destination vertex
    rotate(angle - HALF_PI); //rotates the arrow point
    triangle(-(tileSize / 10) * 0.5, (tileSize / 10), (tileSize / 10) * 0.5, (tileSize / 10), 0, -(tileSize / 10) / 2); //draws the arrow point as a triangle
    pop();
  }

  updateBookModalStats(percentage) {
    $("#book-download-progress").val(percentage);
    $("#book-download-progress-text").text(percentage + "%");
  }

  showBookModal(open) {
    if (open) {
      $("#book-download-modal").modal("show");
    } else {
      $("#book-download-modal").modal("hide");
    }
  }

  show(showMoveEvaluations = true) {
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

    if (this.lastMove.moveValue !== INVALID_MOVE.moveValue) {
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

    if (ANALYZING && showMoveEvaluations) {
      this.showMoveEvaluations(gameManager.aiPlayer.search.moveEvaluations);
    }
  }

  showPieceMoves(startSquare) {
    noStroke();
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

    noStroke();
    fill(221, 165, 118);

    rect(
      x * tileSize,
      y * tileSize,
      tileSize,
      tileSize,
    );

    if (ANALYZING) {
      this.showMoveEvaluations(gameManager.aiPlayer.search.moveEvaluations);
    }

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
      const promptInput = parseInt(prompt('Promotion type: (1: Queen, 2: Knight)'));
      if (promptInput > 0 && promptInput < 3) {
        promotionType = (promptInput < 2) ? Move.Flag.PromoteToQueen : Move.Flag.PromoteToKnight;
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
          this.promotePiece();
        } else {
          gameManager.makeMove(move);
        }

        this.draggingSquare = -1;
        this.pieceMoves = [];
        break;
      }
    }
    this.isDraggingPiece = false;

    this.show();

    if (this.draggingSquare !== -1) {
      this.showPieceMoves(this.draggingSquare);
    }
  }
}
