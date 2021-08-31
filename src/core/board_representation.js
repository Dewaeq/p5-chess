/**
 * Files and ranks are from 0 - 7
 */

class BoardRepresentation {

  static FileNames = "abcdefgh";

  static RankIndex = (square) => square >> 3;

  static FileIndex = (square) => square & 0b000111;

  static IndexToCoord = (sqIndex) => [
    this.FileIndex(sqIndex),
    this.RankIndex(sqIndex),
  ];

  static CoordToIndex = (rank, file) => rank * 8 + file;

  static StringCoordToIndex = (str) => {
    const file = this.FileNames.indexOf(str[0]);
    const rank = parseInt(str[1]) - 1;

    return this.CoordToIndex(rank, file);
  }

  static CoordFromIndex = (square) => [this.FileIndex(square), this.RankIndex(square)];

  static IsSquareInBoard = (square) => square < 64 && square > -1;
}
