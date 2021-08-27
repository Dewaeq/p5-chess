class GameManager {
    constructor() {
        this.board = new Board();
        this.gui = new BoardGUI(this.board);
        this.aiPlayer = new AIPlayer(this.board);
        this.humanPlaysWhite = true;
        this.whiteToMove = true;
    }

    init() {
        PrecomputedData.Init();

        this.board.init();
        this.gui.init();

        this.board.fenToBoard(fenStartString);

        this.whiteToMove = this.board.whiteToMove;

        this.gui.show();
    }

    startGame() {
        if (this.whiteToMove !== this.humanPlaysWhite) {
            this.aiPlayer.turnToMove();
        }
    }

    /**
     * @param {Move} move 
     */
    makeMove(move) {
        if(this.whiteToMove !== this.humanPlaysWhite) {
            this.gui.updateStats();
        }

        this.board.makeMove(move);
        this.gui.lastMove = move;
        this.whiteToMove = !this.whiteToMove;

        this.gui.show();

        this.getGameState();

        if (this.whiteToMove !== this.humanPlaysWhite) {
            setTimeout(() => {
                this.aiPlayer.turnToMove();
            }, 10);
        }
    }

    getGameState() {
        const moveGenerator = new MoveGenerator();
        const moves = moveGenerator.generateMoves(this.board);

        // (Stale)mate
        if (moves.length === 0) {
            if (moveGenerator.inCheck) {
                console.log((this.whiteToMove) ? "white is mated" : "black is mated");
                return;
            }
            console.log("stalemate");
            return;
        }

        // Insufficient material
        const numPawns = this.board.pawns[WHITE_INDEX] + this.board.pawns[BLACK_INDEX];
        const numKnights = this.board.knights[WHITE_INDEX] + this.board.knights[BLACK_INDEX];
        const numBishops = this.board.bishops[WHITE_INDEX] + this.board.bishops[BLACK_INDEX];
        const numRooks = this.board.rooks[WHITE_INDEX] + this.board.rooks[BLACK_INDEX];
        const numQueens = this.board.queens[WHITE_INDEX] + this.board.rooks[BLACK_INDEX];

        if ((numPawns + numRooks + numQueens === 0) && (numKnights === 1 || numBishops === 1)) {
            console.log("draw for insufficient material");
            return;
        }
    }
}