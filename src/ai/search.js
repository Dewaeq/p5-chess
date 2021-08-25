class Search {
    /**
     * @param {Board} board 
     */
    constructor(board) {
        this.board = board;
        this.moveGenerator = new MoveGenerator();
        this.evaluation = new Evaluation();
        this.moveOrdering = new MoveOrdering();

        this.numNodes = 0;
        this.numQNodes = 0;
        this.numCutOffs = 0;

        this.abortSearch = false;
        this.bestMoveThisIteration = INVALID_MOVE;
        this.bestEvalThisIteration = 0;
        this.bestMove = INVALID_MOVE;
        this.bestEval = 0;
    }

    startSearch(depth) {
        this.bestEvalThisIteration = 0;
        this.bestEval = 0;
        this.bestMoveThisIteration = INVALID_MOVE;
        this.bestMove = INVALID_MOVE;
        this.abortSearch = false;
        this.orderMoves = true;

        this.numCutOffs = 0;
        this.numNodes = 0;
        this.numQNodes = 0;

        // With move ordering
        const startTime1 = performance.now();

        this.searchMoves(depth, 0, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);

        const endTime1 = performance.now();
        console.log(this.numNodes / (endTime1 - startTime1) * 1000, "nodes/s with move ordering");
        console.log("nodes: ", this.numNodes, "cutoffs: ", this.numCutOffs);

        this.numCutOffs = 0;
        this.numNodes = 0;
        this.numQNodes = 0;

        // Without move ordering
        this.orderMoves = false;
        const startTime2 = performance.now();

        this.searchMoves(depth, 0, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);

        const endTime2 = performance.now();
        console.log(this.numNodes / (endTime2 - startTime2) * 1000, "nodes/s without move ordering");
        console.log("nodes: ", this.numNodes, "cutoffs: ", this.numCutOffs);

        this.bestMove = this.bestMoveThisIteration;
        this.bestEval = this.bestEvalThisIteration;

        if (this.bestMove.moveValue !== INVALID_MOVE.moveValue) {
            board.makeMove(this.bestMove);
            gui.show();
        }
    }

    stopSearch() {
        this.abortSearch = true;
    }

    getSearchResult() {
        return [this.bestMove, this.bestEval];
    }

    searchMoves(depth, plyFromRoot, alpha, beta) {
        if (this.abortSearch) {
            return 0;
        }

        if (plyFromRoot > 0) {
            // Skip this position if a mating sequence has already been found earlier in
            // the search, which would be shorter than any mate we could find from here.
            // This is done by observing that alpha can't possibly be worse (and likewise
            // beta can't  possibly be better) than being mated in the current position.
            alpha = Math.max(alpha, -IMMEDIATE_MATE_SCORE + plyFromRoot);
            beta = Math.min(beta, IMMEDIATE_MATE_SCORE - plyFromRoot);
            if (alpha >= beta) {
                return alpha;
            }
        }

        if (depth === 0) {
            // const evaluation = this.quiescenseSearch(alpha, beta);
            const evaluation = this.evaluation.evaluate(this.board);
            return evaluation;
        }

        const moves = this.moveGenerator.generateMoves(this.board);
        if (this.orderMoves)
            this.moveOrdering.orderMoves(this.board, moves);

        if (moves.length === 0) {
            if (this.moveGenerator.inCheck) {
                const mateScore = IMMEDIATE_MATE_SCORE - plyFromRoot;
                return -mateScore;
            }
            return 0;
        }


        for (let i = 0; i < moves.length; i++) {
            this.board.makeMove(moves[i]);
            const evaluation = -this.searchMoves(depth - 1, plyFromRoot + 1, -beta, -alpha);
            this.board.unMakeMove(moves[i]);
            this.numNodes++;

            if (evaluation >= beta) {
                this.numCutOffs++;
                return beta;
            }

            if (evaluation > alpha) {

                alpha = evaluation;
                if (plyFromRoot === 0) {
                    this.bestMoveThisIteration = moves[i];
                    this.bestEvalThisIteration = evaluation;
                }
            }
        }

        return alpha;
    }

    quiescenseSearch(alpha, beta) {
        let evaluation = this.evaluation.evaluate(this.board);

        if (evaluation >= beta) {
            return beta;
        }
        if (evaluation > alpha) {
            alpha = evaluation;
        }

        const moves = this.moveGenerator.generateMoves(this.board, false);
        if (this.orderMoves)
            this.moveOrdering.orderMoves(board, moves);
        for (let i = 0; i < moves.length; i++) {
            this.board.makeMove(moves[i]);
            evaluation = -this.quiescenseSearch(-beta, -alpha);
            this.board.unMakeMove(moves[i]);
            this.numQNodes++;

            if (evaluation >= beta) {
                this.numCutOffs++;
                return beta;
            }
            if (evaluation > alpha) {
                alpha = evaluation;
            }
        }
        return alpha;
    }
}