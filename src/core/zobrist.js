class Zobrist {

    static Seed = 418645;

    /**@type {number[][][]} */
    static PiecesArray = Array(8).fill(0).map(_ => Array(2).fill(0).map(_ => Array(64)));

    // currentGameStates maximal decimal value for castling is 15
    static CastlingRights = Array(16);

    static EPFile = Array(9);

    static SideToMove = Array(2);

    static async Init() {
        const prng = await this.LoadRandomNumbersFromFile();

        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
            for (let pieceIndex = 0; pieceIndex < 8; pieceIndex++) {
                this.PiecesArray[pieceIndex][WHITE_INDEX][squareIndex] = [prng.next().value, prng.next().value];
                this.PiecesArray[pieceIndex][BLACK_INDEX][squareIndex] = [prng.next().value, prng.next().value];
            }
        }

        for (let i = 0; i < 16; i++) {
            this.CastlingRights[i] = [prng.next().value, prng.next().value];
        }

        for (let i = 0; i < this.EPFile.length; i++) {
            this.EPFile[i] = [prng.next().value, prng.next().value];
        }

        this.SideToMove = [prng.next().value, prng.next().value];
    }

    static WriteRandomNumbersToFile() {
        const prng = Random.MersenneTwister19937.seed(this.Seed);
        const numNumbers = 2 * (64 * 8 * 2 + 16 + this.EPFile.length + 1);

        let data = "";
        for (let i = 0; i < numNumbers; i++) {
            data += (prng.next() + "\n")
        }

        download("random-numbers.txt", data);
    }

    static async LoadRandomNumbersFromFile() {
        const response = await fetch("../../../assets/random-numbers.txt");
        const data = await response.text();
        const numbersArray = data.split("\n");
        
        numbersArray.map(n => parseInt(n));
        return numbersArray[Symbol.iterator]();
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
            applyHashes(...Zobrist.SideToMove);
        }

        applyHashes(...Zobrist.CastlingRights[board.currentGameState & 0b1111]);

        return [low, high];
    }
}