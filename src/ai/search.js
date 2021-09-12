class Search {
    /**
     * @param {Board} board 
     * @param {Function} onMoveFound
     */
    constructor(board, onMoveFound) {
        this.board = board;
        this.moveGenerator = new MoveGenerator();
        this.evaluation = new Evaluation();
        this.moveOrdering = new MoveOrdering();

        this.onMoveFound = onMoveFound;

        this.numNodes = 0;
        this.numQNodes = 0;
        this.numCutOffs = 0;
        this.calcTime = 0;

        this.abortSearch = false;
        this.orderMoves = true;
        this.searchQuiescencent = true;
        this.iterativeSearch = false;
        this.lastCompletedDepth = 0;
        this.bestMoveThisIteration = INVALID_MOVE;
        this.bestEvalThisIteration = 0;
        this.bestMove = INVALID_MOVE;
        this.bestEval = 0;
    }

    init() {
        this.numNodes = 0;
        this.numQNodes = 0;
        this.numCutOffs = 0;
        this.calcTime = 0;

        this.abortSearch = false;
        this.lastCompletedDepth = 0;
        this.bestMoveThisIteration = INVALID_MOVE;
        this.bestEvalThisIteration = 0;
        this.bestMove = INVALID_MOVE;
        this.bestEval = 0;
    }

    startMultiThreadedIterativeSearch(searchTime) {
        this.init();

        const START_DEPTH = 3;
        const workers = new Array(5);
        const searchSettings = new SearchWorkerInput(
            this.board,
            START_DEPTH,
            this.searchQuiescencent,
            this.orderMoves,
            this.bestMoveThisIteration,
            this.bestEvalThisIteration,
        );

        const postMessage = (worker) => {
            worker.postMessage([
                searchSettings,
                Zobrist.PiecesArray,
                Zobrist.CastlingRights,
                Zobrist.EPFile,
                Zobrist.SideToMove,
            ]);
        }

        const timer = setTimeout(() => {
            workers.forEach(worker => worker.terminate());
            this.onMoveFound(this.bestMove);
        }, searchTime);

        for (let i = 0; i < workers.length; i++) {
            workers[i] = new Worker("../src/ai/search_worker.js");

            workers[i].onmessage = (message) => {
                const searchResult = message.data;
                this.bestMove = new Move(searchResult.bestMoveValue);
                this.bestEval = searchResult.bestEval;
                this.numNodes = searchResult.numNodes;
                this.numQNodes = searchResult.numQNodes;
                this.numCutOffs = searchResult.numCutOffs;
                this.lastCompletedDepth = searchResult.searchDepth;
                this.calcTime = searchResult.searchTime;

                gameManager.gui.updateSearchDepthStat(this.lastCompletedDepth);

                if (Search.IsMateScore(this.bestEval)) {
                    workers.forEach(worker => worker.terminate());
                    clearTimeout(timer);
                    this.onMoveFound(this.bestMove);
                } else {
                    searchSettings.depth++;
                    postMessage(workers[i]);
                }

            }
            postMessage(workers[i]);
            searchSettings.depth++;
        }
    }

    startIterativeSearch(searchTime) {
        this.init();

        const worker = new Worker("../src/ai/search_worker.js");
        const START_DEPTH = 4;
        const searchSettings = new SearchWorkerInput(
            this.board,
            START_DEPTH,
            this.searchQuiescencent,
            this.orderMoves,
            this.bestMoveThisIteration,
            this.bestEvalThisIteration,
        );

        const startTime = performance.now();

        setTimeout(() => {
            worker.terminate();
            const endTime = performance.now();
            this.calcTime = endTime - startTime;

            this.onMoveFound(this.bestMove);
        }, searchTime);

        worker.onmessage = (message) => {
            const searchResult = message.data;
            this.bestMove = new Move(searchResult.bestMoveValue);
            this.bestEval = searchResult.bestEval;
            this.numNodes = searchResult.numNodes;
            this.numQNodes = searchResult.numQNodes;
            this.numCutOffs = searchResult.numCutOffs;
            this.lastCompletedDepth = searchResult.depth;

            gameManager.gui.updateSearchDepthStat(this.lastCompletedDepth);
            searchSettings.depth++;
            searchSettings.bestMoveThisIteration = this.bestMove;
            searchSettings.bestEvalThisIteration = this.bestEval;
            worker.postMessage(searchSettings);
        }
        worker.postMessage(searchSettings);
    }

    startSearch(depth) {
        this.init();

        const startTime = performance.now();
        this.searchMoves(depth, 0, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        const endTime = performance.now();

        this.calcTime = endTime - startTime;

        this.bestMove = this.bestMoveThisIteration;
        this.bestEval = this.bestEvalThisIteration;

        this.onMoveFound(this.bestMove);
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
            if (this.searchQuiescencent)
                return this.quiescenceSearch(alpha, beta);
            return this.evaluation.evaluate(this.board);
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

    quiescenceSearch(alpha, beta) {
        let evaluation = this.evaluation.evaluate(this.board);

        if (evaluation >= beta) {
            return beta;
        }
        if (evaluation > alpha) {
            alpha = evaluation;
        }

        const moves = this.moveGenerator.generateMoves(this.board, false);
        if (this.orderMoves)
            this.moveOrdering.orderMoves(this.board, moves);
        for (let i = 0; i < moves.length; i++) {
            this.board.makeMove(moves[i]);
            evaluation = -this.quiescenceSearch(-beta, -alpha);
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

    static IsMateScore(score) {
        return (Math.abs(score) > (IMMEDIATE_MATE_SCORE - 1000));
    }

    static NumPlyToMateFromScore(score) {
        return ((IMMEDIATE_MATE_SCORE - Math.abs(score)) / 2) | 0;
    }
}

class SearchWorkerInput {
    constructor(board, depth, searchQuiescencent, orderMoves, bestMoveThisIteration, bestEvalThisIteration) {
        this.board = board;
        this.depth = depth;
        this.searchQuiescencent = searchQuiescencent;
        this.orderMoves = orderMoves;
        this.bestMoveThisIteration = bestMoveThisIteration;
        this.bestEvalThisIteration = bestEvalThisIteration;
    }
}

class SearchWorkerResult {
    constructor(bestMoveValue, bestEval, numNodes, numQnodes, numCutoffs, searchDepth, searchTime) {
        this.bestMoveValue = bestMoveValue;
        this.bestEval = bestEval;
        this.numNodes = numNodes;
        this.numQNodes = numQnodes;
        this.numCutOffs = numCutoffs;
        this.searchDepth = searchDepth;
        this.searchTime = searchTime;
    }
}