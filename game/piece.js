class Piece {
  static IsColour = (piece, colour) => (piece & COLOUR_MASK) === colour;

  static IsType = (piece, type) => (piece & TYPE_MASK) === type;

  static PieceColour = (piece) => piece & COLOUR_MASK;

  static PieceType = (piece) => piece & TYPE_MASK;

  static IsSlidingPiece = (piece) => (piece & 0b00100) !== 0;
}
