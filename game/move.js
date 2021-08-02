/**
 * To preserve memory during search, moves are stored as 16 bit numbers.
 * The format is as follows:
 *
 * bit 0-5: from square (0 to 63)
 * bit 6-11: to square (0 to 63)
 * bit 12-15: flag
 * 
 */

class Move {
  static Flag = {
    None: 0,
    EnPassantCapture: 1,
    Castling: 2,
    PromoteToQueen: 3,
    PromoteToRook: 4,
    PromoteToBishop: 5,
    PromoteToKnight: 6,
    PawnDoubleForward: 7,
  };

  static MoveWithFlag = (startSquare, targetSquare, flag) =>
    new Move(startSquare | (targetSquare << 6) | (flag << 12));

  static MoveWithSquares = (startSquare, targetSquare) =>
    new Move(startSquare | (targetSquare << 6));

  static StartSquareMask = 0b0000000000111111;
  static TargetSquareMask = 0b0000111111000000;
  static FlagMask = 0b1111000000000000;

  /**@param {number} moveValue */
  constructor(moveValue) {
    this.moveValue = moveValue;
  }
}
