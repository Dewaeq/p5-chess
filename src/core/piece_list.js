class PieceList {
  constructor(maxPieceCount = 16) {
    /**The square this piece sits on */
    this.occupiedSquares = Array(maxPieceCount);
    /**The index of the piece at this square */
    this.map = Array(64);
    this.numPieces = 0;
  }

  addPieceAtSquare(square) {
    this.occupiedSquares[this.numPieces] = square;
    this.map[square] = this.numPieces;
    this.numPieces++;
  }

  removePieceAtSquare(square) {
    const pieceIndex = this.map[square];
    // Move the last element to the place of the removed element
    this.occupiedSquares[pieceIndex] = this.occupiedSquares[this.numPieces - 1];
    this.map[this.occupiedSquares[pieceIndex]] = pieceIndex;

    this.numPieces--;
  }

  movePiece(startSquare, toSquare) {
    const pieceIndex = this.map[startSquare];
    this.occupiedSquares[pieceIndex] = toSquare;
    this.map[toSquare] = pieceIndex;
  }
}
