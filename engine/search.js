class Search {
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
	}

	init(board) {
		this.board = board;
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

	}

	generateSlidingPieceMoves(startSquare, startDirIndex, endDirIndex) {
		for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex++) {
			const curDirOffset = PrecomputedData.DirectionOffsets[dirIndex];
			for (let i = 0; i < PrecomputedData.SqToEdge[startSquare][dirIndex]; i++) {
				const targetSquare = startSquare + curDirOffset * (i + 1);
				const pieceOnTargetSquare = this.board.squares[targetSquare];

				// Blocked by friendly piece
				if (Piece.IsColour(pieceOnTargetSquare, this.playerColour)) break;

				const isCapture = pieceOnTargetSquare !== PIECE_NONE;
			}
		}
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
		const pawnAttacks = (this.opponentColour === PIECE_WHITE) ? PrecomputedData.PawnAttacksWhite[targetSquare] : PrecomputedData.PawnAttacksBlack[targetSquare];
		for (let i = 0; i < pawnAttacks.length; i++) {
			const startSquare = pawnAttacks[i];
			if (this.board.squares[startSquare] === (this.opponentColour | PIECE_PAWN)) return true;
		}
		return false;
	}

	hasCastleKingsideRight() {
		const mask = (this.isWhiteToMove) ? 1 : 4;
		return (this.board.currentGameState & mask) !== 0;
	}

	hasCastleQueensideRight() {
		const mask = (this.isWhiteToMove) ? 2 : 8;
		return (this.board.currentGameState & mask) !== 0;
	}
}
