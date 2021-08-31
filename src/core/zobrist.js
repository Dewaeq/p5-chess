class Zobrist {

    static Seed = 418645;

    /**@type {number[][][]} */
    static PiecesArray = Array(8).fill(0).map(_ => Array(2).fill(0).map(_ => Array(64)));

    // currentGameStates maximal decimal value for castling is 15
    static CastlingRights = Array(16);

    static EPFile = Array(9);

    static SideToMove = Array(2);

    static Init() {
        const prng = Random.MersenneTwister19937.seed(this.Seed);

        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            for (let pieceIndex = 0; pieceIndex < 8; pieceIndex++) {
                this.PiecesArray[pieceIndex][WHITE_INDEX][squareIndex] = [prng.next(), prng.next()];
                this.PiecesArray[pieceIndex][BLACK_INDEX][squareIndex] = [prng.next(), prng.next()];
            }
        }

        for (let i = 0; i < 16; i++) {
            this.CastlingRights[i] = [prng.next(), prng.next()];
        }

        for (let i = 0; i < this.EPFile.length; i++) {
            this.EPFile[i] = [prng.next(), prng.next()];
        }

        this.SideToMove = [prng.next(), prng.next()];
    }

    /**
     * @param {Board} board 
     */
    static CalculateZobristHash(board) {
        let low = 0;
        let high = 0;

        const applyHashes = (l, h) => { low ^= l; high ^= h; }

        for (let i = 0; i < 64; i++) {
            if (board.squares[i] !== PIECE_NONE) {
                const pieceType = Piece.PieceType(board.squares[i]);
                const pieceColour = Piece.PieceColour(board.squares[i]);

                applyHashes(...Zobrist.PiecesArray[pieceType][(pieceColour === PIECE_WHITE) ? WHITE_INDEX : BLACK_INDEX][i]);
            }
        }

        const epFile = (board.currentGameState >> 4) & 15;
        if (epFile !== 0) {
            applyHashes(...Zobrist.EPFile[epFile]);
        }

        if (board.colourToMove === PIECE_BLACK) {
            applyHashes(...Zobrist.sideToMove);
        }

        applyHashes(...Zobrist.CastlingRights[board.currentGameState & 0b1111]);

        return [low, high];
    }
}