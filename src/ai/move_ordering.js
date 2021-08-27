class MoveOrdering {
    constructor(moveGenerator) {
        this.moveGenerator = moveGenerator;
        this.moveScores = Array(218);
    }
    /**
     * @param {Board} board 
     * @param {Move[]} moves 
     */
    orderMoves(board, moves) {
        this.board = board;
        for (let i = 0; i < moves.length; i++) {
            let score = 0;
            const movePieceType = Piece.PieceType(gameManager.board.squares[moves[i].startSquare]);
            const capturePiecetype = Piece.PieceType(gameManager.board.squares[moves[i].targetSquare]);
            const flag = moves[i].flag;

            if (capturePiecetype !== PIECE_NONE) {
                score = 10 * MoveOrdering.GetPieceValue(capturePiecetype) - MoveOrdering.GetPieceValue(movePieceType);
            }

            if (movePieceType === PIECE_PAWN) {
                switch (flag) {
                    case Move.Flag.PromoteToKnight:
                        score += KNIGHT_VALUE;
                    case Move.Flag.PromoteToBishop:
                        score += BISHOP_VALUE;
                    case Move.Flag.promoteToRook:
                        score += ROOK_VALUE;
                    case Move.Flag.PromoteToQueen:
                        score += QUEEN_VALUE;
                    default:
                        break;
                }
            }

            this.moveScores[i] = score;
        }

        this.sort(moves);
    }

    sort(moves) {
        for (let i = 0; i < moves.length - 1; i++) {
            for (let j = i + 1; j > 0; j--) {
                const swapIndex = j - 1;
                if (this.moveScores[swapIndex] < this.moveScores[j]) {
                    [moves[j], moves[swapIndex]] = [moves[swapIndex], moves[j]];
                    [this.moveScores[j], this.moveScores[swapIndex]] = [this.moveScores[swapIndex], this.moveScores[j]];
                }
            }
        }
    }

    static GetPieceValue(pieceType) {
        switch (pieceType) {
            case PIECE_PAWN:
                return PAWN_VALUE;
            case PIECE_KNIGHT:
                return KNIGHT_VALUE;
            case PIECE_BISHOP:
                return BISHOP_VALUE;
            case PIECE_ROOK:
                return ROOK_VALUE;
            case PIECE_QUEEN:
                return QUEEN_VALUE;
            default:
                return 0;
        }
    }
}