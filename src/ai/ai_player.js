class AIPlayer {
    constructor(board) {
        this.board = board;
        this.search = new Search(board, this.moveFound);
        this.searchDepth = 4;
        this.move = INVALID_MOVE;
    }
    
    turnToMove() {
        this.move = INVALID_MOVE;
        this.search.startSearch(this.searchDepth);
    }
    /**
     * @param {Move} move 
     */
    moveFound(move) {
        if (move.moveValue !== INVALID_MOVE) {
            gameManager.aiPlayer.move = move;
            move.printMove();
            gameManager.makeMove(move);
        }
    }
}