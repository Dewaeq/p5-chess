
class Engine {
    /**
     * @param {Board} board the board to generate moves for
     * @param {boolean} isWhite generate moves for white or black
     */
    generateMoves(board, isWhite) {
        let moves = [];

        for (let i = 0, n = board.pieces.length; i < n; i++) {
            if (board.pieces[i].taken || board.pieces[i].isWhite !== isWhite)
                continue;

            let pieceMoves =
                board.pieces[i].getPossibleMoves(board).allowedMoves;

            moves.push(...pieceMoves);
        }

        return moves;
    }

    /**
     * Positive values mean white is in the advantage, 
     * negative values mean black has the advantage
     * @param {Board} board the board to evaluate
     * @return {number} the value of this board
     */
    evaluateBoard(board) {
        if (board.pieces[board.whKingInd].taken) {
            return Number.NEGATIVE_INFINITY;
        }
        if (board.pieces[board.blKingInd].taken) {
            return Number.POSITIVE_INFINITY;
        }

        let blackMaterial = 0;
        let whiteMaterial = 0;
        let blackPositional = 0;
        let whitePositional = 0;

        for (let i = 0, n = board.pieces.length; i < n; i++) {
            const piece = board.pieces[i];

            if (piece.taken || piece.x < 0 || piece.y < 0)
                continue;

            if (piece.isWhite) {
                whiteMaterial += VALUE_MAP[piece.type] ?? 0;
                whitePositional += POSITIONAL_VALUE[true][piece.type][piece.y][piece.x] ?? 0;
            } else {
                blackMaterial += VALUE_MAP[piece.type] ?? 0;
                blackPositional += POSITIONAL_VALUE[false][piece.type][piece.y][piece.x] ?? 0;
            }
        }

        const materialDifference = whiteMaterial - blackMaterial;
        const positionalDifference = whitePositional - blackPositional;

        return materialDifference + positionalDifference;
    }

    /**
    * Calcualte the best move on the given board for the given
      depth and colour. Calls this.getBestMove
    * @param {Board} board the board to generate moves for
    * @param {number} depth search depth (2 means 1 for black and 1 for white)
    * @param {boolean} isWhite generate moves for black or white
    * @returns {[Array<number>, number, number, number]} bestmove, moveValue, posCount, calcTime
    */
    makeBestMove(board, depth, isWhite) {
        this.positionCount = 0;

        const startTime = performance.now();
        const newBoard = board.clone();

        const [bestMove, moveValue] = this.getBestMove(
            newBoard,
            depth,
            Number.NEGATIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            isWhite
        );
        const endTime = performance.now();
        return [bestMove, moveValue, this.positionCount, endTime - startTime];
    }
    
    /**
     * Recursively calls itself until the best move is found
     * @param {Board} board the current board
     * @param {number} depth search depth
     * @param {number} alpha for pruning
     * @param {number} beta for pruning
     * @param {boolean} isMaximizer for pruning
     * @returns {[Array<number>| null, number]}
     */
    getBestMove(board, depth, alpha, beta, isMaximizer) {
        const moves = this.generateMoves(board, isMaximizer);

        if (depth === 0) {
            const value = this.evaluateBoard(board);
            return [null, value];
        }

        if (moves.length === 0) {
            // Stalemate is evaluated as equal
            if (!board.isKingInCheck(isMaximizer)) {
                return [null, 0];
            }
            if (isMaximizer) {
                return [null, -(MATE_VALUE + depth)];
            }
            return [null, MATE_VALUE + depth];
        }


        let maxValue = Number.NEGATIVE_INFINITY;
        let minValue = Number.POSITIVE_INFINITY;
        let bestMove;

        for (let i = 0, n = moves.length; i < n; i++) {
            this.positionCount++;

            const curMove = moves[i];
            const newBoard = board.clone();

            newBoard.testMove(curMove[2], curMove[0], curMove[1]);
            let [childBestMove, childBestMoveValue] = this.getBestMove(
                newBoard,
                depth - 1,
                alpha,
                beta,
                !isMaximizer
            );

            newBoard.undoLastMove();

            if (isMaximizer) {
                if (childBestMoveValue > maxValue) {
                    maxValue = childBestMoveValue;
                    bestMove = curMove;
                }
                if (childBestMoveValue > alpha) {
                    alpha = childBestMoveValue;
                }
            } else {
                if (childBestMoveValue < minValue) {
                    minValue = childBestMoveValue;
                    bestMove = curMove;
                }
                if (childBestMoveValue < beta) {
                    beta = childBestMoveValue;
                }
            }
            if (alpha >= beta) {
                break;
            }
        }

        return [bestMove, isMaximizer ? maxValue : minValue];
    }
}
