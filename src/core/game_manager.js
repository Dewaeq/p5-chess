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
        this.aiPlayer.init();

        this.board.fenToBoard(fenStartString);

        this.whiteToMove = this.board.whiteToMove;
        setTimeout(() => {
            this.gui.show();
        }, 1000);
    }

    /**
     * @param {Move} move 
     */
    makeMove(move) {
        this.gui.updateStats();

        this.board.makeMove(move);
        this.gui.lastMove = move;
        this.whiteToMove = !this.whiteToMove;

        this.gui.show();
        this.gui.playMoveSound();

        const gameOver = this.getGameState();

        if (!gameOver) {
            if (this.whiteToMove !== this.humanPlaysWhite) {
                this.aiPlayer.turnToMove();
            }
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
                return true;
            }
            this.gui.setGameState("Stalemate");
            return true;
        }

        const repCount = this.board.repetitionHistory.filter(p => p === keysToPosKey(...this.board.zobristKey)).length;
        if (repCount >= 3) {
            this.gui.setEval("0");
            this.gui.setGameState("Draw: Threefold repetition");
            return true;
        }

        if (this.aiPlayer.isBookMove) {
            this.gui.setEval("/");
            this.gui.setGameState("Book move");
            return false;
        }

        const evaluation = this.aiPlayer.search.bestEval;
        const guiEvaluation = evaluation / 100 * ((this.whiteToMove) ? -1 : 1);

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
        const numPawns = this.board.pawns[WHITE_INDEX].numPieces + this.board.pawns[BLACK_INDEX].numPieces;
        const numKnights = this.board.knights[WHITE_INDEX].numPieces + this.board.knights[BLACK_INDEX].numPieces;
        const numBishops = this.board.bishops[WHITE_INDEX].numPieces + this.board.bishops[BLACK_INDEX].numPieces;
        const numRooks = this.board.rooks[WHITE_INDEX].numPieces + this.board.rooks[BLACK_INDEX].numPieces;
        const numQueens = this.board.queens[WHITE_INDEX].numPieces + this.board.rooks[BLACK_INDEX].numPieces;

        if ((numPawns + numRooks + numQueens === 0) && (numKnights === 1 || numBishops === 1)) {
            this.gui.setEval("Draw for insufficient material");
            this.gui.setEval("");

            return true;
        }
        return false;
    }
}