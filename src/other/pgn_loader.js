class PGNLoader {
    /**
     * @param {string} pgn 
     * @param {number} maxMoveCount 
     * @returns {Move[]}
     */
    static MovesFromPGN(pgn, maxMoveCount) {
        const entries = pgn.split(" ");
        let algebraicMoves = [];

        for (let i = 0; i < entries.length; i++) {
            if (algebraicMoves.length === maxMoveCount) {
                break;
            }

            const entry = entries[i].trim();

            if (entry === "1/2-1/2" || entry === "0-1" || entry === "1-0") {
                break;
            }

            if (!isEmptyString(entry)) {
                algebraicMoves.push(entry);
            }
        }

        return this.MovesFromAlgebraic(algebraicMoves);
    }

    /**
     * @param {string[]} algebraicMoves 
     * @returns {Move[]}
     */
    static MovesFromAlgebraic(algebraicMoves) {
        const board = new Board();
        board.fenToBoard(fenStartString);
        let moves = [];

        for (let i = 0; i < algebraicMoves.length; i++) {
            const move = this.MoveFromAlgebraic(board, algebraicMoves[i]);

            if (move === INVALID_MOVE) {
                console.log(move);
                console.trace();
                console.log(algebraicMoves);
                throw ("f");
            }

            moves.push(move);
            board.makeMove(move);
            gameManager.gui.show();
        }

        return moves;
    }

    /**
     * @param {Board} board 
     * @param {string} algebraicMove 
     * @returns {Move}
     */
    static MoveFromAlgebraic(board, algebraicMove) {
        const moveGen = new MoveGenerator();
        const allMoves = moveGen.generateMoves(board);

        for (const move of allMoves) {
            const startSquare = move.startSquare;
            const targetSquare = move.targetSquare;
            const [startFile, startRank] = BoardRepresentation.CoordFromIndex(startSquare);
            const [targetFile, targetRank] = BoardRepresentation.CoordFromIndex(targetSquare);

            const movePieceType = Piece.PieceType(board.squares[startSquare]);
            const isCapture = algebraicMove.includes("x");

            // Castling
            if (algebraicMove === "O-O") {
                if (movePieceType === PIECE_KING && (targetSquare === G1 || targetSquare === G8)) {
                    return move;
                }
                continue;
            } else if (algebraicMove === "O-O-O") {
                if (movePieceType === PIECE_KING && (targetSquare === C1 || targetSquare === C8)) {
                    return move;
                }
                continue;
            }

            // Pawn move
            if (!isUppercase(algebraicMove[0])) {
                const algebraicStartFile = BoardRepresentation.FileNames.indexOf(algebraicMove[0]);
                if (movePieceType !== PIECE_PAWN) {
                    continue;
                }

                // Normal pawn move
                if (algebraicMove.length === 2) {
                    const algebraicTargetSquare = BoardRepresentation.StringCoordToIndex(algebraicMove);
                    if (targetSquare === algebraicTargetSquare) {
                        return move;
                    }
                    continue;
                }

                // Pawn capture
                if (isCapture && !algebraicMove.includes("=")) {
                    const algebraicTargetSquare = BoardRepresentation.StringCoordToIndex(algebraicMove.slice(2));
                    if (startFile === algebraicStartFile && targetSquare === algebraicTargetSquare) {
                        return move;
                    }
                    continue;
                }

                // Promotion
                if (algebraicMove.includes("=")) {
                    if (!move.isPromotion) {
                        continue;
                    }
                    let algebraicTargetSquare = BoardRepresentation.StringCoordToIndex(algebraicMove.slice(0, 2));
                    if (isCapture) {
                        algebraicTargetSquare = BoardRepresentation.StringCoordToIndex(algebraicMove.slice(2, 4));
                        if (startFile !== algebraicStartFile) {
                            continue;
                        }
                    }
                    if (move.targetSquare !== algebraicTargetSquare) {
                        continue;
                    }
                    let promotionType = algebraicMove.slice(-1)[0];
                    switch (promotionType) {
                        case "N":
                            if (move.flag === Move.Flag.PromoteToKnight) {
                                return move;
                            }
                            continue;
                        case "B":
                            if (move.flag === Move.Flag.PromoteToBishop) {
                                return move;
                            }
                            continue;
                        case "R":
                            if (move.flag === Move.Flag.PromoteToRook) {
                                return move;
                            }
                            continue;
                        case "Q":
                            if (move.flag === Move.Flag.PromoteToQueen) {
                                return move;
                            }
                            continue;
                        default:
                            continue;
                    }

                }
            }

            algebraicMove = algebraicMove.replace("x", "");

            if (PGNLoader.GetPieceTypeFromSymbol(algebraicMove[0]) !== movePieceType) {
                continue;
            }

            const algebraicTargetRank = parseInt(algebraicMove[algebraicMove.length - 1]) - 1;
            const algebraicTargetFile = BoardRepresentation.FileNames.indexOf(algebraicMove[algebraicMove.length - 2]);

            if (targetFile !== algebraicTargetFile || targetRank !== algebraicTargetRank) {
                continue;
            }

            if (algebraicMove.length === 3) {
                return move;
            }

            const differenceChar = algebraicMove[1];
            if (isNumeric(differenceChar)) {
                if (startRank === (parseInt(differenceChar) - 1)) {
                    return move;
                }
                continue;
            } else {
                if (startFile === BoardRepresentation.FileNames.indexOf(differenceChar)) {
                    return move;
                }
                continue;
            }
        };
        console.log(allMoves);
        console.log(algebraicMove);
        console.log(board);
        return INVALID_MOVE;
    }

    static GetPieceTypeFromSymbol(symbol) {
        switch (symbol) {
            case 'P':
                return PIECE_PAWN;
            case 'N':
                return PIECE_KNIGHT;
            case 'B':
                return PIECE_BISHOP;
            case 'R':
                return PIECE_ROOK;
            case 'Q':
                return PIECE_QUEEN;
            case 'K':
                return PIECE_KING;
            default:
                return PIECE_NONE;
        }
    }
}