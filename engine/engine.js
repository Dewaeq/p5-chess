class Engine {
    generateMoves(board, isWhite) {
        // let pieces = mainBoard.pieces.filter(piece => !piece.taken && piece.isWhite === isWhite);
        let moves = [];

        for (let i = 0; i < board.pieces.length; i++) {
            if (board.pieces[i].taken || board.pieces[i].isWhite !== isWhite)
                continue;

            let pieceMoves =
                board.pieces[i].getPossibleMoves(board).allowedMoves;

            moves.push(...pieceMoves);
        }

        return moves;
    }

    // Positive values mean white is in the advantage,
    // negative mean black is
    evaluateBoard(board) {
        if (board.pieces[board.whKingInd].taken) {
            console.log("oh ow");
            return Number.NEGATIVE_INFINITY;
        }
        if (board.pieces[board.blKingInd].taken) {
            console.log("oh ow");
            return Number.POSITIVE_INFINITY;
        }

        let blackMaterial = 0;
        let whiteMaterial = 0;
        let blackPositional = 0;
        let whitePositional = 0;

        for (let i = 0; i < board.pieces.length; i++) {
            const piece = board.pieces[i];

            if (piece.taken || piece.x < 0 || piece.y < 0) continue;

            if (piece.isWhite) {
                whiteMaterial += VALUE_MAP[piece.type] ?? 0;
                whitePositional +=
                    POSITIONAL_VALUE[true][piece.type][piece.y][piece.x] ?? 0;
            } else {
                blackMaterial += VALUE_MAP[piece.type] ?? 0;
                blackPositional +=
                    POSITIONAL_VALUE[false][piece.type][piece.y][piece.x] ?? 0;
            }
        }

        const materialDifference = whiteMaterial - blackMaterial;
        const positionalDifference = whitePositional - blackPositional;

        return materialDifference + positionalDifference;
    }

    evaluateMove(move, board) {
        board.testMove(move[2], move[0], move[1]);

        if (board.pieces[board.blKingInd].taken) {
            console.log("fking black bs");
            return Number.POSITIVE_INFINITY;
        }
        if (board.pieces[board.whKingInd].taken) {
            console.log("fking white bs");
            return Number.NEGATIVE_INFINITY;
        }

        const result = this.evaluateBoard(board);
        board.undoLastMove();
        board.lastMove = [];

        return result;
    }

    // returns [bestMove, bestMoveValue, positionCount, calculationTime]
    makeBestMove(board, depth, isWhite) {
        this.positionCount = 0;
        const startTime = performance.now();
        const [bestMove, moveValue] = this.getBestMove(
            board.clone(),
            depth,
            Number.NEGATIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            false
        );
        const endTime = performance.now();
        return [bestMove, moveValue, this.positionCount, (endTime - startTime)];
    }

    getBestMove(board, depth, alpha, beta, isMaximizer) {
        const moves = this.generateMoves(board, isMaximizer);

        if (depth === 0 || moves.length === 0) {
            const value = this.evaluateBoard(board);
            return [null, value];
        }

        let maxValue = Number.NEGATIVE_INFINITY;
        let minValue = Number.POSITIVE_INFINITY;
        let bestMove;

        for (let i = 0; i < moves.length; i++) {
            this.positionCount++;

            const curMove = moves[i];
            const newBoard = board.clone();
            newBoard.testMove(curMove[2], curMove[0], curMove[1]);
            const [childBestMove, childBestMoveValue] = this.getBestMove(
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
