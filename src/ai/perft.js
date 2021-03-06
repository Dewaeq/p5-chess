class Perft {  
    static CountMoves(depth) {
        this.moveGen = new MoveGenerator();
        this.board = new Board();
        this.board.fenToBoard(fenStartString);

        const startTime = performance.now();
        const result =  this.countPossibleMoves(depth);
        const endTime = performance.now();

        return {
            numPositions: result,
            time: endTime - startTime,
            "n/s": result / (endTime - startTime) * 1000,
        }
    }

    static countPossibleMoves(depth) {
        if (depth === 0) {
            return 1;
        }

        const moves = this.moveGen.generateMoves(this.board, true, PROMOTION_MODE_ALL);
        let numPositions = 0;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            this.board.makeMove(move, true);
            numPositions += this.countPossibleMoves(depth - 1);
            this.board.unMakeMove(move, true);
        }

        return numPositions;
    }
}