class Board {
  constructor() {
    /**@type {number[]} */
    this.squares = Array(64).fill(0);

    /** Bits 0-3 store white and black kingside/queenside castling legality
     * Bits 4-7 store file of ep square (starting at 1, so 0 = no ep square)
     * Bits 8-13 captured pieceBits 14-... fifty mover counter
     * @type {number} */
    this.currentGameState;

    /**@type {number[]} */
    this.gameStateHistory = [];

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
    this.pawns = [new PieceList(8), new PieceList(8)];
    this.knights = [new PieceList(10), new PieceList(10)];
    this.bishops = [new PieceList(10), new PieceList(10)];
    this.rooks = [new PieceList(10), new PieceList(10)];
    this.queens = [new PieceList(10), new PieceList(10)];

    const emptyList = PieceList(0);

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
   *
   * @param {String} fenString
   */
  fenToBoard(fenString) {

    const pieceTypeFromSymbol = {  
        'p': PIECE_PAWN, 
        'n': PIECE_KNIGHT, 
        'b': PIECE_BISHOP, 
        'r': PIECE_BISHOP, 
        'q': PIECE_QUEEN, 
        'k': PIECE_KING,
    };

    const sections = fenString.split(" ");

    let file = 0;
    let rank = 7;

    sections[0].split('').forEach(symbol => {
        if(symbol === '/') {
            file = 0;
            rank--;
            continue;
        }
        if(isNumeric(symbol)) {
            file += parseInt(symbol);
            continue;
        }
        const pieceColour = isUppercase(symbol) ? PIECE_WHITE : PIECE_BLACK;
        const pieceType = pieceTypeFromSymbol[symbol.toLowerCase()];

        this.squares[rank * 8 + file] = pieceType | pieceColour;
        file++;
    });
  }

  getPieceList(pieceType, colourIndex) {
    return this.allPieceLists[colourIndex * 8 + pieceType];
  }
}
