class GameManager {
    constructor() {
        this.board = new Board();
        this.gui = new BoardGUI(this.board);
        this.aiPlayer = new AIPlayer(this.board);
        this.book = new Book();
        this.humanPlaysWhite = true;
        this.whiteToMove = true;
    }

    async init() {
        PrecomputedData.Init();
        await Zobrist.Init();
        await loadBookFromFile();

        this.board.init();
        this.gui.init();

        this.board.fenToBoard(fenStartString);

        this.whiteToMove = this.board.whiteToMove;
        setTimeout(() => {
            this.gui.show();
        }, 1000);
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
        if (this.whiteToMove !== this.humanPlaysWhite) {
            this.gui.updateStats();
        }

        this.board.makeMove(move);
        this.gui.lastMove = move;
        this.whiteToMove = !this.whiteToMove;

        this.gui.show();

        this.getGameState();

        if (this.whiteToMove !== this.humanPlaysWhite) {
            this.aiPlayer.turnToMove();
        }
    }

    getGameState() {
        const moveGenerator = new MoveGenerator();
        const moves = moveGenerator.generateMoves(this.board);

        // (Stale)mate
        if (moves.length === 0) {
            this.gui.setEval("");

            if (moveGenerator.inCheck) {
                this.gui.setGameState((this.whiteToMove) ? "White is mated" : "Black is mated");
                return;
            }
            this.gui.setGameState("Stalemate");
            return;
        }

        if (this.aiPlayer.isBookMove) {
            this.gui.setEval("/");
            this.gui.setGameState("Book move");
            return;
        }

        const evaluation = this.aiPlayer.search.bestEval;
        const guiEvaluation = -evaluation / 100;

        if (Search.IsMateScore(evaluation)) {
            this.gui.setGameState(`Mate in ${Search.NumPlyToMateFromScore(evaluation)} ply`);
        } else {
            if (guiEvaluation > 0) {
                this.gui.setGameState("White has the advantage");
            } else if (guiEvaluation < 0) {
                this.gui.setGameState("Black has the advantage");
            } else {
                this.gui.setGameState("Neither side has the advantage");
            }
        }

        this.gui.setEval(guiEvaluation);

        // Insufficient material
        const numPawns = this.board.pawns[WHITE_INDEX] + this.board.pawns[BLACK_INDEX];
        const numKnights = this.board.knights[WHITE_INDEX] + this.board.knights[BLACK_INDEX];
        const numBishops = this.board.bishops[WHITE_INDEX] + this.board.bishops[BLACK_INDEX];
        const numRooks = this.board.rooks[WHITE_INDEX] + this.board.rooks[BLACK_INDEX];
        const numQueens = this.board.queens[WHITE_INDEX] + this.board.rooks[BLACK_INDEX];

        if ((numPawns + numRooks + numQueens === 0) && (numKnights === 1 || numBishops === 1)) {
            this.gui.setEval("Draw for insufficient material");
            this.gui.setEval("");

            this.whiteToMove = (this.humanPlaysWhite) ? false : true;
        }
    }
}