class AIPlayer {
    constructor(board) {
        /**@type {Board} */
        this.board = board;
        this.search = new Search(board, this.moveFound);
        this.move = INVALID_MOVE;
        this.isBookMove = false;
        this.searchTime = 4000;
    }

    init() {
        this.search.resetWorkers();
    }

    turnToMove() {
        this.move = INVALID_MOVE;
        this.isBookMove = false;

        if (this.board.gameStateIndex <= MAX_BOOK_MOVES && gameManager.book.hasPosition(...this.board.zobristKey)) {
            const bookMove = gameManager.book.getRandomBookMoveWeighted(...this.board.zobristKey);
            this.isBookMove = true;
            this.moveFound(bookMove);
        } else {
            this.search.startMultiThreadedIterativeSearch(this.searchTime);
        }

    }
    /**
     * @param {Move} move 
     */
    moveFound(move) {
        if (move.moveValue === INVALID_MOVE.moveValue) {
            const e = new Error("Search failed");
            alert("Search failed, new search with more time will start.\n" + e.stack);
            $("#search-time-input").val(this.searchTime * ((this.searchTime === 32000) ? 1 : 2)).change();
            gameManager.aiPlayer.turnToMove();
            return;
        }
        gameManager.aiPlayer.move = move;
        gameManager.makeMove(move);
    }
}