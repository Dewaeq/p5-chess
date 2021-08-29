class Board {
  constructor() {
    /**@type {Uint8Array} */
    this.squares = new Uint8Array(64);

    /** Bits 0-3 store white and black kingside/queenside castling legality
     * Bits 4-7 store file of ep square (starting at 1, so 0 = no ep square)
     * Bits 8-13 captured piece
     * Bits 14-... fifty mover counter
     * @type {number} */
    this.currentGameState;

    /**@type {PIECE_WHITE | PIECE_BLACK} */
    this.colourToMove;

    /**@type {PIECE_WHITE | PIECE_BLACK} */
    this.opponentColour;

    /**@type {WHITE_INDEX | BLACK_INDEX} */
    this.colourToMoveIndex;

    /**@type {Uint16Array} */
    this.gameStateHistory = new Uint16Array(400);

    this.gameStateIndex = 1;

    /**@type {number[]} */
    this.kingSquares = [];

    /**@type {PieceList[]} */
    this.pawns = [];

    /**@type {PieceList[]} */
    this.knights = [];

    /**@type {PieceList[]} */
    this.bishops = [];

    /**@type {PieceList[]} */
    this.rooks = [];

    /**@type {PieceList[]} */
    this.queens = [];

    /**@type {PieceList[]} */
    this.allPieceLists = [];
  }

  init() {
    this.squares = new Uint8Array(64);
    this.colourToMove = PIECE_WHITE;
    this.opponentColour = PIECE_BLACK;
    this.colourToMoveIndex = 0;

    //TODO: Replace with proper game state
    this.currentGameState = 0b00000000001111;
    this.gameStateHistory = new Uint16Array(400);
    this.gameStateIndex = 1;

    this.pawns = [new PieceList(8), new PieceList(8)];
    this.knights = [new PieceList(10), new PieceList(10)];
    this.bishops = [new PieceList(10), new PieceList(10)];
    this.rooks = [new PieceList(10), new PieceList(10)];
    this.queens = [new PieceList(10), new PieceList(10)];

    const emptyList = new PieceList(0);

    this.allPieceLists = [
      emptyList,
      emptyList,
      this.pawns[WHITE_INDEX],
      this.knights[WHITE_INDEX],
      emptyList,
      this.bishops[WHITE_INDEX],
      this.rooks[WHITE_INDEX],
      this.queens[WHITE_INDEX],
      // Black pieces
      emptyList,
      emptyList,
      this.pawns[BLACK_INDEX],
      this.knights[BLACK_INDEX],
      emptyList,
      this.bishops[BLACK_INDEX],
      this.rooks[BLACK_INDEX],
      this.queens[BLACK_INDEX],
    ];
  }

  /**
   * @param {Move} move 
   */
  makeMove(move) {
    const startSquare = move.startSquare;
    const targetSquare = move.targetSquare;
    const opponentColourIndex = 1 - this.colourToMoveIndex;

    const originalCastleState = this.currentGameState & 15;
    let newCastleState = originalCastleState;
    this.currentGameState = 0;

    const movingPiece = this.squares[startSquare];
    const capturedPiece = this.squares[targetSquare];

    const movingPieceType = Piece.PieceType(movingPiece);
    const capturedPieceType = Piece.PieceType(capturedPiece);
    const moveFlag = move.flag;
    const isPromotion = move.isPromotion;
    const isEnPassant = (moveFlag === Move.Flag.EnPassantCapture)

    // Captures
    this.currentGameState |= (capturedPieceType << 8);
    if (capturedPieceType !== PIECE_NONE && !isEnPassant) {
      this.getPieceList(capturedPieceType, opponentColourIndex).removePieceAtSquare(targetSquare);
    }

    // Move piece in pieceList
    if (movingPieceType === PIECE_KING) {
      if (this.whiteToMove && (startSquare > 40 || targetSquare > 40))
        console.log();
      this.kingSquares[this.colourToMoveIndex] = targetSquare;
    }
    else {
      this.getPieceList(movingPieceType, this.colourToMoveIndex).movePiece(startSquare, targetSquare);
    }

    let pieceOnTargetSquare = movingPiece;
    // Promotions
    if (isPromotion) {
      let promoteType = 0;

      switch (moveFlag) {
        case Move.Flag.PromoteToKnight:
          promoteType = PIECE_KNIGHT;
          this.knights[this.colourToMoveIndex].addPieceAtSquare(targetSquare);
          break;
        case Move.Flag.PromoteToBishop:
          promoteType = PIECE_BISHOP;
          this.bishops[this.colourToMoveIndex].addPieceAtSquare(targetSquare);
          break;
        case Move.Flag.PromoteToRook:
          promoteType = PIECE_ROOK;
          this.rooks[this.colourToMoveIndex].addPieceAtSquare(targetSquare);
          break;
        case Move.Flag.PromoteToQueen:
          promoteType = PIECE_QUEEN;
          this.queens[this.colourToMoveIndex].addPieceAtSquare(targetSquare);
          break;
      }
      pieceOnTargetSquare = (this.colourToMove | promoteType);
      this.pawns[this.colourToMoveIndex].removePieceAtSquare(targetSquare);
    }
    else {
      switch (moveFlag) {
        case Move.Flag.PawnDoubleForward:
          const epFile = BoardRepresentation.FileIndex(startSquare) + 1;
          // Clear the current ep-data
          this.currentGameState |= (epFile << 4);
          break;

        case Move.Flag.EnPassantCapture:
          const epPawnSquare = targetSquare + ((this.colourToMove === PIECE_WHITE) ? -8 : 8);
          // Set ep-pawn as captured piece
          this.currentGameState |= (this.squares[epPawnSquare] << 8);

          this.squares[epPawnSquare] = PIECE_NONE;
          this.pawns[opponentColourIndex].removePieceAtSquare(epPawnSquare);
          break;
        case Move.Flag.Castling:
          const kingSideCastle = (targetSquare === G1) || (targetSquare === G8);
          const rookStartSquare = targetSquare + (kingSideCastle ? 1 : -2);
          const rookTargetSquare = targetSquare + (kingSideCastle ? -1 : 1);

          this.squares[rookStartSquare] = PIECE_NONE;
          this.squares[rookTargetSquare] = (this.colourToMove | PIECE_ROOK);

          this.rooks[this.colourToMoveIndex].movePiece(rookStartSquare, rookTargetSquare);

          newCastleState &= (this.whiteToMove) ? WhiteCastleMask : BlackCastleMask;
          break;
      }
    }

    if (originalCastleState !== 0) {
      if (startSquare === H1 || targetSquare === H1) {
        newCastleState &= WhiteCastleKingsideMask;
      } else if (startSquare === A1 || targetSquare === A1) {
        newCastleState &= WhiteCastleQueensideMask;
      }
      if (startSquare === H8 || targetSquare === H8) {
        newCastleState &= BlackCastleKingsideMask;
      } else if (startSquare === A8 || targetSquare === A8) {
        newCastleState &= BlackCastleQueensideMask;
      }
    }

    this.currentGameState |= newCastleState;

    this.squares[targetSquare] = pieceOnTargetSquare;
    this.squares[startSquare] = PIECE_NONE;

    this.gameStateHistory[this.gameStateIndex] = this.currentGameState;
    this.gameStateIndex++;

    this.switchTurn();
  }

  /**
   * @param {Move} move 
   */
  unMakeMove(move) {
    const startSquare = move.startSquare;
    const targetSquare = move.targetSquare;
    const opponentColourIndex = this.colourToMoveIndex;

    this.switchTurn();

    const capturedPieceType = (this.currentGameState >> 8) & 0b111111;
    const capturedPiece = (capturedPieceType === 0) ? 0 : (this.opponentColour | capturedPieceType);

    const isPromotion = move.isPromotion;
    const moveFlag = move.flag;
    const isEnPassant = (moveFlag === Move.Flag.EnPassantCapture);

    const movedPiece = (isPromotion) ? (this.colourToMove | PIECE_PAWN) : this.squares[targetSquare];
    const movedPieceType = Piece.PieceType(movedPiece);

    // Normal capture
    if (capturedPieceType !== PIECE_NONE && !isEnPassant) {
      this.getPieceList(capturedPieceType, opponentColourIndex).addPieceAtSquare(targetSquare);
    }

    // Move in pieceList
    if (movedPieceType === PIECE_KING) {
      if (this.whiteToMove && (startSquare > 40 || targetSquare > 40))
        console.log();
      this.kingSquares[this.colourToMoveIndex] = startSquare;
    } else if (!isPromotion) {
      this.getPieceList(movedPieceType, this.colourToMoveIndex).movePiece(targetSquare, startSquare);
    }

    this.squares[startSquare] = movedPiece;
    this.squares[targetSquare] = capturedPiece;

    if (isPromotion) {
      this.pawns[this.colourToMoveIndex].addPieceAtSquare(startSquare);
      switch (moveFlag) {
        case Move.Flag.PromoteToKnight:
          this.knights[this.colourToMoveIndex].removePieceAtSquare(targetSquare);
          break;
        case Move.Flag.PromoteToBishop:
          this.bishops[this.colourToMoveIndex].removePieceAtSquare(targetSquare);
          break;
        case Move.Flag.PromoteToRook:
          this.rooks[this.colourToMoveIndex].removePieceAtSquare(targetSquare);
          break;
        case Move.Flag.PromoteToQueen:
          this.queens[this.colourToMoveIndex].removePieceAtSquare(targetSquare);
          break;
      }
    } else {
      switch (moveFlag) {
        case Move.Flag.EnPassantCapture:
          const epPawnSquare = targetSquare + ((this.colourToMove === PIECE_WHITE) ? -8 : 8);
          this.squares[targetSquare] = PIECE_NONE;
          this.squares[epPawnSquare] = (this.opponentColour | PIECE_PAWN);
          this.pawns[opponentColourIndex].addPieceAtSquare(epPawnSquare);
          break;

        case Move.Flag.Castling:
          const kingSideCastle = (targetSquare === G1) || (targetSquare === G8);
          const rookStartSquare = targetSquare + (kingSideCastle ? 1 : -2);
          const rookTargetSquare = targetSquare + (kingSideCastle ? -1 : 1);

          this.squares[rookTargetSquare] = PIECE_NONE;
          this.squares[rookStartSquare] = (this.colourToMove | PIECE_ROOK);

          this.rooks[this.colourToMoveIndex].movePiece(rookTargetSquare, rookStartSquare);
          break;
      }
    }

    this.gameStateIndex--;
    this.currentGameState = this.gameStateHistory[this.gameStateIndex - 1];

    // this.gameStateHistory.pop();
    // this.currentGameState = this.gameStateHistory[this.gameStateHistory.length - 1];
  }

  switchTurn() {
    this.opponentColour = this.colourToMove;
    this.colourToMoveIndex = 1 - this.colourToMoveIndex;
    this.colourToMove = (this.colourToMove === PIECE_WHITE) ? PIECE_BLACK : PIECE_WHITE;
  }

  /**
   * @param {String} fenString
   */
  fenToBoard(fenString) {
    this.init();

    const pieceTypeFromSymbol = {
      p: PIECE_PAWN,
      n: PIECE_KNIGHT,
      b: PIECE_BISHOP,
      r: PIECE_ROOK,
      q: PIECE_QUEEN,
      k: PIECE_KING,
    };

    const sections = fenString.split(" ");

    let file = 0;
    let rank = 7;

    sections[0].split("").forEach((symbol) => {
      if (symbol === "/") {
        file = 0;
        rank--;
        return;
      }
      if (isNumeric(symbol)) {
        file += parseInt(symbol);
        return;
      }
      const pieceColour = isUppercase(symbol) ? PIECE_WHITE : PIECE_BLACK;
      const pieceType = pieceTypeFromSymbol[symbol.toLowerCase()];

      this.squares[rank * 8 + file] = (pieceType | pieceColour);
      file++;
    });

    for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
      const piece = this.squares[squareIndex];
      if (piece === PIECE_NONE) continue;

      const pieceColourInd = Piece.IsColour(piece, PIECE_WHITE)
        ? WHITE_INDEX
        : BLACK_INDEX;

      switch (piece & TYPE_MASK) {
        case PIECE_KING:
          this.kingSquares[pieceColourInd] = squareIndex;
          break;
        case PIECE_PAWN:
          this.pawns[pieceColourInd].addPieceAtSquare(squareIndex);
          break;
        case PIECE_KNIGHT:
          this.knights[pieceColourInd].addPieceAtSquare(squareIndex);
          break;
        case PIECE_BISHOP:
          this.bishops[pieceColourInd].addPieceAtSquare(squareIndex);
          break;
        case PIECE_ROOK:
          this.rooks[pieceColourInd].addPieceAtSquare(squareIndex);
          break;
        case PIECE_QUEEN:
          this.queens[pieceColourInd].addPieceAtSquare(squareIndex);
          break;
      }
    }
  }

  getPieceList(pieceType, colourIndex) {
    return this.allPieceLists[colourIndex * 8 + pieceType];
  }

  get whiteToMove() {
    return (this.colourToMove === PIECE_WHITE);
  }
}
