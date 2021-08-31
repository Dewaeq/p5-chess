class Evaluation {
    /**
     * @param {Board} board 
     */
    evaluate(board) {
        this.board = board;
        let whiteEval = 0;
        let blackEval = 0;

        const whiteMaterial = this.countMaterial(WHITE_INDEX);
        const blackMaterial = this.countMaterial(BLACK_INDEX);

        const whiteMaterialNoPawns = whiteMaterial - this.board.pawns[WHITE_INDEX].numPieces * PAWN_VALUE;
        const blackMaterialNoPawns = whiteMaterial - this.board.pawns[BLACK_INDEX].numPieces * PAWN_VALUE;
        const whiteEndgamePhaseWeight = this.endgamePhaseWeight(whiteMaterialNoPawns);
        const blackEndgamePhaseWeight = this.endgamePhaseWeight(blackMaterialNoPawns);

        whiteEval += whiteMaterial;
        blackEval += blackMaterial;
        whiteEval += this.mopupEval(WHITE_INDEX, BLACK_INDEX, whiteMaterial, blackMaterial, whiteEndgamePhaseWeight);
        blackEval += this.mopupEval(BLACK_INDEX, WHITE_INDEX, blackMaterial, whiteMaterial, blackEndgamePhaseWeight);

        whiteEval += this.evaluatePiecePosition(WHITE_INDEX, blackEndgamePhaseWeight);
        blackEval += this.evaluatePiecePosition(BLACK_INDEX, whiteEndgamePhaseWeight);

        const evaluation = whiteEval - blackEval;
        return (this.board.whiteToMove) ? evaluation : -evaluation;
    }

    endgamePhaseWeight(materialNoPawns) {
        const multiplier = 1 / ENDGAME_MATERIAL_START;
        return 1 - Math.min(1, materialNoPawns * multiplier);
    }

    mopupEval(friendlyIndex, opponentIndex, myMaterial, opponentMaterial, endgameWeight) {
        let mopupScore = 0;
        if ((myMaterial > opponentMaterial + PAWN_VALUE * 2) && (endgameWeight > 0)) {
            const friendlyKingSquare = this.board.kingSquares[friendlyIndex];
            const opponentKingSquare = this.board.kingSquares[opponentIndex];

            mopupScore += PrecomputedData.CentreManhattanDistance[opponentKingSquare] * 10;
            mopupScore += (14 - PrecomputedData.NumRookMovesToSquare(friendlyKingSquare, opponentKingSquare)) * 4;

            // Bitwise OR to round to int
            return ((mopupScore * endgameWeight) | 0);
        }

        return 0;
    }

    countMaterial(colourIndex) {
        let material = 0;
        material += this.board.pawns[colourIndex].numPieces * PAWN_VALUE;
        material += this.board.knights[colourIndex].numPieces * KNIGHT_VALUE;
        material += this.board.bishops[colourIndex].numPieces * BISHOP_VALUE;
        material += this.board.rooks[colourIndex].numPieces * ROOK_VALUE;
        material += this.board.queens[colourIndex].numPieces * QUEEN_VALUE;

        return material;
    }

    evaluatePiecePosition(colourIndex, endgamePhaseWeight) {
        let value = 0;
        const isWhite = (colourIndex === WHITE_INDEX);

        value += this.countPieceListPositionalValue(PAWN_POSITIONAL_VALUE, this.board.pawns[colourIndex], isWhite);
        value += this.countPieceListPositionalValue(KNIGHT_POSITIONAL_VALUE, this.board.knights[colourIndex], isWhite);
        value += this.countPieceListPositionalValue(BISHOP_POSITIONAL_VALUE, this.board.bishops[colourIndex], isWhite);
        value += this.countPieceListPositionalValue(ROOK_POSITIONAL_VALUE, this.board.rooks[colourIndex], isWhite);
        value += this.countPieceListPositionalValue(QUEEN_POSITIONAL_VALUE, this.board.queens[colourIndex], isWhite);
        const kingEarlyPhase = this.getPstValue(KING_POSITIONAL_VALUE, this.board.kingSquares[colourIndex], isWhite);
        // Bitwise OR to round to int
        value += (kingEarlyPhase * (1 - endgamePhaseWeight)) | 0;

        return value;
    }

    countPieceListPositionalValue(table, pieceList, isWhite) {
        let value = 0;

        for (let i = 0; i < pieceList.numPieces; i++) {
            value += this.getPstValue(table, pieceList.occupiedSquares[i], isWhite);
        }

        return value;
    }

    getPstValue(table, square, isWhite) {
        if (isWhite) {
            const file = BoardRepresentation.FileIndex(square);
            let rank = BoardRepresentation.RankIndex(square);

            rank = 7 - rank;
            square = rank * 8 + file;
        }

        return table[square];
    }

}