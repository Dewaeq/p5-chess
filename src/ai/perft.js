class Perft {  
    static CountMoves(depth) {
        this.moveGen = new MoveGenerator();
        this.board = gameManager.board;

        const startTime = performance.now();
        const result =  this.countPossibleMoves(depth);
        const endTime = performance.now();

        return {
            numPositions: result,
            time: endTime - startTime,
        }
    }

    static countPossibleMoves(depth) {
        if (depth === 0) {
            return 1;
        }

        const moves = this.moveGen.generateMoves(gameManager.board);
        let numPositions = 0;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            gameManager.board.makeMove(move);
            numPositions += this.countPossibleMoves(depth - 1);
            gameManager.board.unMakeMove(move);
        }

        return numPositions;
    }
}