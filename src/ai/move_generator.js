class MoveGenerator {
	constructor() {
		/**@type {Move[]} */
		this.moves;
		this.isWhiteToMove;
		/**@type {PIECE_WHITE | PIECE_BLACK} */
		this.playerColour;
		/**@type {PIECE_WHITE | PIECE_BLACK} */
		this.opponentColour;
		this.playerKingSquare;
		/**@type {0 | 1} */
		this.playerColourIndex;
		/**@type {0 | 1} */
		this.opponentColourIndex;

		this.inCheck;
		this.inDoubleCheck;

		/**@type {Board} */
		this.board;
		this.genQuiets;
		/**@type {PROMOTION_MODE_ALL | PROMOTION_MODE_QUEEN_KNIGHT} */
		this.promotionsToGenerate;
	}

	init(board) {
		this.board = board;
		this.promotionsToGenerate = PROMOTION_MODE_ALL;
		this.moves = [];
		this.inCheck = false;
		this.inDoubleCheck = false;

		this.isWhiteToMove = this.board.colourToMove === PIECE_WHITE;
		this.playerColour = this.board.colourToMove;
		this.opponentColour = this.board.opponentColour;
		this.playerColourIndex = this.board.colourToMoveIndex;
		this.opponentColourIndex = 1 - this.board.colourToMoveIndex;

		this.playerKingSquare = this.board.kingSquares[this.board.colourToMoveIndex];
	}
	/**
	 * @param {Board} board
	 * @param {boolean} includeQuietMoves
	 */
	generateMoves(board, includeQuietMoves = true) {
		this.genQuiets = includeQuietMoves;

		this.init(board);

		const numOfChecks = this.isSquareAttacked(this.playerKingSquare, true, 2);
		if (numOfChecks > 0) this.inCheck = true;
		if (numOfChecks > 1) this.inDoubleCheck = true;

		this.generateKingMoves();

		// Only king moves are valid when in double check
		if (this.inDoubleCheck) return this.moves;

		this.generateSlidingMoves();
		this.generateKnightMoves();
		this.generatePawnMoves();

		return this.moves;
	}

	generateKingMoves() {
		for (let i = 0; i < PrecomputedData.KingMoves[this.playerKingSquare].length; i++) {
			const targetSquare = PrecomputedData.KingMoves[this.playerKingSquare][i];
			const pieceOnTargetSquare = this.board.squares[targetSquare];

			if (Piece.IsColour(pieceOnTargetSquare, this.playerColour)) continue;

			const isCapture = Piece.IsColour(pieceOnTargetSquare, this.opponentColour);
			const squareIsAttacked = this.isSquareAttacked(targetSquare);

			// Skip when not generating quiet moves or when the square is under attack
			if (!isCapture && !this.genQuiets) continue;
			if (squareIsAttacked) continue;

			if (this.inCheck && !this.moveBlocksCheck(this.playerKingSquare, targetSquare)) continue;

			this.moves.push(Move.MoveWithSquares(this.playerKingSquare, targetSquare));

			// Castling
			if (this.inCheck || isCapture) continue;

			// Castle kingside
			if ((targetSquare === F1 || targetSquare === F8) && this.hasCastleKingsideRight()) {
				const castleSquare = targetSquare + 1;
				if (this.board.squares[castleSquare] === PIECE_NONE && !this.isSquareAttacked(castleSquare)) {
					this.moves.push(Move.MoveWithFlag(this.playerKingSquare, castleSquare, Move.Flag.Castling));
				}
			}
			// Castle queenside
			if ((targetSquare === D1 || targetSquare === D8) && this.hasCastleQueensideRight) {
				const castleSquare = targetSquare - 1;
				if (this.board.squares[castleSquare] === PIECE_NONE && !this.isSquareAttacked(castleSquare)) {
					this.moves.push(Move.MoveWithFlag(this.playerKingSquare, castleSquare, Move.Flag.Castling));
				}
			}

		}
	}

	generateSlidingMoves() {
		const rooks = this.board.rooks[this.playerColourIndex];
		for (let i = 0; i < rooks.numPieces; i++) {
			this.generateSlidingPieceMoves(rooks.occupiedSquares[i], 0, 4);
		}
		const bishops = this.board.bishops[this.playerColourIndex];
		for (let i = 0; i < bishops.numPieces; i++) {
			this.generateSlidingPieceMoves(bishops.occupiedSquares[i], 4, 8);
		}
		const queens = this.board.queens[this.playerColourIndex];
		for (let i = 0; i < queens.numPieces; i++) {
			this.generateSlidingPieceMoves(queens.occupiedSquares[i], 0, 8);
		}
	}

	generateSlidingPieceMoves(startSquare, startDirIndex, endDirIndex) {
		mainLoop: for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex++) {
			const curDirOffset = PrecomputedData.DirectionOffsets[dirIndex];
			for (let i = 0; i < PrecomputedData.SqToEdge[startSquare][dirIndex]; i++) {
				const targetSquare = startSquare + curDirOffset * (i + 1);
				const pieceOnTargetSquare = this.board.squares[targetSquare];

				// Blocked by friendly piece
				if (Piece.IsColour(pieceOnTargetSquare, this.playerColour)) break;

				const isCapture = pieceOnTargetSquare !== PIECE_NONE;
				const moveBlocksCheck = this.moveBlocksCheck(startSquare, targetSquare);

				// Cant move in this direction if it results in a check
				if (moveBlocksCheck && !this.inCheck) break;

				// If this move fixes the check, further moves won't,
				// so we can stop generating moves for this piece
				if (moveBlocksCheck && this.inCheck) {
					this.moves.push(Move.MoveWithSquares(startSquare, targetSquare));
					break mainLoop;
				}

				if (!this.inCheck) {
					if (this.genQuiets || isCapture) {
						this.moves.push(Move.MoveWithSquares(startSquare, targetSquare));
					}
				}

				// Stop searching if there is a capture
				if (isCapture) {
					break;
				}
			}
		}
	}

	generateKnightMoves() {
		const knights = this.board.knights[this.playerColourIndex];

		for (let i = 0; i < knights.numPieces; i++) {
			const startSquare = knights.occupiedSquares[i];

			for (let j = 0; j < PrecomputedData.KnightMoves[startSquare].length; j++) {
				const targetSquare = PrecomputedData.KnightMoves[startSquare][j];
				const pieceOnTargetSquare = this.board.squares[targetSquare];

				// Blocked by friendly piece
				if (Piece.IsColour(pieceOnTargetSquare, this.playerColour)) continue;

				const isCapture = pieceOnTargetSquare !== PIECE_NONE;
				const moveBlocksCheck = this.moveBlocksCheck(startSquare, targetSquare);

				// Cant move in if it results in a check
				if (moveBlocksCheck && !this.inCheck) break;

				if (!this.inCheck || moveBlocksCheck) {
					if (this.genQuiets || isCapture) {
						this.moves.push(Move.MoveWithSquares(startSquare, targetSquare));
					}
				}
			}
		}
	}

	generatePawnMoves() {
		const pawns = this.board.pawns[this.playerColourIndex];
		const dirOffset = this.isWhiteToMove ? 8 : -8;
		const startRank = this.isWhiteToMove ? 1 : 6;
		const rankBeforePromotion = 7 - startRank;

		const epFile = ((this.board.currentGameState >> 4) & 15) - 1;
		let epSquare = -1;
		if (epFile !== -1) {
			epSquare = (this.isWhiteToMove ? 5 : 2) * 8 + epFile;
		}


		for (let i = 0; i < pawns.numPieces; i++) {
			const startSquare = pawns.occupiedSquares[i];
			const rank = BoardRepresentation.RankIndex(startSquare);
			const canPromote = (rank === rankBeforePromotion);

			if (this.genQuiets) {
				const oneSquareAhead = startSquare + dirOffset;

				if (this.board.squares[oneSquareAhead] === PIECE_NONE) {
					let moveBlocksCheck = this.moveBlocksCheck(startSquare, oneSquareAhead);
					// Move is valid when we're in check and it blocks a check
					// or when we're not in check and it doesn't cause a check
					if (this.inCheck === moveBlocksCheck) {
						if (canPromote) {
							this.addPromotions(startSquare, oneSquareAhead);
						} else {
							this.moves.push(Move.MoveWithSquares(startSquare, oneSquareAhead));
						}
					}

					if (rank === startRank) {
						const twoSquaresAhead = oneSquareAhead + dirOffset;
						moveBlocksCheck = this.moveBlocksCheck(startSquare, twoSquaresAhead);
						if (this.board.squares[twoSquaresAhead] === PIECE_NONE) {
							// Move is valid when we're in check and it blocks a check
							// or when we're not in check and it doesn't cause a check
							if (this.inCheck === moveBlocksCheck) {
								this.moves.push(Move.MoveWithFlag(startSquare, twoSquaresAhead, Move.Flag.PawnDoubleForward));
							}
						}
					}
				}
			}

			// Captures
			for (let j = 0; j < 2; j++) {
				const captureDirIndex = PrecomputedData.PawnAttackDirectionIndices[this.playerColourIndex][j];
				if (PrecomputedData.SqToEdge[startSquare][captureDirIndex] === 0) continue;

				const captureDir = PrecomputedData.DirectionOffsets[captureDirIndex];
				const targetSquare = startSquare + captureDir;
				const pieceOnTargetSquare = this.board.squares[targetSquare];

				// En-passant capture
				if (targetSquare === epSquare) {
					const epPawnSquare = epSquare - dirOffset;
					const epBlocksCheck = this.enPassantBlocksCheck(startSquare, targetSquare, epPawnSquare);

					// Move is valid when we're in check and it blocks a check
					// or when we're not in check and it doesn't cause a check
					if (this.inCheck === epBlocksCheck) {
						this.moves.push(Move.MoveWithFlag(startSquare, targetSquare, Move.Flag.EnPassantCapture));
					}
				}
				// Normal capture
				if (pieceOnTargetSquare === PIECE_NONE || Piece.IsColour(pieceOnTargetSquare, this.playerColour)) continue;

				const moveBlocksCheck = this.moveBlocksCheck(startSquare, targetSquare);
				if (this.inCheck === moveBlocksCheck) {
					if (canPromote) {
						this.addPromotions(startSquare, targetSquare)
					}
					else {
						this.moves.push(Move.MoveWithSquares(startSquare, targetSquare));
					}
				}

			}
		}
	}

	addPromotions(startSquare, targetSquare) {
		this.moves.push(Move.MoveWithFlag(startSquare, targetSquare, Move.Flag.PromoteToQueen));
		this.moves.push(Move.MoveWithFlag(startSquare, targetSquare, Move.Flag.PromoteToKnight));

		if (this.promotionsToGenerate === PROMOTION_MODE_ALL) {
			this.moves.push(Move.MoveWithFlag(startSquare, targetSquare, Move.Flag.PromoteToBishop));
			this.moves.push(Move.MoveWithFlag(startSquare, targetSquare, Move.Flag.PromoteToRook));
		}
	}

	/**
	 * @param {number} startSquare 
	 * @param {number} targetSquare
	 * @returns {boolean} 
	 */
	moveBlocksCheck(startSquare, targetSquare) {
		const movingPiece = this.board.squares[startSquare];
		const pieceOnTargetSquare = this.board.squares[targetSquare];

		let isKingMove = false;

		if (startSquare === this.playerKingSquare) {
			this.playerKingSquare = targetSquare;
			isKingMove = true;
		}

		this.board.squares[startSquare] = PIECE_NONE;
		this.board.squares[targetSquare] = movingPiece;

		const isInCheck = this.isSquareAttacked(this.playerKingSquare);

		this.board.squares[startSquare] = movingPiece;
		this.board.squares[targetSquare] = pieceOnTargetSquare;

		if (isKingMove) {
			this.playerKingSquare = startSquare;
		}

		if (this.inCheck !== isInCheck) return true;
		return false;
	}

	enPassantBlocksCheck(startSquare, targetSquare, epPawnSquare) {
		const movingPawn = this.board.squares[startSquare];
		const epPawn = this.board.squares[epPawnSquare];

		this.board.squares[startSquare] = PIECE_NONE;
		this.board.squares[epPawnSquare] = PIECE_NONE;
		this.board.squares[targetSquare] = movingPawn;

		const isInCheck = this.isSquareAttacked(this.playerKingSquare);

		this.board.squares[startSquare] = movingPawn;
		this.board.squares[targetSquare] = PIECE_NONE;
		this.board.squares[epPawnSquare] = epPawn;

		if (this.inCheck !== isInCheck) return true;
		return false;
	}

	isSquareAttacked(targetSquare, countAttacks = false, attackLimit) {
		let attackCount = 0;
		if (this.isSquareAttackedByKing(targetSquare)) {
			if (!countAttacks) return true;
			attackCount++;
			if (attackLimit !== undefined && attackCount >= attackLimit) return attackCount;
		}
		if (this.isSquareAttackedByKnight(targetSquare)) {
			if (!countAttacks) return true;
			attackCount++;
			if (attackLimit !== undefined && attackCount >= attackLimit) return attackCount;
		}
		if (this.isSquareAttackedByBishop(targetSquare)) {
			if (!countAttacks) return true;
			attackCount++;
			if (attackLimit !== undefined && attackCount >= attackLimit) return attackCount;
		}
		if (this.isSquareAttackedByRook(targetSquare)) {
			if (!countAttacks) return true;
			attackCount++;
			if (attackLimit !== undefined && attackCount >= attackLimit) return attackCount;
		}
		if (this.isSquareAttackedByQueen(targetSquare)) {
			if (!countAttacks) return true;
			attackCount++;
			if (attackLimit !== undefined && attackCount >= attackLimit) return attackCount;
		}
		if (this.isSquareAttackedByPawn(targetSquare)) {
			if (!countAttacks) return true;
			attackCount++;
			if (attackLimit !== undefined && attackCount >= attackLimit) return attackCount;
		}

		return (countAttacks) ? attackCount : false;
	}

	isSquareAttackedByKing(targetSquare) {
		for (let i = 0; i < PrecomputedData.KingMoves[targetSquare].length; i++) {
			const startSquare = PrecomputedData.KingMoves[targetSquare][i];
			if (this.board.squares[startSquare] === (this.opponentColour | PIECE_KING)) return true;
		}
		return false;
	}

	isSquareAttackedByKnight(targetSquare) {
		for (let i = 0; i < PrecomputedData.KnightMoves[targetSquare].length; i++) {
			const startSquare = PrecomputedData.KnightMoves[targetSquare][i];
			if (this.board.squares[startSquare] === (this.opponentColour | PIECE_KNIGHT)) return true;
		}
		return false;
	}

	isSquareAttackedByBishop(targetSquare) {
		for (let directionIndex = 4; directionIndex < 8; directionIndex++) {
			const curDirection = PrecomputedData.DirectionOffsets[directionIndex];
			for (let i = 0; i < PrecomputedData.SqToEdge[targetSquare][directionIndex]; i++) {
				const startSquare = targetSquare + curDirection * (i + 1);
				if (this.board.squares[startSquare] === (this.opponentColour | PIECE_BISHOP)) return true;
				// There is a piece on the square and it's not a bishop from the opponent,
				// so stop the search in this direction
				if (this.board.squares[startSquare] !== PIECE_NONE) break;
			}
		}
		return false;
	}

	isSquareAttackedByRook(targetSquare) {
		for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
			const curDirection = PrecomputedData.DirectionOffsets[directionIndex];
			for (let i = 0; i < PrecomputedData.SqToEdge[targetSquare][directionIndex]; i++) {
				const startSquare = targetSquare + curDirection * (i + 1);
				if (this.board.squares[startSquare] === (this.opponentColour | PIECE_ROOK)) return true;
				// There is a piece on the square and it's not a rook from the opponent,
				// so stop the search in this direction
				if (this.board.squares[startSquare] !== PIECE_NONE) break;
			}
		}
		return false;
	}

	isSquareAttackedByQueen(targetSquare) {
		for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
			const curDirection = PrecomputedData.DirectionOffsets[directionIndex];
			for (let i = 0; i < PrecomputedData.SqToEdge[targetSquare][directionIndex]; i++) {
				const startSquare = targetSquare + curDirection * (i + 1);
				if (this.board.squares[startSquare] === (this.opponentColour | PIECE_QUEEN)) return true;
				// There is a piece on the square and it's not a queen from the opponent,
				// so stop the search in this direction
				if (this.board.squares[startSquare] !== PIECE_NONE) break;
			}
		}
		return false;
	}

	isSquareAttackedByPawn(targetSquare) {
		// Reversed attack lists to find attacking pawn
		const pawnAttacks = (this.opponentColour === PIECE_WHITE)
			? PrecomputedData.PawnAttacksBlack[targetSquare]
			: PrecomputedData.PawnAttacksWhite[targetSquare];
		for (let i = 0; i < pawnAttacks.length; i++) {
			const startSquare = pawnAttacks[i];
			if (this.board.squares[startSquare] === (this.opponentColour | PIECE_PAWN)) return true;
		}
		return false;
	}

	hasCastleKingsideRight() {
		const mask = (this.board.whiteToMove) ? 1 : 4;
		return ((this.board.currentGameState & mask) !== 0);
	}

	hasCastleQueensideRight() {
		const mask = (this.board.whiteToMove) ? 2 : 8;
		return ((this.board.currentGameState & mask) !== 0);
	}
}
