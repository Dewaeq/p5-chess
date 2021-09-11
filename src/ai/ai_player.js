class AIPlayer {
    constructor(board) {
        /**@type {Board} */
        this.board = board;
        this.search = new Search(board, this.moveFound);
        this.move = INVALID_MOVE;
        this.isBookMove = false;
        this.searchTime = 5000;
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
        if (move.moveValue === INVALID_MOVE.moveValue) return;
        gameManager.aiPlayer.move = move;
        move.printMove();
        gameManager.makeMove(move);
    }
}