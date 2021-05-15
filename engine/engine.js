class Engine {

    generateMoves(board, isWhite) {
        // let pieces = mainBoard.pieces.filter(piece => !piece.taken && piece.isWhite === isWhite);
        const pieces = board.pieces;
        let moves = [];

        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].taken || pieces[i].isWhite !== isWhite) continue;

            let pieceMoves = pieces[i].getPossibleMoves(board).allowedMoves;
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

    evaluateMove(move, board) {
        board.testMove(move[2], move[0], move[1]);

        if (board.pieces[board.blKingInd].taken) console.log("fking bs");
        if (board.pieces[board.whKingInd].taken) console.log("fking white bs");

        const result = this.evaluateBoard(board);
        board.undoLastMove();

        return result;
    }

    minimaxRoot(board, depth, isMaximizing) {
        const moves = this.generateMoves(board, false);
        let bestMoveValue = -9999;
        let bestMoveFound;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            board.testMove(move[2], move[0], move[1]);

            const moveValue = this.minimax(board, depth - 1, -10000, 10000, !isMaximizing);
            board.undoLastMove();

            if (moveValue >= bestMoveValue) {
                bestMoveValue = moveValue;
                bestMoveFound = move;
            }
        }
        return [bestMoveFound, bestMoveValue];
    }

    minimax(board, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard(board);
        }

        const moves = engine.generateMoves(board, false);


        if (isMaximizing) {
            let bestMoveValue = -9999;
            for (let i = 0; i < moves.length; i++) {
                board.testMove(moves[i][2], moves[i][0], moves[i][1]);
                bestMoveValue = Math.max(
                    bestMoveValue,
                    this.minimax(board, depth - 1, alpha, beta, !isMaximizing)
                );
                board.undoLastMove();
                alpha = Math.max(alpha, bestMoveValue);
                if (beta <= alpha) {
                    return bestMoveValue;
                }
            }
            return bestMoveValue;
        } else {
            let bestMoveValue = 9999;
            for (let i = 0; i < moves.length; i++) {
                board.testMove(moves[i][2], moves[i][0], moves[i][1]);
                bestMoveValue = Math.min(
                    bestMoveValue,
                    this.minimax(board, depth - 1, alpha, beta, !isMaximizing)
                );
                board.undoLastMove();
                beta = Math.min(beta, bestMoveValue);
                if (beta <= alpha) {
                    return bestMoveValue;
                }
            }
            return bestMoveValue;
        }
    }
}