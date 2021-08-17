class Perft {  
    static CountMoves(depth) {
        this.search = new Search();

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

        const moves = this.search.generateMoves(board);
        let numPositions = 0;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            board.makeMove(move);
            numPositions += this.countPossibleMoves(depth - 1);
            board.unMakeMove(move);
        }

        return numPositions;
    }
}