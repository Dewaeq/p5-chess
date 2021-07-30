class Piece {
  static IsColour = (piece, colour) => (piece & COLOUR_MASK) === colour;

  static IsType = (piece, type) => (piece & TYPE_MASK) === type;

  static PieceColour = (piece) => piece & COLOUR_MASK;

  static PieceType = (piece) => piece & TYPE_MASK;

  static IsSlidingPiece = (piece) => (piece & 0b00100) !== 0;

  static PieceToString = (piece) => {
    if (piece === PIECE_NONE) return null;

    let result = "";
    if (Piece.IsColour(piece, PIECE_WHITE)) {
      result += "white-";
    } else {
      result += "black-";
    }

    switch (Piece.PieceType(piece)) {
      case PIECE_KING:
        return result + "king";
      case PIECE_PAWN:
        return result + "pawn";
      case PIECE_KNIGHT:
        return result + "knight";
      case PIECE_BISHOP:
        return result + "bishop";
      case PIECE_ROOK:
        return result + "rook";
      case PIECE_QUEEN:
        return result + "queen";
      default:
        return null;
    }
  };
}
