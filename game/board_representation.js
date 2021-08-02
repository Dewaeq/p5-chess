class BoardRepresentation {
  static RankIndex = (square) => square >>> 3;

  static FileIndex = (square) => square & 0b000111;

  static IndexToCoord = (sqIndex) => [
    this.FileIndex(sqIndex),
    this.RankIndex(sqIndex),
  ];

  static CoordToIndex = (rank, file) => file * 8 + rank;

  static IsSquareInBoard = (square) => square < 64 && square > -1;
}
